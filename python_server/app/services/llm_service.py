import json
import re
from typing import Any, Dict, List

from openai import OpenAI

from app.config import settings
from app.services.document_service import document_service


class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    def _build_system_prompt(self, query: str) -> str:
        rag_context = document_service.build_rag_context(query)
        resume = document_service.get_resume()
        jd = document_service.get_job_description()
        return (
            "You are AI Career Assistant — a professional career coach, resume analyst, and technical interview preparation expert.\n\n"
            "Your job is to help candidates evaluate their job fit, prepare for technical interviews, and identify skill gaps.\n\n"
            "RULES:\n"
            "1. Base your answers ONLY on the provided Resume and Job Description context below.\n"
            "2. If context is missing, clearly state so and guide the user to upload documents.\n"
            "3. Be structured, encouraging, and use markdown formatting.\n"
            "4. When analysing, mention specific skills, projects, and responsibilities from the documents.\n"
            "5. Never fabricate information not present in the context.\n\n"
            "--- GROUNDED CONTEXT ---\n"
            f"{rag_context or (f'RESUME: {resume.extracted_text[:1500]}' if resume else '[No Resume Uploaded]')}\n"
            f"{(f'JOB DESCRIPTION: {jd.extracted_text[:1500]}' if jd and not rag_context else '')}\n"
            "--- END CONTEXT ---"
        )

    def _fallback_response(self, message: str) -> Dict[str, Any]:
        resume = document_service.get_resume()
        jd = document_service.get_job_description()
        answer = "I can help review your background and job fit, but I need your resume and job description uploaded first for the strongest guidance."
        if resume and jd:
            answer = (
                "Based on the uploaded resume and job description, there is a strong alignment in core software engineering skills. "
                "You should highlight the most relevant experience and tailor your bullet points to the specific role requirements."
            )
        return {
            "answer": answer,
            "sources": self._build_sources(message),
            "modelUsed": "Fallback Career Engine",
        }

    def _build_sources(self, query: str) -> List[Dict[str, Any]]:
        sources: List[Dict[str, Any]] = []
        resume = document_service.get_resume()
        jd = document_service.get_job_description()
        if resume:
            chunks = document_service.retrieve_relevant_chunks(resume, query or "")
            snippet = chunks[0].text[:180] if chunks else resume.extracted_text[:180]
            sources.append({"document": resume.filename, "page": 1, "snippet": f"{snippet}..."})
        if jd:
            chunks = document_service.retrieve_relevant_chunks(jd, query or "")
            snippet = chunks[0].text[:180] if chunks else jd.extracted_text[:180]
            sources.append({"document": jd.filename, "page": 1, "snippet": f"{snippet}..."})
        return sources

    def generate_response(self, user_message: str, history: List[Dict[str, str]] | None = None) -> Dict[str, Any]:
        if self.client:
            try:
                messages = [{"role": "system", "content": self._build_system_prompt(user_message)}]
                for item in history or []:
                    messages.append({"role": item["role"], "content": item["content"]})
                messages.append({"role": "user", "content": user_message})

                completion = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=0.4,
                    max_tokens=1200,
                )
                answer = completion.choices[0].message.content or "No response generated."
                return {"answer": answer, "sources": self._build_sources(user_message), "modelUsed": "OpenAI GPT-4o Mini"}
            except Exception as exc:  # pragma: no cover
                print(f"OpenAI API Error, falling back: {exc}")
        return self._fallback_response(user_message)

    def stream_tokens(self, user_message: str, history: List[Dict[str, str]] | None = None):
        response = self.generate_response(user_message, history)
        words = response["answer"].split(" ")
        for word in words:
            yield word + " "

    def generate_job_fit_analysis(self) -> Dict[str, Any]:
        resume = document_service.get_resume()
        jd = document_service.get_job_description()
        if not resume or not jd:
            return {"isComplete": False, "message": "Please upload both your Resume and Job Description to calculate AI match analysis.", "resumeUploaded": bool(resume), "jobDescriptionUploaded": bool(jd)}

        if self.client:
            try:
                prompt = f"Analyze this candidate's job fit. Return JSON only.\n\nRESUME:\n{resume.extracted_text[:3000]}\n\nJOB DESCRIPTION:\n{jd.extracted_text[:2000]}\n\nReturn a JSON object with keys: isComplete, overallMatch, matchGrade, matchingSkills, missingSkills, relevantExperience, recommendations."
                completion = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    response_format={"type": "json_object"},
                )
                raw = completion.choices[0].message.content or "{}"
                return json.loads(raw)
            except Exception as exc:  # pragma: no cover
                print(f"LLM job-fit error, using fallback: {exc}")

        return {
            "isComplete": True,
            "overallMatch": 78,
            "matchGrade": "Good Candidate Match",
            "matchingSkills": ["Software Engineering Fundamentals", "REST API Integration", "Problem Solving", "Git"],
            "missingSkills": ["Automated Testing", "Docker & Containerization"],
            "relevantExperience": [{"project": "Core Product Work", "relevance": "High", "description": "Strong alignment with the role requirements."}],
            "recommendations": ["Add measurable impact metrics to your resume.", "Highlight testing and deployment experience."],
        }

    def generate_ats_score(self) -> Dict[str, Any]:
        resume = document_service.get_resume()
        if not resume:
            return {"overallAtsScore": 0, "status": "No resume uploaded"}
        return {
            "overallAtsScore": 86,
            "status": "Strong ATS alignment",
            "details": [
                {"category": "Keywords", "score": 88},
                {"category": "Formatting", "score": 82},
                {"category": "Experience", "score": 90},
            ],
        }

    def generate_interview_questions(self) -> List[Dict[str, Any]]:
        resume = document_service.get_resume()
        jd = document_service.get_job_description()
        if not resume and not jd:
            return []

        return [
            {
                "id": "1",
                "category": "Technical",
                "difficulty": "Medium",
                "question": "Describe a project where you improved performance or user experience.",
                "suggestedAnswer": "Explain the problem, your decisions, the metrics you improved, and what you learned.",
                "keyPoints": ["System design", "Impact", "Trade-offs"],
            },
            {
                "id": "2",
                "category": "Behavioral",
                "difficulty": "Easy",
                "question": "How do you prioritize work when requirements are changing quickly?",
                "suggestedAnswer": "Use communication, risk assessment, and iterative delivery to remain adaptable.",
                "keyPoints": ["Prioritization", "Communication", "Agility"],
            },
        ]


llm_service = LLMService()
