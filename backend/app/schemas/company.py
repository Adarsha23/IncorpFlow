from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator

from app.models.company import CompanyStatus
from app.schemas.shareholder import ShareholderResponse


class CompanyCreate(BaseModel):
    name: str
    num_shareholders: int
    total_capital: float
    company_type: str = "Private Limited"
    jurisdiction: str = "United States"
    registered_address: str = "Default Address"
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
    num_shareholders: int
    total_capital: float
    company_type: str
    jurisdiction: str
    registered_address: str
    email: str
    phone: Optional[str]
    status: CompanyStatus
    created_at: datetime
    updated_at: datetime
    shareholders: List[ShareholderResponse] = []

    model_config = {"from_attributes": True}
