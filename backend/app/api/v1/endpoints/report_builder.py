from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user

from app.core.database import get_db

from app.schemas.report_builder import ReportBuilderResponse

from app.services.report_builder_service import ReportBuilderService
from app.schemas.report_builder import ReportRunRequest
from app.services.report_runner_service import ReportRunnerService
from app.schemas.report_builder import ReportBuilderCreate

router = APIRouter()


@router.get("/", response_model=list[ReportBuilderResponse])
async def get_reports(
    db: AsyncSession = Depends(get_db),
):
    return await ReportBuilderService.get_reports(db)


@router.get("/datasources")
async def get_datasources(db: AsyncSession = Depends(get_db)):

    return await ReportBuilderService.get_datasources(db)



@router.get("/{report_id}", response_model=ReportBuilderResponse)
async def get_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
):
    report = await ReportBuilderService.get_report(
        db,
        report_id,
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    return report


@router.post("/run")
async def run_report(
    payload: ReportRunRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return await ReportRunnerService.run_query(db, payload.model_dump())


@router.post("/", response_model=ReportBuilderResponse)
async def create_report(
    payload: ReportBuilderCreate,
    db: AsyncSession = Depends(get_db),
):

    return await ReportBuilderService.create_report(
        db,
        payload
    )
