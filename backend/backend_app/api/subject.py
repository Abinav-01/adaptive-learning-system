from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend_app.db.session import get_db
from backend_app.schemas.subject import SubjectCreate, SubjectResponse
from backend_app.core.security import get_current_admin, get_current_user
from backend_app import models

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.post("/", response_model=SubjectResponse)
def create_subject(
    subject_in: SubjectCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)
):
    """Create a new subject (admin-only)."""
    # simple unique check
    existing = db.query(models.Subject).filter(models.Subject.name == subject_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject already exists")
    subject = models.Subject(name=subject_in.name)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.get("/", response_model=list[SubjectResponse])
def list_subjects(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """List all subjects (authenticated users)."""
    subjects = db.query(models.Subject).all()
    return subjects
