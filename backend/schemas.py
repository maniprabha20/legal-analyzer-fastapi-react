from pydantic import BaseModel
from datetime import datetime


class DocumentCreate(BaseModel):
    filename: str


class DocumentResponse(BaseModel):
    id: int
    filename: str
    status: str
    upload_date: datetime

    class Config:
        from_attributes = True