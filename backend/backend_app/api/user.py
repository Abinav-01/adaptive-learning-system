from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from backend_app.schemas.user import UserCreate, UserResponse
from backend_app.db.session import get_db
from backend_app.services.user_service import create_user
from backend_app.core.security import authenticate_user, create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate user and return JWT access token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}



@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user. Minimal — no validation beyond DB constraints."""
    # Creation will raise on unique constraint violation — surface as 400
    try:
        user = create_user(db, user_in)
    except Exception as exc:
        # Minimal error handling for duplicate email or DB issues
        raise HTTPException(status_code=400, detail=str(exc))
    return user

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user=Depends(get_current_user)):
    """Protected endpoint returning the current authenticated user."""
    return current_user
