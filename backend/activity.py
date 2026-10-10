from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import ActivityLog, Document, User
from auth import get_current_user

router = APIRouter(prefix="/activity", tags=["activity"])


class ActivityResponse(BaseModel):
    id: int
    action: str
    document_id: int | None = None
    document_filename: str | None = None
    created_at: datetime


async def log_activity(
    db: AsyncSession,
    user_id: int,
    action: str,
    document_id: int | None = None,
) -> None:
    """
    Records one row in the existing activity_log table for this user.

    Deliberately never raises: by the time this is called, the real action
    (upload, analysis, chat, download, delete) has already succeeded, and a
    logging problem must not turn that success into an error.
    """
    try:
        db.add(
            ActivityLog(
                user_id=user_id,
                action=action,
                document_id=document_id,
            )
        )
        await db.commit()
    except Exception as e:
        await db.rollback()
        print(f"[activity log error] {action}: {e}")


@router.get("", response_model=list[ActivityResponse])
async def list_recent_activity(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    limit = max(1, min(limit, 50))

    # Outer join: the filename is looked up from documents when the document
    # still exists. Rows for deleted documents have document_id NULL and come
    # back with no filename.
    result = await db.execute(
        select(ActivityLog, Document.filename)
        .outerjoin(Document, ActivityLog.document_id == Document.id)
        .where(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
        .limit(limit)
    )

    return [
        ActivityResponse(
            id=entry.id,
            action=entry.action,
            document_id=entry.document_id,
            document_filename=filename,
            created_at=entry.created_at,
        )
        for entry, filename in result.all()
    ]
