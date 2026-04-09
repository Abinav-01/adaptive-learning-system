from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend_app.db.session import get_db
from backend_app.rag.vector_service import VectorStoreManager
from backend_app.ai.llm_service import generate_lesson_slides
from backend_app.core.security import get_current_user, get_current_user_optional

router = APIRouter()

# In-memory manager instance
_manager = VectorStoreManager()

from backend_app.models.learning_session import LearningSession
from backend_app.models.lesson_content import LessonContent
import datetime
import json

@router.get("/{chapter_id}/generate")
def generate_lesson(chapter_id: str, topic: str = None, force_refresh: bool = False, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    """Generate structured lesson slides with intelligent caching and quality validation."""
    slides_data = None

    # Normalize topic — strip whitespace, lowercase for consistent caching
    clean_topic = topic.strip().lower() if topic and topic.strip() else None
    cache_key = f"{chapter_id}::{clean_topic}" if clean_topic else chapter_id

    # 1. Fetch & Validate Cache — only re-generate if content is marked fallback
    if not force_refresh:
        cached_lesson = db.query(LessonContent).filter(LessonContent.chapter_id == cache_key).first()
        if cached_lesson and not cached_lesson.is_fallback:
            try:
                parsed = json.loads(cached_lesson.content_json)
                if isinstance(parsed, list) and len(parsed) > 0:
                    slides_data = parsed
            except Exception:
                pass  # Bad JSON, fall through to regenerate

    # 2. Run Generation if Cache Miss or Rejected
    if not slides_data:
        print(f"🔄 Generating lesson for topic='{clean_topic or chapter_id}'...")
        try:
            retrieved = _manager.search(chapter_id, top_k=5)
        except Exception:
            retrieved = []

        result = generate_lesson_slides(chapter_id, retrieved, topic=clean_topic)
        slides_data = result["slides"]

        # 3. Persist cache
        cached_record = db.query(LessonContent).filter(LessonContent.chapter_id == cache_key).first()
        if cached_record:
            cached_record.content_json = json.dumps(slides_data)
            cached_record.is_fallback = result.get("is_fallback", False)
            cached_record.quality_score = result.get("quality_score", 0.0)
            cached_record.created_at = datetime.datetime.utcnow()
        else:
            db.add(LessonContent(
                chapter_id=cache_key,
                content_json=json.dumps(slides_data),
                is_fallback=result.get("is_fallback", False),
                quality_score=result.get("quality_score", 0.0)
            ))
        db.commit()
        print(f"✅ Lesson cached (Quality: {result.get('quality_score')}, Fallback: {result.get('is_fallback')})")

    # 4. History tracking — unique per (user, chapter, topic)
    if current_user:
        # Build a human-readable chapter name
        if clean_topic:
            c_name = clean_topic.title()
        elif chapter_id == "chapter_2":
            c_name = "Polynomials"
        else:
            c_name = f"Chapter {chapter_id.replace('chapter_', '')}"

        session_record = db.query(LearningSession).filter(
            LearningSession.user_id == current_user.id,
            LearningSession.chapter_id == chapter_id,
            LearningSession.topic == clean_topic
        ).first()

        if session_record:
            session_record.last_accessed = datetime.datetime.utcnow()
        else:
            db.add(LearningSession(
                user_id=current_user.id,
                chapter_id=chapter_id,
                chapter_name=c_name,
                topic=clean_topic
            ))
        db.commit()

    return {"chapter_title": cache_key, "slides": slides_data}


@router.post("/clear-cache")
def clear_lesson_cache(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Force clear all cached lesson content."""
    try:
        num_deleted = db.query(LessonContent).delete()
        db.commit()
        return {"status": "success", "message": f"Cleared {num_deleted} cached lessons."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
