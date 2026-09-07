# AI Career Assistant

AI Career Assistant is a full-stack web application designed to help job seekers improve their resume quality, analyze job-fit compatibility, prepare for interviews, and interact with an AI-based career advisor.

## Project Overview

This application combines:

- Frontend: Angular 17
- Backend: Python + FastAPI
- Styling: Angular Material + Bootstrap
- Deployment: Vercel for frontend, Python-compatible host for backend

The product is organized around a dashboard-first experience and multiple AI-powered career workflows.

The backend is currently being migrated from the original Node.js/Express implementation to a Python FastAPI service under the python_server folder.

## Features

- Resume and document management
- Job description intake
- ATS compatibility analysis
- AI-powered chat assistant
- Interview preparation workflows
- AI tools and career assistance modules
- Dashboard with system health and metrics

## Tech Stack

### Frontend
- Angular
- TypeScript
- Angular Material
- Bootstrap
- RxJS
- Angular Router

### Backend
- Python 3.12+
- FastAPI
- Pydantic
- Uvicorn
- Python-dotenv
- OpenAI integration
- CORS middleware

## Project Structure

```bash
.
├── frontend/
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
├── server/
│   ├── src/
│   ├── package.json
│   └── ...
├── python_server/
│   ├── app/
│   ├── .venv/
│   ├── requirements.txt
│   ├── run.py
│   └── ...
├── README.md
└── .gitignore
```

## Frontend Routes

The Angular app includes the following routes:

- /dashboard
- /documents
- /chat
- /analysis
- /interview
- /tools

All pages are wrapped within a shared layout shell containing a top toolbar and sidebar navigation.

## Backend API Modules

The FastAPI backend is mounted under /api and includes routes for:

- /api/health
- /api/dashboard
- /api/documents
- /api/chat
- /api/analysis
- /api/interview
- /api/agent

The legacy Node.js backend remains in the server folder for reference, while the active migration is in python_server.

## Running the Application

### Frontend

```bash
cd frontend
npm install
npm start
```

### Python Backend

```bash
cd python_server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

### Legacy Node.js Backend

```bash
cd server
npm install
npm start
```

## Environment Variables

The Python backend uses environment configuration for port and allowed frontend origins.

Example:

```env
PORT=8001
NODE_ENV=development
CLIENT_URL=http://localhost:4200,http://localhost:8001,https://your-frontend.vercel.app
OPENAI_API_KEY=your_key_here
```

## Deployment Notes

- Frontend should be deployed on Vercel
- Python backend should be deployed on a Python-compatible hosting platform such as Render, Railway, Fly.io, Azure, or a VPS
- Ensure CORS origins include the deployed frontend URL
- If using Angular SPA routes, configure Vercel rewrite rules to serve index.html
- Local Python development runs on port 8001

## Current Status

This project is in active development and includes:

- a working dashboard shell
- modular page structure
- FastAPI backend migration in progress
- backend API scaffolding
- AI assistant and career support features

## Future Scope

The following enhancements are planned to evolve the product from a dashboard prototype into a production-ready AI career platform:

- Authentication and user accounts
  - Login/signup flow for candidates
  - Role-based access for users and admins
  - Saved profiles, sessions, and preferences

- Resume parsing and file storage
  - Upload PDF/DOCX resumes
  - Extract skills, experience, education, and keywords
  - Store user documents securely in cloud storage

- Real AI service integration
  - Connect to a production LLM provider for structured analysis
  - Add prompt templates for resume scoring, job matching, and interview coaching
  - Implement streaming responses for chat and analysis

- Interview recording and analysis
  - Video or audio interview capture
  - Speech-to-text transcription
  - AI evaluation of confidence, communication, and answer quality

- Job recommendation engine
  - Match user profiles with job roles and skills
  - Rank opportunities based on fit score
  - Recommend next-step actions and skill gaps

- Cloud database integration
  - Store users, resumes, chat history, and evaluation records
  - Add relational data models for job roles and user activity
  - Support analytics and reporting dashboards

## Implementation Roadmap

The product should be delivered in a staged approach so that the foundation is production-ready before adding advanced AI and data features.

### Phase 1: Foundation and user management
- Implement authentication with signup/login for candidates
- Add user profiles, session persistence, and saved preferences
- Introduce role-based access for users and admins
- Create secure session handling and protected routes
- Add backend user and auth models

### Phase 2: Resume intelligence and document pipeline
- Support PDF and DOCX upload with validation
- Extract skills, experience, education, and keywords from uploaded documents
- Store user files in secure cloud storage
- Build resume parsing and enrichment logic
- Add document history and retrieval for future analysis

### Phase 3: AI analysis and recommendation engine
- Connect to a production LLM provider for structured evaluation
- Add prompt templates for resume scoring, skill matching, and interview coaching
- Implement streaming responses for chat and analysis workflows
- Add job-role matching and fit-score ranking
- Recommend skill gaps and next-step actions for candidates

### Phase 4: Interview and evaluation system
- Add interview recording, transcript generation, and speech-to-text processing
- Evaluate communication, confidence, clarity, and answer quality
- Save interview summaries and coaching insights for users
- Integrate review dashboards for candidate improvement

### Phase 5: Data layer and analytics
- Add cloud database integration for users, resumes, chat history, and evaluations
- Create relational models for job roles, skills, applications, and activity logs
- Enable analytics dashboards and reporting for performance trends
- Prepare the app for scaling, backups, and operational monitoring

### Phase 6: Production hardening
- Add API security, rate limiting, and input validation
- Improve error handling, logging, and observability
- Optimize deployment, environment management, and CI/CD pipelines
- Validate accessibility, mobile responsiveness, and performance on release builds

## License

This project is for educational and personal project use unless otherwise specified.
