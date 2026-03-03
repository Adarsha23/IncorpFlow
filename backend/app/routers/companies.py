from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.company import CompanyCreate, CompanyResponse
from app.schemas.shareholder import ShareholderBulkCreate, ShareholderResponse
from app.services.company_service import CompanyService
from app.services.shareholder_service import ShareholderService

router = APIRouter(prefix="/companies", tags=["companies"])


@router.post("", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    service = CompanyService(db)
    return service.create_draft(payload)


@router.get("", response_model=list[CompanyResponse])
def list_companies(db: Session = Depends(get_db)):
    """Admin view: all companies ordered by newest first."""
    service = CompanyService(db)
    return service.get_all_companies()


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: UUID, db: Session = Depends(get_db)):
    service = CompanyService(db)
    return service.get_company(company_id)


@router.post(
    "/{company_id}/shareholders",
    response_model=list[ShareholderResponse],
    status_code=status.HTTP_201_CREATED,
)
def add_shareholders(
    company_id: UUID,
    payload: ShareholderBulkCreate,
    db: Session = Depends(get_db),
):
    service = ShareholderService(db)
    return service.add_shareholders(company_id, payload)
