from typing import Any, Dict, List, Optional

from app.services.llm_service import llm_service


class ChatService:
    """Chat service for handling chat messages and streaming responses."""

    def handle_chat_message(self, message: str, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Handle a standard chat message (non-streaming).
        
        Args:
            message: The user's message
            history: Optional chat history
            
        Returns:
            Dictionary with response, sources, and model used
        """
        if not message or not message.strip():
            raise ValueError("Message content is required")

        return llm_service.generate_response(message, history or [])

    def stream_chat_response(
        self, message: str, history: Optional[List[Dict[str, str]]] = None
    ) -> tuple[str, List[Dict[str, Any]], str]:
        """
        Stream a chat response token by token.
        
        Args:
            message: The user's message
            history: Optional chat history
            
        Yields:
            Tokens from the streaming response
            
        Returns:
            Tuple of (full_response, sources, model_used)
        """
        if not message or not message.strip():
            raise ValueError("Message content is required")

        # For now, we'll return a regular response and simulate streaming
        # In a real implementation, this would use OpenAI streaming API
        response = llm_service.generate_response(message, history or [])
        return response["answer"], response["sources"], response["modelUsed"]


chat_service = ChatService()
