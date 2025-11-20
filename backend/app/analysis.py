from zhipuai import ZhipuAI
from datetime import datetime
import json
from .models import db, Paper
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

client = ZhipuAI(api_key="39f1dbb6c1f94c698b072bc6a60067df.zTt4wg3FEWGgdiZk")

def glm_analysis(content: str, system_prompt: str) -> dict:
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": content},
    ]
    try:
        response = client.chat.completions.create(
            model="glm-4-flash",
            messages=messages
        )
        markdown_content = response.choices[0].message.content.replace("```python", "").replace("```", "").strip()
        return {"glm_result": markdown_content}
    except:
        return {}

def keyword_suggest(content: str) -> dict:
    current_year = datetime.now().year  # Keep as is, but not used for filtering during testing
    prompt = '''Roleplay: You are now a professional paper recommendation expert. You can quickly provide users with suitable papers based on the keywords provided by the user.
        Task: Analyze and parse based on the keywords provided by the user, conduct a comprehensive analysis of the paper titles, and provide appropriate suggestions:
        1. From all these titles, select the 10 most suitable papers and give a suggestion score (0-10 points). The higher the score, the more suitable the recommendation; the lower the score, the less suitable.
        2. The output format is standard Python dictionary format, for example: {"arxiv_id": "2501.13106","title": "sample", "suggest_score": 8}
        3. Do not output any other useless information, only output the dictionary.
        4. If the fragment information is insufficient to fill any fields or cannot be determined, output an empty dictionary {}.
        5. Must output a valid, directly parsable Python dictionary string.
    '''
    sql = """
        SELECT title, id, img_link, like_num, github_num, publish_time
        FROM papers 
        WHERE title IS NOT NULL AND title != '' 
        ORDER BY month DESC, title ASC
    """
    try:
        result = db.session.execute(text(sql)).fetchall()
        titles = []
        index_dict = {}
        for row in result:
            if row[0]:
                titles.append(f"arxiv: {row[1]}, title: {row[0]}")
                index_dict.update({row[1]: {"title": row[0], "img_link": row[2], "like_num": row[3], "github_num": row[4], "publish_time": row[5]}})
    except SQLAlchemyError as e:
        print(f"[DEBUG] SQL query failed: {e}")
        titles = []
    except Exception as e:
        print(f"[DEBUG] Other error: {e}")
        titles = []
    
    title_content = "\n".join(titles)
    
    full_content = f"Keywords: {content}\nPaper title list:\n{title_content}"
    for _ in range(5):
        try:
            info = glm_analysis(full_content, prompt)['glm_result'].strip()
            glm_result = json.loads(info)
            for data in glm_result:
                info = index_dict[data['arxiv_id']]
                data.update(info)
            return glm_result
        except Exception:
            print("Failed, retrying...")
            continue
    return {}

def content_analysis(content: str) -> dict:
    prompt = '''Roleplay: You are now a professional paper analysis expert. You can quickly analyze based on the truncated paper information provided by the user.
        Task: Analyze and parse the paper fragment provided by the user, and provide a comprehensive structured summary of the paper:
        1. Extract the following key fields (if there is no relevant information in the fragment, leave the field as empty string ""):
        - Abstract core one-sentence summary (abstract_summary)
        - Research problem/objective (research_problem)
        - Core contributions (core_contribution, list 1-5 items)
        - Proposed method/model name (method_name)
        - Method innovation points (method_innovation, list 1-5 items)
        - Datasets (datasets, comma-separated)
        - Main experimental results (experimental_results, key metric values)
        - Ablation study conclusions (ablation_study, leave empty if none)
        - Limitations (limitations, leave empty if not mentioned)
        - Conclusion and future work (conclusion_and_future_work)
        2. The output format is standard Python dictionary format, for example:
        {"abstract_summary": "", ...}
        3. Do not output any other useless information, only output the dictionary.
        4. If the fragment information is insufficient to fill any fields or cannot be determined, output an empty dictionary {}.
        5. Must output a valid, directly parsable Python dictionary string (keys and values use double quotes, list fields represented as strings like "item1; item2").
    '''
    for _ in range(5):
        try:
            glm_result = json.loads(glm_analysis(content, prompt)['glm_result'].strip())
            return glm_result
        except Exception:
            continue
    return {}