from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .models import db
from .routes import api_bp
from .auth import auth_bp

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your-secret-key-change-in-prod'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:123456@db:5432/hf_papers_2025'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-change-in-prod'

    db.init_app(app)
    CORS(app)
    jwt = JWTManager(app)

    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/auth')

    with app.app_context():
        db.create_all()

    return app