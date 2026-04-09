from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float
from backend_app.db.base import Base
import datetime

class LessonContent(Base):
    __tablename__ = "lesson_content"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(String, unique=True, index=True, nullable=False)
    content_json = Column(Text, nullable=False)
    is_fallback = Column(Boolean, default=False)
    quality_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
