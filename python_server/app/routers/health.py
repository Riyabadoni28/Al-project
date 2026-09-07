from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
def get_health_status():
    return {
        "status": "online",
        "service": "AI Career Assistant Backend",
        "version": "1.0.0",
        "phase": "Phase 1 - Architecture & Foundations",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
        "system": {
            "uptime": 0,
            "memoryUsage": {},
        },
    }
