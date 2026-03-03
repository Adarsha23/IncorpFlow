import uuid

from sqlalchemy import Column, String, Float, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Shareholder(Base):
    __tablename__ = "shareholders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    nationality = Column(String(100), nullable=False)
    share_percentage = Column(Float, nullable=False)
    share_type = Column(String(50), nullable=False, default="Common")

    company = relationship("Company", back_populates="shareholders")

    __table_args__ = (
        CheckConstraint(
            "share_percentage > 0 AND share_percentage <= 100",
            name="valid_share_percentage",
        ),
    )
