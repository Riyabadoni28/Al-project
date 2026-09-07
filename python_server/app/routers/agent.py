from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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
    if not body.originalBullet or not body.originalBullet.strip():
        raise HTTPException(status_code=400, detail="originalBullet is required")
    return {"status": "success", "data": {"optimizedBullet": body.originalBullet.strip(), "targetRole": body.targetRole or "General Role"}}


@router.post("/cover-letter")
def generate_cover_letter(body: CoverLetterBody):
    return {"status": "success", "data": {"coverLetter": "This is a starter cover letter template for the selected role.", "companyName": body.companyName, "jobTitle": body.jobTitle, "tone": body.tone}}


@router.post("/evaluate-answer")
def evaluate_answer(body: AnswerBody):
    if not body.question or not body.userAnswer:
        raise HTTPException(status_code=400, detail="question and userAnswer are required")
    return {"status": "success", "data": {"score": 88, "feedback": "Strong answer structure with room to improve specificity and measurable impact.", "suggestedAnswer": body.suggestedAnswer or body.userAnswer}}
