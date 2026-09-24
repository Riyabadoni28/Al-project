import os
from typing import List

from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = "AI Career Assistant Backend"
    APP_VERSION = "1.0.0"
    ENVIRONMENT = os.getenv("NODE_ENV", "development")
    PORT = int(os.getenv("PORT", "8001"))
    # Read OpenAI API key from environment variable. Do NOT hardcode secrets.
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    # Configurable OpenAI parameters with sensible defaults
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.4"))
    OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "1200"))
    OPENAI_RETRY_COUNT = int(os.getenv("OPENAI_RETRY_COUNT", "2"))
    CLIENT_URLS: List[str] = [
        item.strip()
        for item in os.getenv("CLIENT_URL", "http://localhost:4200,http://localhost:8001,https://al-project-fe.vercel.app").split(",")
        if item.strip()
    ]
    # When true, the backend may call the LLM to provide general (non-personalized)
    # career advice even when no resume or job description is uploaded. Keep disabled
    # by default to avoid accidental hallucinations; enable only for development
    # or with explicit consent via environment variable.
    ALLOW_GENERAL_LLM = os.getenv("ALLOW_GENERAL_LLM", "false").lower() in ("1", "true", "yes")


settings = Settings()
    