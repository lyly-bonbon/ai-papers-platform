from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Paper(db.Model):
    __tablename__ = 'papers'
    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(500))
    authors = db.Column(db.Text)
    abstract = db.Column(db.Text)
    publish_time = db.Column(db.Text)
    pdf_link = db.Column(db.Text)
    year = db.Column(db.Integer)
    month = db.Column(db.Integer)
    like_num = db.Column(db.Integer, default=0)
    author_num = db.Column(db.String(100))
    github_num = db.Column(db.String(100))
    comment_num = db.Column(db.Integer, default=0)
    img_link = db.Column(db.Text)

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    arxiv_id = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(500))
    like_num = db.Column(db.Integer, default=0)
    github_num = db.Column(db.String(100))
    img_link = db.Column(db.Text)
    access_time = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('histories', lazy=True))