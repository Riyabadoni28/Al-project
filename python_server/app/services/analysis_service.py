from typing import Any, Dict

from app.services.llm_service import llm_service


class AnalysisService:
    """Analysis service for job fit analysis and ATS scoring."""

    def get_job_fit_analysis(self) -> Dict[str, Any]:
        """
        Analyze job fit between resume and job description.
        
        Returns:
            Dictionary with match analysis, matching skills, missing skills, and recommendations
        """
        return llm_service.generate_job_fit_analysis()

    def get_ats_score(self) -> Dict[str, Any]:
        """
        Calculate ATS score for the resume.
        
        Returns:
            Dictionary with overall ATS score and category breakdowns
        """
        return llm_service.generate_ats_score()


analysis_service = AnalysisService()
