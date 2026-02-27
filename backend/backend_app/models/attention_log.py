from sqlalchemy import Column, Integer, String, Float, DateTime, func
from backend_app.db.base import Base


class AttentionLog(Base):
    __tablename__ = "attention_logs"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(String, nullable=False, index=True)
    attention_score = Column(Float, nullable=False)
    user_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
