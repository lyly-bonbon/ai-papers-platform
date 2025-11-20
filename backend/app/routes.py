from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required
from .spider import monthly_spider, daily_spider, download_arxiv_pdf, extract_text_from_pdf
from .analysis import content_analysis, keyword_suggest
from .models import db, Paper, History, User
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import get_jwt_identity
from datetime import datetime

api_bp = Blueprint('api', __name__)

@api_bp.route('/collect/monthly', methods=['POST'])
@jwt_required()
def collect_monthly():
    data = request.json
    year, month = data['year'], data['month']
    result = monthly_spider(year, month)
    return jsonify(result)

@api_bp.route('/collect/daily', methods=['POST'])
@jwt_required()
def collect_daily():
    data = request.json
    year, month, day = data['year'], data['month'], data['day']
    result = daily_spider(year, month, day)
    return jsonify(result)

@api_bp.route('/query', methods=['POST'])
@jwt_required()
def query_papers():
    try:
        data = request.json or {}
        fields = data.get('fields', ['id'])
        if not fields:
            fields = ['id']
        limit = min(data.get('limit', 100), 100)
        where_clause = data.get('where', {})
        
        select_fields = ', '.join(fields)
        query_str = f"SELECT {select_fields} FROM papers"
        params = {'limit': limit}
        
        if where_clause:
            conditions = ' AND '.join([f"{k}=:{k}" for k in where_clause.keys()])  # Use :param named
            query_str += f" WHERE {conditions}"
            params.update(where_clause) 
        
        query_str += " LIMIT :limit"
        query = text(query_str)
        result = db.session.execute(query, params).fetchall()
        rows = []
        for row in result:
            row_dict = dict(row._asdict())
            rows.append(row_dict)
        return jsonify(rows)
    except SQLAlchemyError as e:
        return jsonify({'error': f'DB Error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Server Error: {str(e)}'}), 500

@api_bp.route('/assist/read', methods=['POST'])
@jwt_required()
def assist_read():
    data = request.json
    arxiv_id = data['arxiv_id']
    current_user = get_jwt_identity()  # Get current username
    user = User.query.filter_by(username=current_user).first()

    download_info = download_arxiv_pdf(arxiv_id)
    if 'error' in download_info:
        return jsonify(download_info), 400
    pdf_path = download_info['pdf_path']
    if pdf_path:
        text = extract_text_from_pdf(pdf_path, 0, 10)
        if text:
            analysis = content_analysis(text)
            from sqlalchemy import text
            sql = text("SELECT title, like_num, github_num, img_link FROM papers WHERE id = :arxiv_id")
            result = db.session.execute(sql, {"arxiv_id": arxiv_id}).first()
            if result:
                title, like_num, github_num, img_link = result
                history = History(
                    user_id=user.id,
                    arxiv_id=arxiv_id,
                    title=title,
                    like_num=like_num or 0,
                    github_num=github_num,
                    img_link=img_link,
                    access_time=datetime.utcnow()
                )
                db.session.add(history)
                db.session.commit()

            return jsonify({
                'pdf_url': download_info['pdf_url'],
                'analysis': analysis,
                'download_info': download_info
            })
    return jsonify({'error': 'Extraction failed'}), 400

@api_bp.route('/recommend', methods=['POST'])
@jwt_required()
def recommend():
    data = request.json
    keywords = data['keywords']
    result = keyword_suggest(keywords)
    print(result)
    return jsonify(result)

@api_bp.route('/pdf/<path:filename>')
def serve_pdf(filename):
    return send_from_directory('./arxiv_pdfs', filename)

@api_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    histories = History.query.filter_by(user_id=user.id)\
        .order_by(History.access_time.desc())\
        .limit(50)\
        .all()
    
    result = []
    for h in histories:
        result.append({
            'id': h.id,
            'arxiv_id': h.arxiv_id,
            'title': h.title,
            'like_num': h.like_num,
            'github_num': h.github_num,
            'img_link': h.img_link,
            'access_time': h.access_time.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify(result)