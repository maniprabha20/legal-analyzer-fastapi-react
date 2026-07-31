from pydantic import BaseModel, EmailStr
from datetime import datetime


# -------- Document Schemas --------




class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    status: str
    upload_date: datetime

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True
class UploadResponse(BaseModel):
    id: int
    filename: str
    status: str
    upload_date: datetime

    class Config:
        from_attributes = True        


# -------- Auth Schemas --------

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"