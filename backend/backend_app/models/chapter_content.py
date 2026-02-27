from sqlalchemy import Column, Integer, String, Text
from backend_app.db.base import Base


class ChapterContent(Base):
    __tablename__ = "chapter_contents"

    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    source = Column(String, nullable=True)
