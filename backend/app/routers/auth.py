from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..models import AdminUser
from ..security import (
    create_access_token,
    get_current_admin,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return schemas.TokenResponse(access_token=create_access_token(user.email))


@router.get("/me", response_model=schemas.AdminMe)
def me(current: AdminUser = Depends(get_current_admin)):
    return current


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: schemas.PasswordChange,
    current: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    current.hashed_password = hash_password(payload.new_password)
    db.commit()


@router.post("/change-email", response_model=schemas.TokenResponse)
def change_email(
    payload: schemas.EmailChange,
    current: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Change the login email. The JWT subject is the email, so the current
    token becomes invalid — a fresh token is returned in the same response."""
    if not verify_password(payload.password, current.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect",
        )
    existing = db.query(AdminUser).filter(
        AdminUser.email == payload.new_email, AdminUser.id != current.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already in use",
        )
    current.email = payload.new_email
    db.commit()
    return schemas.TokenResponse(access_token=create_access_token(payload.new_email))
