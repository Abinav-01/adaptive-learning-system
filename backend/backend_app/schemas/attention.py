from pydantic import BaseModel
from typing import Optional


class AttentionLogCreate(BaseModel):
    lesson_id: str
    attention_score: float
    user_id: Optional[str] = None

    class Config:
        orm_mode = True
