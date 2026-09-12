from typing import Any, Dict, List

from app.services.document_service import document_service
from app.services.llm_service import llm_service


class InterviewService:
    """Interview service for managing interview prep questions."""

    def get_interview_questions(self) -> List[Dict[str, Any]]:
        """
        Generate interview prep questions based on resume and job description.
        
        Returns:
            List of interview questions with categories, difficulty, and suggested answers
        """
        return llm_service.generate_interview_questions()

    def get_interview_context(self) -> Dict[str, Any]:
        """
        Get the context for interview preparation.
        
        Returns:
            Dictionary with resume and job description info
        """
        resume = document_service.get_resume()
        jd = document_service.get_job_description()

        return {
            "resumeFilename": resume.filename if resume else "Not uploaded",
            "jobDescriptionFilename": jd.filename if jd else "Not uploaded",
            "resumeUploaded": bool(resume),
            "jobDescriptionUploaded": bool(jd),
        }


interview_service = InterviewService()
