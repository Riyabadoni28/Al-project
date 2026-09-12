from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

from app.services.chat_service import chat_service
from app.services.llm_service import llm_service

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatBody(BaseModel):
    message: str
    history: list[dict] | None = None


@router.post("/message")
def handle_chat_message(body: ChatBody):
    try:
        response = chat_service.handle_chat_message(body.message, body.history or [])
        return {"status": "success", "data": response}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.post("/stream")
async def handle_chat_stream(body: ChatBody):
    try:
        if not body.message or not body.message.strip():
            raise HTTPException(status_code=400, detail="Message content is required.")

        async def event_generator():
            try:
                # Generate full response first
                response = llm_service.generate_response(body.message, body.history or [])
                answer = response["answer"]
                sources = response["sources"]
                model_used = response["modelUsed"]

                # Stream tokens
                words = answer.split(" ")
                for word in words:
                    token = word + " "
                    yield f"event: token\ndata: {json.dumps({'token': token})}\n\n"
                    
                # Send completion event with metadata
                yield f"event: done\ndata: {json.dumps({'sources': sources, 'modelUsed': model_used})}\n\n"
            except Exception as err:
                yield f"event: error\ndata: {json.dumps({'message': str(err)})}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat stream error: {str(e)}")
