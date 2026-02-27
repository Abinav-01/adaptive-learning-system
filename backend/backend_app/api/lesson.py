from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend_app.db.session import get_db
from backend_app.rag.vector_service import VectorStoreManager
from backend_app.ai.llm_service import generate_lesson_slides
from backend_app.core.security import get_current_user

router = APIRouter()

# In-memory manager instance — for MVP this is fine; persist/load for production
_manager = VectorStoreManager()


@router.get("/{chapter_id}/generate")
def generate_lesson(chapter_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Generate structured lesson slides for a chapter using RAG + Groq LLM."""
    try:
        retrieved = _manager.search(chapter_id, top_k=5)
    except Exception as e:
        # If index is empty or search fails, proceed with empty context
        retrieved = []

    result = generate_lesson_slides(chapter_id, retrieved)
    # Ensure result is a dict containing 'slides'
    if not isinstance(result, dict) or "slides" not in result:
        raise HTTPException(status_code=500, detail="LLM did not return valid lesson JSON")
    return {"chapter_title": chapter_id, "slides": result["slides"]}
