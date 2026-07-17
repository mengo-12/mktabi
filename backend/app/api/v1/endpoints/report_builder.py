from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user

from app.core.database import get_db

from app.services.report_builder_service import ReportBuilderService
from app.schemas.report_builder import ReportRunRequest
from app.services.report_runner_service import ReportRunnerService

router = APIRouter()


@router.get("/datasources")
async def get_datasources(db: AsyncSession = Depends(get_db)):

    return await ReportBuilderService.get_datasources(db)


@router.post("/run")
async def run_report(
    payload: ReportRunRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return await ReportRunnerService.run_query(db, payload.model_dump())
