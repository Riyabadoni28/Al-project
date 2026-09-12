import os
from typing import Any, Dict

from app.services.document_service import document_service
from app.services.llm_service import llm_service


class DashboardService:
    """Dashboard service for aggregating dashboard statistics."""

    def get_dashboard_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive dashboard statistics.
        
        Returns:
            Dictionary with user info, stats, documents, system status, and activity
        """
        doc_status = document_service.get_status()
        has_resume = bool(doc_status["resume"])
        has_jd = bool(doc_status["jobDescription"])
        ats_score = llm_service.generate_ats_score()

        return {
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
                "llmService": "OpenAI GPT-4o Mini Connected" if os.getenv("OPENAI_API_KEY") else "Fallback Engine Active",
                "ragPipeline": "Active — Chunking & Retrieval Enabled",
                "streaming": "SSE Streaming Enabled",
                "agentService": "Agentic Tool Calling — Phase 7",
            },
            "phases": [
                {
                    "id": 1,
                    "name": "Project Setup & Foundations",
                    "status": "completed",
                    "description": "Angular 17 Material frontend + Node.js Express REST API",
                },
                {
                    "id": 2,
                    "name": "LLM Integration & Prompt Engineering",
                    "status": "completed",
                    "description": "GPT-4o Mini integration, system prompts, structured JSON outputs",
                },
                {
                    "id": "3-5",
                    "name": "Document Upload & RAG Pipeline",
                    "status": "completed",
                    "description": "PDF parsing, text chunking, keyword retrieval & citation grounding",
                },
                {
                    "id": "6-7",
                    "name": "SSE Streaming & Agentic Tool Calling",
                    "status": "completed",
                    "description": "Real-time token streaming & autonomous tools execution",
                },
            ],
            "recentActivity": self._build_recent_activity(doc_status),
        }

    def _build_recent_activity(self, doc_status: Dict[str, Any]) -> list:
        """Build recent activity list based on document status."""
        activity = []

        if doc_status["resume"]:
            resume = doc_status["resume"]
            activity.append(
                {
                    "id": "1",
                    "type": "DOCUMENT_UPLOAD",
                    "title": f"Resume: {resume['filename']} ({resume['chunkCount']} chunks)",
                    "timestamp": resume["uploadedAt"],
                    "status": "Processed & Chunked",
                }
            )

        if doc_status["jobDescription"]:
            jd = doc_status["jobDescription"]
            activity.append(
                {
                    "id": "2",
                    "type": "DOCUMENT_UPLOAD",
                    "title": f"Job Description: {jd['filename']} ({jd['chunkCount']} chunks)",
                    "timestamp": jd["uploadedAt"],
                    "status": "Processed & Chunked",
                }
            )

        return activity


dashboard_service = DashboardService()
