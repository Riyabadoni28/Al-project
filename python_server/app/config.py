import os
from typing import List

from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = "AI Career Assistant Backend"
    APP_VERSION = "1.0.0"
    ENVIRONMENT = os.getenv("NODE_ENV", "development")
    PORT = int(os.getenv("PORT", "8001"))
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    CLIENT_URLS: List[str] = [
        item.strip()
        for item in os.getenv("CLIENT_URL", "http://localhost:4200,http://localhost:8001,https://al-project-fe.vercel.app").split(",")
        if item.strip()
    ]


settings = Settings()
