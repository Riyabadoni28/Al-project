from fastapi import APIRouter
import datetime

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
def get_health_status():
    """Health check endpoint - returns server status"""
    return {
        "status": "healthy",
        "service": "AI Career Assistant Backend",
        "version": "1.0.0",
        "phase": "Phase 7 - Complete Implementation",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "system": {
            "uptime": 0,
            "memoryUsage": {},
        },
    }
