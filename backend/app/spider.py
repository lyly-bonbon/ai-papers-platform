import os
import arxiv
import fitz
from tqdm import tqdm
from typing import List, Dict, Optional
import requests
from parsel import Selector
from datetime import datetime
from .models import db, Paper

headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en-US,en;q=0.9",
    "referer": "https://huggingface.co/papers/month/2025-09",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
}

def get_paper_detail(link: str):
    content_html = requests.get(link, headers=headers).text
    response = Selector(content_html)
    authors = '|'.join([data.strip() for data in response.xpath('//div[@class="relative flex flex-wrap items-center gap-2 text-base leading-tight"]//button/text()').extract()])
    abstract = ''.join(response.xpath('//p[@class="text-gray-600"]//text()').extract())
    publish_time = ' '.join(response.xpath('//div[contains(text(), "Published")]//text()').extract())
    return {"authors": authors, "abstract": abstract, 'publish_time': publish_time}

def parsel_html(content_html: str) -> List[Dict]:
    response = Selector(content_html)
    result = []
    for data in response.xpath('//article[@class="relative flex flex-col overflow-hidden rounded-xl border"]'):
        try:
            like_num = int(''.join(data.xpath('.//div[@class="leading-none"]/text()').extract())) if data.xpath('.//div[@class="leading-none"]/text()').extract() else 0
        except:
            like_num = 0
        author_num = ''.join(data.xpath('.//div[contains(@class, "flex truncate text-sm")]/text()').extract()).strip()
        github_num = ''.join(data.xpath('.//a[contains(@class, "flex translate-y-px items-center")]/span/text()').extract()).strip()
        comment_num = int(''.join(data.xpath('.//a[@slot="anchor"]/text()').extract()).strip()) if data.xpath('.//a[@slot="anchor"]/text()').extract() else 0
        link = "https://huggingface.co" + data.xpath('.//h3/a/@href').extract_first().strip()
        img_link = ''.join(data.xpath('./a/img/@src').extract())
        title = ''.join(data.xpath('.//h3/a/text()').extract()).strip().replace('\n', '').replace('\t', '')
        info_dict = get_paper_detail(link)
        save_dict = {
            "id": link.split('/')[-1],
            "link": link.replace('//', '/'),
            "title": title,
            "like_num": like_num,
            "img_link": img_link,
            "publish_time": info_dict['publish_time'],
            "author_num": author_num,
            "github_num": github_num,
            "comment_num": comment_num,
            "authors": info_dict['authors'],
            "abstract": info_dict['abstract']
        }
        result.append(save_dict)
    return result

def monthly_spider(year: int, month: int) -> Dict:
    if year < 2023 and month < 5:
        return {"info": "Error", "result": []}
    link = f"https://huggingface.co/papers/month/{str(year)}-{str(month).zfill(2)}"
    content_html = requests.get(link, headers=headers).text
    result = parsel_html(content_html)
    for item in result:
        existing = Paper.query.filter_by(title=item['title']).first()
        if not existing:
            paper = Paper(
                id=item['id'],
                title=item['title'],
                authors=item['authors'],  
                abstract=item['abstract'],  
                pdf_link=item['link'],
                publish_time=item['publish_time'],
                year=year,
                month=month,
                like_num=item['like_num'],
                author_num=item['author_num'],
                github_num=item['github_num'],
                comment_num=item['comment_num'],
                img_link=item['img_link']
            )
            db.session.add(paper)
    db.session.commit()
    return {"info": "Success", "result": result}

def daily_spider(year: int, month: int, day: int) -> Dict:
    if year < 2023 and month < 5 and day < 4:
        return {"info": "Error", "result": []}
    link = f"https://huggingface.co/papers/date/{str(year)}-{str(month).zfill(2)}-{str(day).zfill(2)}"
    content_html = requests.get(link, headers=headers).text
    result = parsel_html(content_html)
    for item in result:
        existing = Paper.query.filter_by(title=item['title']).first()
        if not existing:
            paper = Paper(
                id=item['id'],
                title=item['title'],
                authors=item['authors'],  
                abstract=item['abstract'],  
                pdf_link=item['link'],
                publish_time=item['publish_time'],
                year=year,
                month=month,
                like_num=item['like_num'],
                author_num=item['author_num'],
                github_num=item['github_num'],
                comment_num=item['comment_num'],
                img_link=item['img_link']
            )
            db.session.add(paper)
    db.session.commit()
    return {"info": "Success", "result": result}

def download_arxiv_pdf(arxiv_id: str, download_dir: str = "./arxiv_pdfs", keep_pdf: bool = True) -> Dict:
    os.makedirs(download_dir, exist_ok=True)
    clean_id = arxiv_id.split("v")[0] if "v" in arxiv_id else arxiv_id
    search = arxiv.Search(id_list=[arxiv_id])
    try:
        paper = next(arxiv.Client().results(search))
    except StopIteration:
        return {"error": f"arXiv ID {arxiv_id} not found or invalid"}
    title = paper.title
    authors = [author.name for author in paper.authors]
    pdf_url = paper.pdf_url
    published = paper.published.strftime("%Y-%m-%d")
    pdf_filename = f"{clean_id}.pdf"
    pdf_path = os.path.join(download_dir, pdf_filename)
    if not os.path.exists(pdf_path):
        paper.download_pdf(dirpath=download_dir, filename=pdf_filename)
    if not keep_pdf and os.path.exists(pdf_path):
        os.remove(pdf_path)
        pdf_path = None
    return {
        "arxiv_id": clean_id,
        "pdf_path": pdf_path,
        "title": title,
        "authors": authors,
        "pdf_url": pdf_url,
        "published": published,
    }

def extract_text_from_pdf(pdf_path: str, start_page: int = 0, end_page: int = 10) -> Optional[str]:
    if not pdf_path or not os.path.isfile(pdf_path):
        return None
    try:
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        if start_page < 0: start_page = 0
        if start_page >= total_pages: return None
        if end_page is None: end_page = total_pages - 1
        else: end_page = min(end_page, total_pages - 1)
        if end_page < start_page: return None
        pages_to_extract = list(range(start_page, end_page + 1))
        pages_text = [doc[i].get_text() for i in pages_to_extract]
        text = "\n".join(pages_text)
        doc.close()
        return text
    except Exception:
        return None