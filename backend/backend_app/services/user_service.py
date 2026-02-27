from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend_app import models
from backend_app.schemas.user import UserCreate


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_user(db: Session, user_data: UserCreate):
    """Create a new user, hashing the password before storing.

    Returns the created User instance.
    """
    hashed = get_password_hash(user_data.password)
    user = models.User(
        email=user_data.email,
        hashed_password=hashed,
        full_name=user_data.full_name,
        role=getattr(user_data, "role", "student"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str):
    """Return a User by email or None."""
    return db.query(models.User).filter(models.User.email == email).first()
