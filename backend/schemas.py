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
class RiskItem(BaseModel):
    description: str
    risk_level: str
    page_number: int


class ClauseItem(BaseModel):
    title: str
    summary: str
    page_number: int


class KeyDateItem(BaseModel):
    description: str
    date_or_deadline: str
    page_number: int


class PaymentTermItem(BaseModel):
    description: str
    amount_or_terms: str
    page_number: int


class ObligationItem(BaseModel):
    party: str
    description: str
    page_number: int


class DocumentAnalysis(BaseModel):
    summary: str
    risks: list[RiskItem]
    key_clauses: list[ClauseItem]
    key_dates: list[KeyDateItem]
    payment_terms: list[PaymentTermItem]
    obligations: list[ObligationItem]
    recommendations: list[str]
    disclaimer: str


class AnalysisResponse(BaseModel):
    id: int
    document_id: int
    result: DocumentAnalysis
    created_at: datetime

    class Config:
        from_attributes = True    

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str        