from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.llm_service import llm_service

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatBody(BaseModel):
    message: str
    history: list[dict] | None = None


@router.post("/message")
def handle_chat_message(body: ChatBody):
    if not body.message or not body.message.strip():
        raise HTTPException(status_code=400, detail="Message content is required.")

    response = llm_service.generate_response(body.message, body.history or [])
    return {"status": "success", "data": response}


@router.post("/stream")
def handle_chat_stream(body: ChatBody):
    if not body.message or not body.message.strip():
        raise HTTPException(status_code=400, detail="Message content is required.")

    return {"status": "success", "data": llm_service.generate_response(body.message, body.history or [])}
