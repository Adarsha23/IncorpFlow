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
        # link the squad to the company and mark it done
        # check if company actually exists
        self.company_service.get_company(company_id)

        # wipe any existing squad members first to prevent duplicates
        self.repo.delete_by_company(company_id)

        # save the whole squad at once
        shareholders = self.repo.create_bulk(company_id, payload.shareholders)

        # officially mark as finished
        self.company_service.mark_completed(company_id)

        return shareholders

    def get_shareholders(self, company_id: UUID) -> list[Shareholder]:
        self.company_service.get_company(company_id)
        return self.repo.get_by_company(company_id)
