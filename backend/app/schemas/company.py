from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator

from app.models.company import CompanyStatus


class CompanyCreate(BaseModel):
    name: str
    company_type: str
    jurisdiction: str
    registered_address: str
    email: EmailStr
    phone: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Company name cannot be empty")
        return v.strip()


class CompanyResponse(BaseModel):
    id: UUID
    name: str
    company_type: str
    jurisdiction: str
    registered_address: str
    email: str
    phone: Optional[str]
    status: CompanyStatus
    created_at: datetime
    updated_at: datetime
    shareholders: list = []

    model_config = {"from_attributes": True}
