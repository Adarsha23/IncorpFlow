from uuid import UUID

from sqlalchemy.orm import Session

from app.models.shareholder import Shareholder
from app.schemas.shareholder import ShareholderCreate


class ShareholderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_bulk(self, company_id: UUID, shareholders: list[ShareholderCreate]) -> list[Shareholder]:
        db_shareholders = [
            Shareholder(company_id=company_id, **s.model_dump())
            for s in shareholders
        ]
        self.db.add_all(db_shareholders)
        self.db.commit()
        for s in db_shareholders:
            self.db.refresh(s)
        return db_shareholders

    def get_by_company(self, company_id: UUID) -> list[Shareholder]:
        return (
            self.db.query(Shareholder)
            .filter(Shareholder.company_id == company_id)
            .all()
        )

    def delete_by_company(self, company_id: UUID) -> None:
        self.db.query(Shareholder).filter(Shareholder.company_id == company_id).delete()
        self.db.commit()
