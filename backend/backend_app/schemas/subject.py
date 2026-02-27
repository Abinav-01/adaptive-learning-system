from pydantic import BaseModel
from typing import Optional


class SubjectCreate(BaseModel):
    name: str


class SubjectResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
