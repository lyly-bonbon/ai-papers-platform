# AI Paper Reading Platform

## Project Description

The AI Paper Reading Platform is an open-source web application designed to help researchers and developers efficiently explore and analyze the latest papers in the AI field. The platform crawls data from Hugging Face Papers, supporting intelligent recommendations, content analysis, PDF reading assistance, and history management. Integrated with ZhipuAI (GLM-4 model), it provides AI-driven features such as abstract summarization and core contribution extraction.

The backend is built with Flask and SQLAlchemy, the frontend with React and Material-UI for responsive design. Data is stored in a PostgreSQL database, with Docker for containerized deployment.

<image src="images/image.png"></image>
## Features

- **Data Collection**: Supports monthly or daily automatic collection of paper titles, likes, GitHub links, and other metadata from Hugging Face Papers.
- **Data Query**: Flexible paper querying with custom field filtering (e.g., year, likes) and pagination.
- **Intelligent Recommendation**: Based on user keywords, uses AI models to recommend relevant papers and provide suggestion scores (0-10).
- **Assist Reading**: Input arXiv ID, download PDF and use AI to analyze the first 10 pages, extracting key information such as abstract, research problems, core contributions, method innovations, datasets, experimental results, etc.
- **Reading History**: Records user-accessed papers, supports sorting and quick navigation.
- **User Authentication**: Supports registration, login, and JWT token authentication to ensure secure API access.
- **PDF Preview**: Integrated PDF.js preview, supporting local download and online viewing.

## Project Structure

```
ai-papers-platform/
├── backend/                    # Backend Flask application
│   ├── app/                    # Application package
│   │   ├── __init__.py         # Flask app initialization
│   │   ├── models.py           # Database models (User, Paper, History)
│   │   ├── routes.py            # API routes
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── spider.py           # Web scraping for Hugging Face Papers
│   │   └── analysis.py         # AI content analysis using ZhipuAI
│   ├── tests/                  # Backend tests
│   │   └── test_full.py        # Test script
│   ├── arxiv_pdfs/             # Downloaded PDF files storage
│   ├── Dockerfile              # Backend Docker configuration
│   ├── requirements.txt        # Python dependencies
│   └── run.py                  # Application entry point
├── frontend/                   # Frontend React application
│   ├── src/                    # Source code
│   │   ├── pages/              # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── CollectPage.tsx
│   │   │   ├── QueryPage.tsx
│   │   │   ├── AssistReadPage.tsx
│   │   │   ├── RecommendPage.tsx
│   │   │   └── HistoryPage.tsx
│   │   ├── components/          # Reusable components
│   │   ├── utils/              # Utility functions
│   │   ├── App.tsx             # Main app component
│   │   ├── index.tsx           # Entry point
│   │   └── theme.ts            # Material-UI theme
│   ├── public/                 # Static assets
│   ├── Dockerfile              # Frontend Docker configuration
│   ├── nginx.conf              # Nginx configuration for production
│   ├── package.json            # Node.js dependencies
│   └── tsconfig.json           # TypeScript configuration
├── images/                     # Project images
│   └── image.png               # Project screenshot
├── docker-compose.yml          # Docker Compose configuration
└── readme.md                   # Project documentation
```

## Tech Stack

- **Backend**: Python 3.12, Flask, SQLAlchemy, Flask-JWT-Extended, ZhipuAI SDK
- **Frontend**: React 18, TypeScript, Material-UI 5, React Router
- **Database**: PostgreSQL 15
- **Crawler**: Requests, Parsel, arXiv API
- **PDF Processing**: PyMuPDF (fitz)
- **Deployment**: Docker, Docker Compose, Nginx

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git
- Node 20.19.5

### Clone Repository
```bash
git clone <your-repo-url>
cd ai-papers-platform
cd frontend
npm install
```

### Environment Setup
- Set database and keys in `backend/.env` (optional, docker-compose has defaults).
- ZhipuAI API Key is hardcoded.

### Start with Docker Compose
```bash
docker-compose up -d
```

- Backend: http://localhost:5001
- Frontend: http://localhost:3000
- Database: localhost:5432 (user: postgres, password: 123456, DB: hf_papers_2025)

### Stop Services
```bash
docker-compose down
```

### Production Deployment
- Build production image: Change `frontend` target to `prod` in `docker-compose.yml`.
- Use Nginx to reverse proxy frontend static files.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | User registration | No |
| POST | `/auth/login` | User login, returns JWT | No |
| POST | `/auth/logout` | User logout | Yes |
| POST | `/api/collect/monthly` | Monthly collection | Yes |
| POST | `/api/collect/daily` | Daily collection | Yes |
| POST | `/api/query` | Query papers | Yes |
| POST | `/api/assist/read` | Assist reading analysis | Yes |
| POST | `/api/recommend` | Keyword recommendation | Yes |
| GET | `/api/history` | Get reading history | Yes |
| GET | `/api/pdf/<filename>` | PDF file serving | No |

Request Body Example (JSON):
- Query: `{"fields": ["title", "like_num"], "limit": 10, "where": {"year": 2025}}`
- Recommendation: `{"keywords": "AI image generation"}`

## Known Issues

- **Docker Deployment Issue**: React environment failed to deploy properly. Final solution: Run `npm install` in the frontend folder and copy the node_modules directory into the Docker image to ensure dependencies are correctly installed.
- **Frontend PDF.js Error**: PDF.js integration caused rendering errors. Final solution: Use iframe to embed PDF preview, bypassing compatibility issues.

## TODO

- Integrate layout structure extraction and translation: Integrate Paddle OCR VL or layout analysis models to support structured extraction and multi-language translation of paper PDFs.
- Integrate better models for document parsing: Replace the current GLM-4 model with more advanced LLMs (e.g., GPT-4o or Claude) to improve document parsing accuracy.

## Development Guide

### Backend Development
```bash
cd backend
pip install -r requirements.txt
flask run
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Testing
- Backend test script: `python backend/tests/test_full.py`
- Frontend unit tests: `npm test`