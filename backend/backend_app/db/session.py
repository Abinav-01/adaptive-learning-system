from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from typing import Generator
from backend_app.core.config import settings


# Use DATABASE_URL from settings (loaded from .env)
DATABASE_URL = getattr(settings, "DATABASE_URL", "sqlite:///./backend/app.db")

# For SQLite, disable same-thread check used by SQLAlchemy when using threads
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator:
    """FastAPI dependency that yields a SQLAlchemy session and ensures it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
