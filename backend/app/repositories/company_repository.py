from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.company import Company, CompanyStatus
from app.schemas.company import CompanyCreate


class CompanyRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: CompanyCreate) -> Company:
        company = Company(**data.model_dump())
        self.db.add(company)
        self.db.commit()
        self.db.refresh(company)
        return company

    def get_by_id(self, company_id: UUID) -> Optional[Company]:
        return self.db.query(Company).filter(Company.id == company_id).first()

    def get_all(self) -> list[Company]:
        return (
            self.db.query(Company)
            .order_by(Company.created_at.desc())
            .all()
        )

    def update_status(self, company: Company, status: CompanyStatus) -> Company:
        company.status = status
        self.db.commit()
        self.db.refresh(company)
        return company
