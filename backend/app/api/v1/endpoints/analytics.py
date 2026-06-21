from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.case import Case, CaseStatus
from app.models.auth import User, UserRole
from app.api.deps import RoleChecker

router = APIRouter()

# 🛡️ الحماية: هذا المسار متاح فقط للمدراء والشركاء (ADMIN, PARTNER)
allowed_viewers = RoleChecker([UserRole.ADMIN, UserRole.PARTNER])

@router.get("/summary", dependencies=[Depends(allowed_viewers)])
async def get_dashboard_analytics(db: AsyncSession = Depends(get_db)):
    """
    جلب ملخص الإحصائيات القانونية والمالية الشاملة للوحة التحكم الإدارية.
    """
    try:
        # --- 1. مؤشرات الأداء القانونية ---
        # عدد القضايا النشطة (Active)
        active_cases_stmt = select(func.count()).where(Case.status == CaseStatus.ACTIVE, Case.is_active == True)
        active_res = await db.execute(active_cases_stmt)
        active_count = active_res.scalar() or 0

        # عدد القضايا المغلقة (Closed)
        closed_cases_stmt = select(func.count()).where(Case.status == CaseStatus.CLOSED, Case.is_active == True)
        closed_res = await db.execute(closed_cases_stmt)
        closed_count = closed_res.scalar() or 0

        # --- 2. مؤشرات الأداء المالية ---
        # التدفقات النقدية الداخلة (إجمالي المبالغ المدفوعة مقدمًا أو المسددة)
        cash_in_stmt = select(func.sum(Case.amount_paid)).where(Case.is_active == True)
        cash_in_res = await db.execute(cash_in_stmt)
        total_cash_in = cash_in_res.scalar() or 0.0

        # المستحقات المعلقة (الديون المتبقية = إجمالي قيمة القضايا - المبالغ المدفوعة)
        total_value_stmt = select(func.sum(Case.case_value)).where(Case.is_active == True)
        total_value_res = await db.execute(total_value_stmt)
        total_cases_value = total_value_res.scalar() or 0.0
        
        pending_receivables = total_cases_value - total_cash_in

        # --- 3. أداء المحامين (عدد القضايا لكل محامي) ---
        # ملاحظة: يمكنك توسيع الموديل لاحقاً لإضافة حقل "نتيجة القضية: ربح/خسارة" لحساب نسبة النجاح بدقة
        lawyer_performance_stmt = (
            select(User.full_name, func.count(Case.id).label("total_cases"))
            .join(Case, Case.lawyer_id == User.id)
            .where(Case.is_active == True)
            .group_by(User.full_name)
        )
        lawyer_res = await db.execute(lawyer_performance_stmt)
        lawyers_data = [{"lawyer_name": row[0], "cases_count": row[1]} for row in lawyer_res.all()]

        return {
            "legal_metrics": {
                "active_cases": active_count,
                "closed_cases": closed_count,
                "total_cases": active_count + closed_count
            },
            "financial_metrics": {
                "total_cash_in": total_cash_in,
                "pending_receivables": max(0.0, pending_receivables), # لضمان عدم ظهور قيمة سالبة بالخطأ
                "total_revenue_expected": total_cases_value
            },
            "lawyers_performance": lawyers_data
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"حدث خطأ أثناء تجميع البيانات التقاريرية: {str(e)}"
        )