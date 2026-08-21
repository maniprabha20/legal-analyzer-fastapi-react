from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from schemas import UserResponse, ChangePasswordRequest
from auth import get_current_user
from security import verify_password, hash_password

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(
        payload.current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = hash_password(
        payload.new_password
    )

    await db.commit()

    return {
        "message": "Password updated successfully"
    }