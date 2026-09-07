from fastapi import APIRouter

from app.services.llm_service import llm_service

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/fit")
def get_job_fit_analysis():
    return {"status": "success", "data": llm_service.generate_job_fit_analysis()}


@router.get("/ats")
def get_ats_score():
    return {"status": "success", "data": llm_service.generate_ats_score()}
