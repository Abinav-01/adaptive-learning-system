from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import DB Base and engine for initialization on startup
from backend_app.db.base import Base
from backend_app.db.session import engine
# Import models package so SQLAlchemy models are registered with Base
import backend_app.models  # noqa: F401
from backend_app.api.user import router as user_router
from backend_app.api.subject import router as subject_router
from backend_app.api.lesson import router as lesson_router
from backend_app.api.attention import router as attention_router
from backend_app.core.config import settings


app = FastAPI()

# CORS - allow all origins for now (MVP)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    """Create database tables (if they don't exist) and print status."""
    Base.metadata.create_all(bind=engine)
    print("Database connected")


app.include_router(user_router)
app.include_router(subject_router)
app.include_router(lesson_router, prefix="/lessons", tags=["Lessons"])
app.include_router(attention_router, prefix="/lessons", tags=["Lessons"])


@app.get("/", response_class=JSONResponse)
async def root():
    """Health/root endpoint for quick verification."""
    return {"message": "Backend running"}


if __name__ == "__main__":
    import uvicorn

    # Run with: python main.py (development only)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
