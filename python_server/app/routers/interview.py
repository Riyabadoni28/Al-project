from fastapi import APIRouter

from app.services.document_service import document_service
from app.services.llm_service import llm_service

router = APIRouter(prefix="/interview", tags=["interview"])


@router.get("/questions")
def get_interview_prep_questions():
    resume = document_service.get_resume()
    jd = document_service.get_job_description()
    return {
        "status": "success",
        "data": {
            "resumeFilename": resume.filename if resume else "Not uploaded",
            "jobDescriptionFilename": jd.filename if jd else "Not uploaded",
            "generatedBy": "OpenAI GPT-4o Mini" if __import__("os").getenv("OPENAI_API_KEY") else "AI Career Assistant Engine",
            "questions": llm_service.generate_interview_questions(),
        },
    }
