# Python Server - AI Career Assistant Backend

A FastAPI-based Python backend server for the AI Career Assistant application. This server provides AI-powered career coaching features including resume optimization, job fit analysis, interview preparation, and real-time chat capabilities.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Setup & Installation](#setup--installation)
4. [Running the Server](#running-the-server)
5. [API Endpoints](#api-endpoints)
6. [Services Architecture](#services-architecture)
7. [Environment Configuration](#environment-configuration)
8. [Development](#development)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Python server is a FastAPI-based REST API backend that provides:

- **🤖 Agent Services** - Resume bullet optimization, cover letter generation, interview answer evaluation
- **📊 Analysis Services** - Job fit analysis, ATS score calculation
- **💬 Chat Services** - Real-time chat with streaming responses (SSE)
- **🎓 Interview Services** - AI-generated interview questions based on resume & job description
- **📈 Dashboard Services** - Aggregated statistics and system status
- **📄 Document Services** - PDF parsing, text extraction, RAG (Retrieval-Augmented Generation) pipeline

**Technology Stack:**
- FastAPI (modern Python web framework)
- OpenAI GPT-4o Mini (LLM integration)
- Pydantic (data validation)
- PyPDF (PDF parsing)
- Python 3.9+

---

## 📁 Project Structure

```
python_server/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration & environment variables
│   │
│   ├── routers/                # API route handlers
│   │   ├── __init__.py
│   │   ├── agent.py            # Resume & interview agents endpoints
│   │   ├── analysis.py         # Job fit & ATS analysis endpoints
│   │   ├── chat.py             # Chat & streaming endpoints
│   │   ├── dashboard.py        # Dashboard stats endpoints
│   │   ├── documents.py        # Document upload endpoints
│   │   ├── health.py           # Health check endpoints
│   │   └── interview.py        # Interview prep endpoints
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── agent_service.py         # ✅ NEW: Resume optimization, cover letters, answer evaluation
│   │   ├── analysis_service.py      # ✅ NEW: Job fit analysis, ATS scoring
│   │   ├── chat_service.py          # ✅ NEW: Chat message handling
│   │   ├── dashboard_service.py     # ✅ NEW: Dashboard stats aggregation
│   │   ├── document_service.py      # Document parsing & chunking
│   │   ├── interview_service.py     # ✅ NEW: Interview question generation
│   │   └── llm_service.py           # LLM integration & RAG pipeline
│   │
│   └── models/                 # Data models
│       ├── __init__.py
│       └── dashboard.model.ts  # Dashboard model definitions
│
├── run.py                      # Entry point to start the server
├── requirements.txt            # Python dependencies
└── .env                        # Environment variables (not in git)
```

---

## 🚀 Setup & Installation

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)
- OpenAI API key (optional, but required for full functionality)

### Step 1: Clone/Navigate to Project

```bash
cd python_server
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# On Linux/Mac:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install required packages
pip install -r requirements.txt
```

**Dependencies included:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `python-multipart` - File upload handling
- `openai` - OpenAI API client
- `pypdf` - PDF parsing
- `python-dotenv` - Environment variable management
- `cors` - CORS middleware

---

## 🏃 Running the Server

### Option 1: Direct Python Execution (Development)

```bash
# Make sure virtual environment is activated
source .venv/bin/activate

# Run the server
python run.py
```

**Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
```

### Option 2: Using Uvicorn Directly

```bash
# Activate virtual environment first
source .venv/bin/activate

# Run with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Option 3: Production Mode (No Auto-Reload)

```bash
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Verify Server is Running

Visit in browser or use curl:

```bash
# Health check
curl http://localhost:8001/health

# API root
curl http://localhost:8001/

# Expected response:
{
  "message": "Welcome to AI Career Assistant API Engine",
  "documentation": "/api/health"
}
```

### Auto-Reload During Development

The `--reload` flag enables auto-restart when Python files change:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 📡 API Endpoints

### 1. **Agent Endpoints** (`/api/agent`)

Resume optimization, cover letter generation, interview answer evaluation.

#### Optimize Resume Bullet
```
POST /api/agent/optimize-bullet
Content-Type: application/json

{
  "originalBullet": "Developed a web application",
  "targetRole": "Senior Frontend Developer"
}

Response:
{
  "status": "success",
  "data": {
    "original": "Developed a web application",
    "improvedBullets": [
      "Spearheaded development of web application...",
      "Architected and integrated scalable solutions...",
      "Led cross-functional engineering efforts..."
    ],
    "keyKeywordsAdded": ["Spearheaded", "Architected", "Scalable Solutions"],
    "impactScore": 88
  }
}
```

#### Generate Cover Letter
```
POST /api/agent/cover-letter
Content-Type: application/json

{
  "companyName": "Google",
  "jobTitle": "Software Engineer",
  "tone": "professional"
}

Response:
{
  "status": "success",
  "data": {
    "company": "Google",
    "role": "Software Engineer",
    "subjectLine": "Application for Software Engineer Position",
    "coverLetterText": "Dear Hiring Manager...",
    "matchHighlights": ["Full-stack alignment", "Technical expertise", "Innovation focus"]
  }
}
```

#### Evaluate Interview Answer
```
POST /api/agent/evaluate-answer
Content-Type: application/json

{
  "question": "Tell us about a project you're proud of",
  "userAnswer": "I built a web app that increased sales by 40%",
  "suggestedAnswer": "Optional model answer for comparison"
}

Response:
{
  "status": "success",
  "data": {
    "score": 88,
    "grade": "Good Answer",
    "strengths": ["Metric-driven", "Clear problem statement"],
    "improvements": ["Add more technical details"],
    "refinedAnswer": "...",
    "followUpQuestion": "Can you walk us through the technical challenges?"
  }
}
```

---

### 2. **Analysis Endpoints** (`/api/analysis`)

Job fit analysis and ATS scoring.

#### Get Job Fit Analysis
```
GET /api/analysis/fit

Response:
{
  "status": "success",
  "data": {
    "isComplete": true,
    "overallMatch": 78,
    "matchGrade": "Good Candidate Match",
    "matchingSkills": ["Software Engineering", "REST APIs", "Problem Solving"],
    "missingSkills": ["Docker", "Kubernetes"],
    "relevantExperience": [
      {
        "project": "Web Platform",
        "relevance": "High",
        "description": "Strong alignment with requirements"
      }
    ],
    "recommendations": ["Highlight testing experience", "Add deployment skills"]
  }
}
```

#### Get ATS Score
```
GET /api/analysis/ats

Response:
{
  "status": "success",
  "data": {
    "overallAtsScore": 86,
    "status": "Strong ATS alignment",
    "details": [
      {"category": "Keywords", "score": 88},
      {"category": "Formatting", "score": 82},
      {"category": "Experience", "score": 90}
    ]
  }
}
```

---

### 3. **Chat Endpoints** (`/api/chat`)

Real-time chat with optional streaming.

#### Standard Chat Message
```
POST /api/chat/message
Content-Type: application/json

{
  "message": "How do I improve my resume?",
  "history": [
    {"role": "user", "content": "Hi"},
    {"role": "assistant", "content": "Hello! How can I help?"}
  ]
}

Response:
{
  "status": "success",
  "data": {
    "answer": "Here are 5 ways to improve your resume...",
    "sources": [
      {
        "document": "resume.pdf",
        "page": 1,
        "snippet": "..."
      }
    ],
    "modelUsed": "OpenAI GPT-4o Mini"
  }
}
```

#### Streaming Chat (SSE - Server-Sent Events)
```
POST /api/chat/stream
Content-Type: application/json

{
  "message": "What are my strengths?",
  "history": []
}

Response: (Streaming)
event: token
data: {"token": "Based "}

event: token
data: {"token": "on "}

...

event: done
data: {"sources": [...], "modelUsed": "OpenAI GPT-4o Mini"}
```

---

### 4. **Interview Endpoints** (`/api/interview`)

Interview preparation questions.

#### Get Interview Questions
```
GET /api/interview/questions

Response:
{
  "status": "success",
  "data": {
    "resumeFilename": "resume.pdf",
    "jobDescriptionFilename": "job_description.pdf",
    "generatedBy": "OpenAI GPT-4o Mini",
    "questions": [
      {
        "id": "1",
        "category": "Technical",
        "difficulty": "Medium",
        "question": "Describe a project where you improved performance",
        "suggestedAnswer": "Explain problem, decisions, metrics improved...",
        "keyPoints": ["System design", "Impact", "Trade-offs"]
      },
      ...
    ]
  }
}
```

---

### 5. **Dashboard Endpoints** (`/api/dashboard`)

Aggregated statistics and system status.

#### Get Dashboard Stats
```
GET /api/dashboard/stats

Response:
{
  "status": "success",
  "data": {
    "user": {
      "name": "Alex Johnson",
      "role": "Senior Frontend Developer",
      "avatarUrl": "assets/avatar-placeholder.png"
    },
    "stats": {
      "resumesUploaded": 1,
      "jobDescriptionsUploaded": 1,
      "aiAnalysesRun": 1,
      "interviewSessions": 1,
      "atsScore": 85
    },
    "atsScoreData": {...},
    "documents": {
      "resume": {...},
      "jobDescription": {...}
    },
    "systemStatus": {
      "apiStatus": "Healthy",
      "llmService": "OpenAI GPT-4o Mini Connected",
      "ragPipeline": "Active — Chunking & Retrieval Enabled",
      "streaming": "SSE Streaming Enabled",
      "agentService": "Agentic Tool Calling — Phase 7"
    },
    "phases": [...],
    "recentActivity": [...]
  }
}
```

---

### 6. **Document Endpoints** (`/api/documents`)

Document upload and management.

#### Get Document Status
```
GET /api/documents/status

Response:
{
  "status": "success",
  "documents": {
    "resume": {
      "id": "resume_abc123",
      "filename": "resume.pdf",
      "fileSize": 245000,
      "uploadedAt": "2024-01-15T10:30:00Z",
      "pageCount": 2,
      "charCount": 8500,
      "chunkCount": 15,
      "preview": "Alex Johnson - Senior Frontend Developer..."
    },
    "jobDescription": null
  }
}
```

#### Upload Resume (PDF)
```
POST /api/documents/upload-resume
Content-Type: multipart/form-data

file: resume.pdf

Response:
{
  "status": "success",
  "message": "Resume PDF successfully parsed and indexed.",
  "document": {
    "id": "resume_xyz789",
    "filename": "resume.pdf",
    "fileSize": 245000,
    "pageCount": 2,
    "charCount": 8500,
    "uploadedAt": "2024-01-15T10:30:00Z",
    "preview": "..."
  }
}
```

#### Upload Job Description
```
POST /api/documents/upload-jd
Content-Type: multipart/form-data

# Option 1: PDF File
file: job_description.pdf

# Option 2: Plain Text
text: "Senior Software Engineer at Google..."
title: "Google_SWE_Role"

Response: (Same as upload-resume)
```

#### Delete Document
```
DELETE /api/documents/resume
DELETE /api/documents/job_description

Response:
{
  "status": "success",
  "message": "resume removed."
}
```

---

### 7. **Health Endpoints** (`/api/health`)

Server health and status checks.

```
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

---

## 🏛️ Services Architecture

### Service Layers

```
API Routes (routers/)
    ↓
Services (services/)
    ├── agent_service          → Resume optimization, cover letters, answers
    ├── analysis_service       → Job fit analysis, ATS scoring
    ├── chat_service           → Message handling, streaming
    ├── interview_service      → Question generation
    ├── dashboard_service      → Stats aggregation
    └── llm_service            → OpenAI integration, RAG pipeline
        └── document_service   → PDF parsing, chunking
```

### Service Details

#### **agent_service.py** ✅ NEW
- `optimize_resume_bullet()` - STAR method optimization
- `generate_cover_letter()` - Tailored letter generation
- `evaluate_interview_answer()` - Answer scoring & feedback

#### **analysis_service.py** ✅ NEW
- `get_job_fit_analysis()` - Resume vs JD alignment
- `get_ats_score()` - ATS keyword matching

#### **chat_service.py** ✅ NEW
- `handle_chat_message()` - Standard JSON responses
- `stream_chat_response()` - Token-by-token streaming

#### **interview_service.py** ✅ NEW
- `get_interview_questions()` - AI-generated questions
- `get_interview_context()` - Document status

#### **dashboard_service.py** ✅ NEW
- `get_dashboard_stats()` - Comprehensive statistics

#### **llm_service.py** (Existing)
- `generate_response()` - Chat responses with RAG
- `stream_tokens()` - Token streaming
- `generate_job_fit_analysis()` - Job matching
- `generate_ats_score()` - ATS analysis
- `generate_interview_questions()` - Question generation

#### **document_service.py** (Existing)
- `parse_pdf_buffer()` - PDF parsing
- `set_plain_text_jd()` - Text document handling
- `retrieve_relevant_chunks()` - RAG retrieval
- `build_rag_context()` - Context building

---

## 🔧 Environment Configuration

### Create `.env` File

Create a `.env` file in the `python_server` directory:

```bash
# .env file (DO NOT COMMIT THIS TO GIT)
NODE_ENV=development
PORT=8001
OPENAI_API_KEY=sk-your-api-key-here
CLIENT_URL=http://localhost:4200,http://localhost:8001,https://al-project-fe.vercel.app
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` / `production` |
| `PORT` | Server port | `8001` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `CLIENT_URL` | Allowed frontend URLs | Comma-separated URLs |

### Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Go to "API keys" section
4. Create a new API key
5. Copy and paste in `.env`

### Fallback Mode (Without OpenAI API)

If `OPENAI_API_KEY` is not set, the server runs in fallback mode:
- Returns intelligent mock responses
- Does not call external APIs
- Still functional for testing/development

---

## 👨‍💻 Development

### Auto-Reload Development Server

```bash
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

The server will restart automatically when Python files change.

### API Documentation

FastAPI provides automatic interactive documentation:

```
Swagger UI:    http://localhost:8001/docs
ReDoc:         http://localhost:8001/redoc
OpenAPI JSON:  http://localhost:8001/openapi.json
```

### Testing Endpoints

Using `curl`:

```bash
# Test health endpoint
curl http://localhost:8001/api/health

# Test agent endpoint
curl -X POST http://localhost:8001/api/agent/optimize-bullet \
  -H "Content-Type: application/json" \
  -d '{"originalBullet": "Built a web app", "targetRole": "Senior Dev"}'

# Test chat endpoint
curl -X POST http://localhost:8001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I improve my resume?"}'
```

Using Python:

```python
import requests

# Test endpoint
response = requests.post(
    "http://localhost:8001/api/agent/optimize-bullet",
    json={
        "originalBullet": "Built a web app",
        "targetRole": "Senior Dev"
    }
)
print(response.json())
```

Using Postman/Insomnia:
- Import requests from Swagger UI: `http://localhost:8001/openapi.json`
- Create requests with proper headers and body

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Find process using port 8001
lsof -i :8001

# Kill the process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --port 8002
```

### Issue: Virtual Environment Not Activated

**Error:** `Command not found: pip` or `No module named 'fastapi'`

**Solution:**
```bash
# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

### Issue: Missing Dependencies

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
# Make sure virtual environment is activated
source .venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: OpenAI API Error

**Error:** `AuthenticationError: Invalid API key`

**Solution:**
1. Check `.env` file has correct API key
2. Ensure API key starts with `sk-`
3. Verify key is active in OpenAI console
4. Check for extra spaces/newlines in `.env`

### Issue: CORS Error (Frontend Cannot Connect)

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Check `CLIENT_URL` in `.env` includes frontend URL
2. Restart server after changing `.env`
3. Verify frontend is on correct URL
4. Check CORS middleware in `app/main.py`

### Issue: PDF Upload Fails

**Error:** `Only PDF documents are allowed`

**Solution:**
- Ensure file is valid PDF format
- Check file size (should be < 10MB)
- Try with different PDF file

### Issue: Slow Response

**Cause:** 
- OpenAI API latency
- Large document processing
- Network issues

**Solution:**
- Increase timeout in frontend
- Use streaming endpoint for chat
- Check OpenAI API status
- Try with smaller documents

---

## 📦 Deployment

### Development
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4
```

### Docker (Optional)

```bash
# Build image
docker build -t ai-career-assistant-python .

# Run container
docker run -p 8001:8001 --env-file .env ai-career-assistant-python
```

---

## 📝 Requirements

**requirements.txt:**
```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
openai==1.3.0
pypdf==3.17.1
python-dotenv==1.0.0
```

---

## 🎯 Next Steps

1. ✅ Set up virtual environment
2. ✅ Install dependencies
3. ✅ Create `.env` file with OpenAI API key
4. ✅ Run `python run.py`
5. ✅ Test endpoints at `http://localhost:8001/docs`
6. ✅ Connect from frontend (`http://localhost:4200`)

---

## 📧 Support

For issues or questions:
1. Check Troubleshooting section
2. Review API documentation at `/docs`
3. Check console logs for error messages
4. Verify `.env` configuration

---

## 📄 License

This project is part of the AI Career Assistant application.

