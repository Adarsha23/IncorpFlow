from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator


class ShareholderCreate(BaseModel):
    name: str
    email: EmailStr
    nationality: str
    share_percentage: float
    share_type: str = "Common"

    @field_validator("share_percentage")
    @classmethod
    def valid_percentage(cls, v: float) -> float:
        if v <= 0 or v > 100:
            raise ValueError("share_percentage must be between 0 and 100")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Shareholder name cannot be empty")
        return v.strip()


class ShareholderResponse(BaseModel):
    id: UUID
    company_id: UUID
    name: str
    email: str
    nationality: str
    share_percentage: float
    share_type: str

    model_config = {"from_attributes": True}


class ShareholderBulkCreate(BaseModel):
    shareholders: list[ShareholderCreate]

    @field_validator("shareholders")
    @classmethod
    def total_shares_valid(cls, v: list[ShareholderCreate]) -> list[ShareholderCreate]:
        if not v:
            raise ValueError("At least one shareholder is required")
        total = sum(s.share_percentage for s in v)
        if abs(total - 100.0) > 0.01:
            raise ValueError(f"Total share percentage must equal 100% (got {total:.2f}%)")
        return v
