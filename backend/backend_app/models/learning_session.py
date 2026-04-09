from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
import datetime
from backend_app.db.base import Base

class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    chapter_id = Column(String, nullable=False)
    chapter_name = Column(String, nullable=False)
    topic = Column(String, nullable=True)  # Specific topic within the chapter
    last_accessed = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
