from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.agent_service import agent_service

router = APIRouter(prefix="/agent", tags=["agent"])


class BulletBody(BaseModel):
    originalBullet: str
    targetRole: str | None = None


class CoverLetterBody(BaseModel):
    companyName: str | None = None
    jobTitle: str | None = None
    tone: str | None = None


class AnswerBody(BaseModel):
    question: str | None = None
    userAnswer: str | None = None
    suggestedAnswer: str | None = None


@router.post("/optimize-bullet")
def optimize_bullet(body: BulletBody):
    try:
        result = agent_service.optimize_resume_bullet(body.originalBullet, body.targetRole)
        return {"status": "success", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to optimize bullet: {str(e)}")


@router.post("/cover-letter")
def generate_cover_letter(body: CoverLetterBody):
    try:
        result = agent_service.generate_cover_letter(body.companyName, body.jobTitle, body.tone)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate cover letter: {str(e)}")


@router.post("/evaluate-answer")
def evaluate_answer(body: AnswerBody):
    try:
        result = agent_service.evaluate_interview_answer(body.question, body.userAnswer, body.suggestedAnswer)
        return {"status": "success", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")
