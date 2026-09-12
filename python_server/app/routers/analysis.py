from fastapi import APIRouter, HTTPException

from app.services.analysis_service import analysis_service

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get("/fit")
def get_job_fit_analysis():
    try:
        result = analysis_service.get_job_fit_analysis()
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate job-fit analysis: {str(e)}")


@router.get("/ats")
def get_ats_score():
    try:
        result = analysis_service.get_ats_score()
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate ATS score: {str(e)}")
