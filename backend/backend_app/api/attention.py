from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend_app.db.session import get_db
from backend_app.schemas.attention import AttentionLogCreate
from backend_app.models.attention_log import AttentionLog
from backend_app.core.security import get_current_user_optional

router = APIRouter()


@router.post("/attention-log")
def post_attention_log(payload: AttentionLogCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    """Receive periodic attention logs from the frontend and persist them.

    Payload: { lesson_id: str, attention_score: float, user_id?: str }
    """
    try:
        # If user is available from auth, prefer that id
        if current_user and getattr(current_user, "email", None):
            payload.user_id = getattr(current_user, "email")

        log = AttentionLog(lesson_id=payload.lesson_id, attention_score=payload.attention_score, user_id=payload.user_id)
        db.add(log)
        db.commit()
        db.refresh(log)
        return {"status": "ok", "id": log.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
