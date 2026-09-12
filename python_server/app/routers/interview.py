from fastapi import APIRouter, HTTPException
import os

from app.services.interview_service import interview_service

router = APIRouter(prefix="/interview", tags=["interview"])


@router.get("/questions")
def get_interview_prep_questions():
    try:
        context = interview_service.get_interview_context()
        questions = interview_service.get_interview_questions()
        return {
            "status": "success",
            "data": {
                "resumeFilename": context["resumeFilename"],
                "jobDescriptionFilename": context["jobDescriptionFilename"],
                "generatedBy": "OpenAI GPT-4o Mini" if os.getenv("OPENAI_API_KEY") else "AI Career Assistant Engine",
                "questions": questions,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate interview questions: {str(e)}")
