# AI Career Assistant

AI Career Assistant is a full-stack web application designed to help job seekers improve their resume quality, analyze job-fit compatibility, prepare for interviews, and interact with an AI-based career advisor.

## Project Overview

This application combines:

- Frontend: Angular 17
- Backend: Node.js + Express
- Styling: Angular Material + Bootstrap
- Deployment: Vercel for frontend, external host for backend

The product is organized around a dashboard-first experience and multiple AI-powered career workflows.

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
- Node.js
- Express
- TypeScript
- CORS
- Environment-based configuration

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

The Express API is mounted under /api and includes routes for:

- /api/health
- /api/dashboard
- /api/documents
- /api/chat
- /api/analysis
- /api/interview
- /api/agent

## Running the Application

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd server
npm install
npm start
```

## Environment Variables

The backend uses environment configuration for port and allowed frontend origins.

Example:

```env
PORT=8500
NODE_ENV=development
CLIENT_URL=http://localhost:4200,https://your-frontend.vercel.app
```

## Deployment Notes

- Frontend should be deployed on Vercel
- Backend should be deployed on a Node-compatible hosting platform
- Ensure CORS origins include the deployed frontend URL
- If using Angular SPA routes, configure Vercel rewrite rules to serve index.html

## Current Status

This project is in active development and includes:

- a working dashboard shell
- modular page structure
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

## License

This project is for educational and personal project use unless otherwise specified.
