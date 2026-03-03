from uuid import UUID

from sqlalchemy.orm import Session

from app.models.shareholder import Shareholder
from app.repositories.shareholder_repository import ShareholderRepository
from app.schemas.shareholder import ShareholderBulkCreate
from app.services.company_service import CompanyService


class ShareholderService:
    def __init__(self, db: Session):
        self.repo = ShareholderRepository(db)
        self.company_service = CompanyService(db)

    def add_shareholders(
        self, company_id: UUID, payload: ShareholderBulkCreate
    ) -> list[Shareholder]:
        # Validate company exists
        self.company_service.get_company(company_id)

        # Replace existing shareholders (idempotent re-submission)
        self.repo.delete_by_company(company_id)

        # Bulk insert new shareholders
        shareholders = self.repo.create_bulk(company_id, payload.shareholders)

        # Mark company as completed
        self.company_service.mark_completed(company_id)

        return shareholders

    def get_shareholders(self, company_id: UUID) -> list[Shareholder]:
        self.company_service.get_company(company_id)
        return self.repo.get_by_company(company_id)
