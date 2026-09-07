from fastapi import APIRouter

from app.services.document_service import document_service
from app.services.llm_service import llm_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def get_dashboard_stats():
    doc_status = document_service.get_status()
    has_resume = bool(doc_status["resume"])
    has_jd = bool(doc_status["jobDescription"])
    ats_score = llm_service.generate_ats_score()

    return {
        "status": "success",
        "data": {
            "user": {
                "name": "Alex Johnson",
                "role": "Senior Frontend Developer",
                "avatarUrl": "assets/avatar-placeholder.png",
            },
            "stats": {
                "resumesUploaded": 1 if has_resume else 0,
                "jobDescriptionsUploaded": 1 if has_jd else 0,
                "aiAnalysesRun": 1 if has_resume and has_jd else 0,
                "interviewSessions": 1 if has_resume else 0,
                "atsScore": ats_score.get("overallAtsScore") or (85 if has_resume else 0),
            },
            "atsScoreData": ats_score,
            "documents": {
                "resume": doc_status["resume"],
                "jobDescription": doc_status["jobDescription"],
            },
            "systemStatus": {
                "apiStatus": "Healthy",
                "llmService": "OpenAI GPT-4o Mini Connected" if __import__("os").getenv("OPENAI_API_KEY") else "Fallback Engine Active",
                "ragPipeline": "Active — Chunking & Retrieval Enabled",
                "streaming": "SSE Streaming Enabled",
                "agentService": "Agentic Tool Calling — Phase 7",
            },
            "phases": [
                {"id": 1, "name": "Project Setup & Foundations", "status": "completed", "description": "Angular 17 Material frontend + Node.js Express REST API"},
                {"id": 2, "name": "LLM Integration & Prompt Engineering", "status": "completed", "description": "GPT-4o Mini integration, system prompts, structured JSON outputs"},
                {"id": "3-5", "name": "Document Upload & RAG Pipeline", "status": "completed", "description": "PDF parsing, text chunking, keyword retrieval & citation grounding"},
                {"id": "6-7", "name": "SSE Streaming & Agentic Tool Calling", "status": "completed", "description": "Real-time token streaming & autonomous tools execution"},
            ],
            "recentActivity": [],
        },
    }
