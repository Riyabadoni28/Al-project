import json
import logging
import time
import re
from typing import Any, Dict, List

from openai import OpenAI

from app.config import settings
from app.services.document_service import document_service

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        # Do not initialize client if API key is not present
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
            "2. If context is missing, clearly state so and guide the user to upload documents — DO NOT INVENT CONTENT.\n"
            "3. Be structured, encouraging, and use markdown formatting.\n"
            "4. When analysing, mention specific skills, projects, and responsibilities from the documents.\n"
            "5. Never fabricate information not present in the context; explicitly say 'Insufficient context' when unsure.\n\n"
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
                "Based on the uploaded resume and job description, there appears to be alignment in core software engineering skills. "
                "Consider tailoring bullet points to the role requirements and adding measurable impact metrics."
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
            if chunks:
                c = chunks[0]
                snippet = c.text[:180]
                source = {"document": resume.filename, "page": getattr(c, "page", None), "snippet": f"{snippet}..."}
                # include chunk metadata when available
                if getattr(c, "chunk_index", None) is not None:
                    source["chunk_index"] = c.chunk_index
                    source["char_start"] = getattr(c, "char_start", None)
                    source["char_end"] = getattr(c, "char_end", None)
                sources.append(source)
            else:
                snippet = resume.extracted_text[:180]
                sources.append({"document": resume.filename, "page": None, "snippet": f"{snippet}..."})
        if jd:
            chunks = document_service.retrieve_relevant_chunks(jd, query or "")
            if chunks:
                c = chunks[0]
                snippet = c.text[:180]
                source = {"document": jd.filename, "page": getattr(c, "page", None), "snippet": f"{snippet}..."}
                if getattr(c, "chunk_index", None) is not None:
                    source["chunk_index"] = c.chunk_index
                    source["char_start"] = getattr(c, "char_start", None)
                    source["char_end"] = getattr(c, "char_end", None)
                sources.append(source)
            else:
                snippet = jd.extracted_text[:180]
                sources.append({"document": jd.filename, "page": None, "snippet": f"{snippet}..."})
        return sources

    def _sanitize_history(self, history: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Validate and trim conversation history.

        - Removes invalid roles and system messages (system should be set only by server)
        - Keeps only the most recent N user/assistant pairs
        - Truncates overly long messages
        """
        MAX_HISTORY = 6  # keep last 6 messages
        MAX_MESSAGE_CHARS = 1500
        allowed_roles = {"user", "assistant"}
        sanitized: List[Dict[str, str]] = []
        if not history:
            return sanitized
        for item in history:
            try:
                role = (item.get("role") or "").lower()
                content = (item.get("content") or "").strip()
            except Exception:
                continue
            if role not in allowed_roles:
                continue
            if not content:
                continue
            if len(content) > MAX_MESSAGE_CHARS:
                content = content[:MAX_MESSAGE_CHARS]
            sanitized.append({"role": role, "content": content})

        # limit to most recent messages
        return sanitized[-MAX_HISTORY:]

    def _call_openai(self, messages: List[Dict[str, str]]) -> Any:
        if not self.client:
            raise RuntimeError("OpenAI client not configured. Set OPENAI_API_KEY in environment.")

        # Use exponential backoff with jitter. Do not retry on authentication errors.
        for attempt in range(max(1, settings.OPENAI_RETRY_COUNT)):
            try:
                return self.client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=messages,
                    temperature=settings.OPENAI_TEMPERATURE,
                    max_tokens=settings.OPENAI_MAX_TOKENS,
                )
            except Exception as exc:  # pragma: no cover
                last_exc = exc
                msg = str(exc).lower()
                # Detect non-retriable errors
                if "401" in msg or "invalid" in msg and "api" in msg or "api key" in msg or "unauthorized" in msg:
                    logger.error("OpenAI authentication/config error: %s", exc)
                    raise RuntimeError("OpenAI authentication error") from exc
                # For rate limits or server errors, retry
                if "rate limit" in msg or "429" in msg or "timeout" in msg or "502" in msg or "503" in msg or "504" in msg:
                    wait = min(30, (2 ** attempt) + (0.1 * attempt))
                    jitter = wait * 0.1
                    sleep_for = wait + (jitter * (0.5 - attempt % 2))
                    logger.warning("OpenAI transient error (attempt %s): %s — retrying in %.1fs", attempt + 1, exc, sleep_for)
                    time.sleep(sleep_for)
                    continue
                # Unknown error: retry a limited number of times but log
                wait = min(10, (2 ** attempt))
                logger.warning("OpenAI call failed (attempt %s): %s — retrying in %ss", attempt + 1, exc, wait)
                time.sleep(wait)

        logger.error("OpenAI API failed after %s attempts: %s", settings.OPENAI_RETRY_COUNT, last_exc)
        raise RuntimeError("OpenAI API failed") from last_exc

    def generate_response(self, user_message: str, history: List[Dict[str, str]] | None = None) -> Dict[str, Any]:
        # Don't call LLM when there's no uploaded context to avoid hallucination
        resume = document_service.get_resume()
        jd = document_service.get_job_description()
        if not resume and not jd:
            # Opt-in behavior: if configured, allow the LLM to provide general
            # non-personalized career advice while clearly marking that it's
            # not based on uploaded documents. This avoids hard-coded fallbacks
            # but keeps hallucination risk explicit and opt-in.
            if settings.ALLOW_GENERAL_LLM and self.client:
                try:
                    system = (
                        "You are AI Career Assistant — provide general career and resume advice.\n"
                        "The user has not uploaded a resume or job description. Do NOT invent personal facts.\n"
                        "Make it explicit in the first sentence that this advice is general and not based on the user's documents.\n"
                        "Be structured and give actionable, conservative suggestions."
                    )
                    messages = [{"role": "system", "content": system}]
                    for item in history or []:
                        messages.append({"role": item["role"], "content": item["content"]})
                    messages.append({"role": "user", "content": user_message})

                    completion = self._call_openai(messages)
                    answer = getattr(completion.choices[0].message, "content", None) or completion.choices[0].message.content
                    if not answer:
                        return self._fallback_response(user_message)
                    return {"answer": answer, "sources": [], "modelUsed": settings.OPENAI_MODEL}
                except Exception as exc:  # pragma: no cover
                    logger.exception("General LLM call failed; falling back: %s", exc)

            return self._fallback_response(user_message)

        if self.client:
            try:
                messages = [{"role": "system", "content": self._build_system_prompt(user_message)}]
                for item in history or []:
                    messages.append({"role": item["role"], "content": item["content"]})
                messages.append({"role": "user", "content": user_message})

                completion = self._call_openai(messages)
                answer = getattr(completion.choices[0].message, "content", None) or completion.choices[0].message.content
                if not answer:
                    logger.warning("OpenAI returned empty content; using fallback")
                    return self._fallback_response(user_message)

                # If the model tries to invent facts, our system prompt instructs it not to.
                return {"answer": answer, "sources": self._build_sources(user_message), "modelUsed": settings.OPENAI_MODEL}
            except Exception as exc:  # pragma: no cover
                logger.exception("OpenAI API Error, falling back: %s", exc)

        return self._fallback_response(user_message)

    def stream_tokens(self, user_message: str, history: List[Dict[str, str]] | None = None):
        # Simple server-side streaming emulation: yield words from a generated response.
        response = self.generate_response(user_message, history)
        for chunk in response["answer"].split():
            yield chunk + " "

    def generate_job_fit_analysis(self) -> Dict[str, Any]:
        resume = document_service.get_resume()
        jd = document_service.get_job_description()
        if not resume or not jd:
            # If not both documents are available, offer an opt-in general analysis
            # when explicitly enabled. The general analysis must be conservative
            # and explicitly state it is not based on uploaded documents.
            if settings.ALLOW_GENERAL_LLM and self.client:
                try:
                    # Build a prompt that uses any available text but warns about missing context
                    context_parts = []
                    if resume:
                        context_parts.append("RESUME:\n" + resume.extracted_text[:3000])
                    if jd:
                        context_parts.append("JOB DESCRIPTION:\n" + jd.extracted_text[:2000])

                    prompt = (
                        "You are AI Career Assistant. The user requests a job-fit analysis but has not uploaded both documents.\n"
                        "Be explicit that your analysis is GENERAL and not based on full candidate documents.\n"
                        "If partial context is available, use it conservatively. Do NOT invent facts.\n\n"
                        + "\n\n".join(context_parts)
                        + "\n\nReturn a JSON object with keys: isComplete, overallMatch (0-100), matchGrade, matchingSkills, missingSkills, relevantExperience, recommendations.\n"
                        "When uncertain, set values to null or empty lists and include 'insufficient_context' in recommendations."
                    )

                    completion = self._call_openai([{"role": "user", "content": prompt}])
                    raw = getattr(completion.choices[0].message, "content", None) or completion.choices[0].message.content or "{}"
                    parsed = json.loads(raw)
                    required = ["isComplete", "overallMatch", "matchGrade", "matchingSkills", "missingSkills", "relevantExperience", "recommendations"]
                    if not all(k in parsed for k in required):
                        logger.warning("General job-fit JSON missing keys; returning conservative fallback")
                        raise ValueError("Missing keys in job-fit response")
                    # Annotate that this result was generated without full documents
                    parsed["note"] = "general_analysis_no_full_documents"
                    return parsed
                except Exception as exc:  # pragma: no cover
                    logger.exception("General job-fit analysis failed, falling back: %s", exc)

            return {
                "isComplete": False,
                "message": "Please upload both your Resume and Job Description to calculate AI match analysis.",
                "resumeUploaded": bool(resume),
                "jobDescriptionUploaded": bool(jd),
            }

        if self.client:
            prompt = (
                "Analyze this candidate's job fit. Return JSON only.\n\n"
                "RESUME:\n" + resume.extracted_text[:3000] + "\n\n"
                "JOB DESCRIPTION:\n" + jd.extracted_text[:2000] + "\n\n"
                "Return a JSON object with keys: isComplete, overallMatch (0-100), matchGrade, matchingSkills, missingSkills, relevantExperience, recommendations.\n"
                "If you cannot determine a value from the context, set it to null or an empty list and include 'insufficient_context' in recommendations."
            )
            try:
                completion = self._call_openai([{"role": "user", "content": prompt}])
                raw = getattr(completion.choices[0].message, "content", None) or completion.choices[0].message.content or "{}"
                parsed = json.loads(raw)
                # Basic validation of required keys
                required = ["isComplete", "overallMatch", "matchGrade", "matchingSkills", "missingSkills", "relevantExperience", "recommendations"]
                if not all(k in parsed for k in required):
                    logger.warning("Job fit JSON missing keys; returning fallback structure")
                    raise ValueError("Missing keys in job-fit response")
                return parsed
            except Exception as exc:  # pragma: no cover
                logger.exception("LLM job-fit error, using fallback: %s", exc)

        # Deterministic fallback (conservative, no fabrication)
        return {
            "isComplete": True,
            "overallMatch": 0,
            "matchGrade": "Insufficient data to assess",
            "matchingSkills": [],
            "missingSkills": [],
            "relevantExperience": [],
            "recommendations": ["insufficient_context"],
        }

    def generate_ats_score(self) -> Dict[str, Any]:
        resume = document_service.get_resume()
        jd = document_service.get_job_description()
        if not resume:
            return {"overallAtsScore": 0, "status": "No resume uploaded"}

        # Simple keyword-based ATS heuristic when JD is available
        if jd:
            resume_text = resume.extracted_text.lower()
            jd_text = jd.extracted_text.lower()
            # pick candidate keywords from JD by splitting and taking unique tokens longer than 3 chars
            jd_tokens = {t for t in re.findall(r"\b[a-zA-Z0-9+-]{4,}\b", jd_text)}
            if not jd_tokens:
                return {"overallAtsScore": 70, "status": "No keywords detected in job description"}
            matched = sum(1 for t in jd_tokens if t in resume_text)
            score = int((matched / max(1, len(jd_tokens))) * 100)
            return {
                "overallAtsScore": min(100, max(0, score)),
                "status": "Computed ATS heuristic",
                "details": [{"category": "KeywordMatch", "score": score}],
            }

        # If no JD, return a conservative default
        return {"overallAtsScore": 75, "status": "No job description provided; heuristic default"}

    def generate_interview_questions(self) -> List[Dict[str, Any]]:
        resume = document_service.get_resume()
        jd = document_service.get_job_description()
        if not resume and not jd:
            return []

        # Conservative, non-fabricating defaults that reference uploaded content
        return [
            {
                "id": "1",
                "category": "Technical",
                "difficulty": "Medium",
                "question": "Describe a project where you improved performance or user experience. Reference a specific project from your resume.",
                "suggestedAnswer": "Explain the problem, your decisions, the metrics you improved, and what you learned.",
                "keyPoints": ["System design", "Impact", "Trade-offs"],
            },
            {
                "id": "2",
                "category": "Behavioral",
                "difficulty": "Easy",
                "question": "How do you prioritize work when requirements are changing quickly? Give an example from your experience.",
                "suggestedAnswer": "Use communication, risk assessment, and iterative delivery to remain adaptable.",
                "keyPoints": ["Prioritization", "Communication", "Agility"],
            },
        ]


llm_service = LLMService()
