import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import AnalysisReport, Document, User
from schemas import AnalysisResponse
from auth import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/{report_id}", response_model=AnalysisResponse)
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    
    # Fetch the report alone, no join, to get its document_id
    report_result = await db.execute(
        select(AnalysisReport).where(AnalysisReport.id == report_id)
    )
    report = report_result.scalar_one_or_none()

    if report is None:
        
        raise HTTPException(status_code=404, detail="Report not found")

    
    # Fetch the document separately to see its real owner
    doc_result = await db.execute(
        select(Document).where(Document.id == report.document_id)
    )
    document = doc_result.scalar_one_or_none()

    if document is None:
        
        raise HTTPException(status_code=404, detail="Report not found")

    
    # Now run the actual join query exactly as before, for comparison
    joined_result = await db.execute(
        select(AnalysisReport, Document)
        .join(Document, AnalysisReport.document_id == Document.id)
        .where(
            AnalysisReport.id == report_id,
            Document.user_id == current_user.id,
        )
    )
    row = joined_result.first()
    

    if row is None:
        raise HTTPException(status_code=404, detail="Report not found")

    report, _document = row

    return {
        "id": report.id,
        "document_id": report.document_id,
        "result": json.loads(report.result_json),
        "created_at": report.created_at,
    }