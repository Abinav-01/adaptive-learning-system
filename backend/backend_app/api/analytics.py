from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend_app.db.session import get_db
from backend_app.models.attention_log import AttentionLog
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter()

@router.get("/lesson/{lesson_id}")
def get_lesson_analytics(lesson_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Retrieve attention analytics and time-series data for a given lesson."""
    
    # 1. Fetch all chronologically ordered logs for this lesson (single query)
    logs = (
        db.query(AttentionLog)
        .filter(AttentionLog.lesson_id == lesson_id)
        .order_by(AttentionLog.created_at.asc())
        .all()
    )

    if not logs:
        return {
            "lesson_id": lesson_id,
            "average_attention_score": 0.0,
            "total_logs": 0,
            "focus_loss_count": 0,
            "session_duration": 0,
            "timeline": []
        }

    # 2. Process metrics in a single O(N) pass to avoid N+1 DB queries
    total_logs = len(logs)
    total_score = 0.0
    focus_loss_count = 0
    timeline = []
    
    previous_score = None
    
    for log in logs:
        # Build the timeline array
        timeline.append({
            "timestamp": log.created_at.isoformat() if log.created_at else None,
            "score": float(log.attention_score)
        })
        
        # Accumulate total score for average calculation
        total_score += log.attention_score
        
        # Count 1.0 -> 0.0 transitions (focus loss)
        if previous_score is not None:
            # We check if previous was > 0.5 (focused) and current is < 0.5 (unfocused) to be safe with floats
            if previous_score > 0.5 and log.attention_score < 0.5:
                focus_loss_count += 1
                
        previous_score = log.attention_score

    # 3. Compute final metrics
    average_attention_score = round(total_score / total_logs, 2)
    
    # Session duration (difference between first and last log)
    first_log_time = logs[0].created_at
    last_log_time = logs[-1].created_at
    session_duration = 0
    if first_log_time and last_log_time:
        delta = last_log_time - first_log_time
        session_duration = int(delta.total_seconds())

    # 4. Return formatted JSON response
    return {
        "lesson_id": lesson_id,
        "average_attention_score": average_attention_score,
        "total_logs": total_logs,
        "focus_loss_count": focus_loss_count,
        "session_duration": session_duration,
        "timeline": timeline
    }
