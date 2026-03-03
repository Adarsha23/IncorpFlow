from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.company import Company, CompanyStatus
from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyCreate, CompanyResponse


class CompanyService:
    def __init__(self, db: Session):
        self.repo = CompanyRepository(db)

    def create_draft(self, data: CompanyCreate) -> Company:
        return self.repo.create(data)

    def get_company(self, company_id: UUID) -> Company:
        company = self.repo.get_by_id(company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company {company_id} not found",
            )
        return company

    def get_all_companies(self) -> list[Company]:
        return self.repo.get_all()

    def mark_completed(self, company_id: UUID) -> Company:
        company = self.get_company(company_id)
        if company.status == CompanyStatus.COMPLETED:
            return company
        return self.repo.update_status(company, CompanyStatus.COMPLETED)
