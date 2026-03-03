import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Enum, func, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class CompanyStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    COMPLETED = "COMPLETED"


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    company_type = Column(String(100), nullable=False)
    jurisdiction = Column(String(100), nullable=False)
    registered_address = Column(String(500), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    num_shareholders = Column(Integer, nullable=False, default=1)
    total_capital = Column(Float, nullable=False, default=0.0)
    status = Column(Enum(CompanyStatus), nullable=False, default=CompanyStatus.DRAFT)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    shareholders = relationship(
        "Shareholder",
        back_populates="company",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
