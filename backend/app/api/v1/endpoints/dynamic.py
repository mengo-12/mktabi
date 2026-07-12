# backend\app\api\v1\endpoints\dynamic.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload  
from typing import List, Dict, Any

from app.core.database import get_db 
from app.models.dynamic import CustomSection, CustomTable, CustomRow
from app.schemas.dynamic import (
    SectionCreate, SectionResponse, 
    TableCreate, TableResponse, 
    RowCreate, RowResponse
)

# 🌟 الاستيرادات الأمنية
from app.api.deps import get_current_user, sanitize_staff_permissions
from app.models.auth import User, UserRole

router = APIRouter()

# -----------------------------------------------------------------------------
# 🛠️ دالة مساعدة مركزية للتحقق من الصلاحية الحركية (قفل الأمان الموحد)
# -----------------------------------------------------------------------------
def check_dynamic_permission(current_user: User, table_id: int, required_level: str):
    """
    تتحقق مما إذا كان المستخدم يمتلك الصلاحية المطلوبة للجدول المعين.
    required_level: 'read' أو 'write'
    """

    # الأدمن والمدير يتجاوزان جميع القيود
    if not getattr(current_user, "is_dynamic_staff", False):
        return True

    user_permissions = current_user.dynamic_permissions or {}
    table_perm = user_permissions.get(str(table_id))

    # لا توجد أي صلاحية لهذا الجدول
    if not table_perm or table_perm == "no_access":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="⚠️ عذراً، لا تمتلك صلاحية الوصول لهذا الجدول."
        )

    # صلاحية قراءة فقط
    if required_level == "write" and table_perm == "read_only":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="🔒 عذراً، تمتلك صلاحية القراءة فقط، ولا يمكنك إضافة أو تعديل أو حذف البيانات."
        )

    return True


# ==================== 1. إدارة صفحات الـ Sidebar ====================

@router.post("/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    section: SectionCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # حماية الهيكل: الموظف لا يمكنه إنشاء أقسام رئيسية بالنظام
    if getattr(current_user, "is_dynamic_staff", False):
        raise HTTPException(status_code=403, detail="غير مصرح لك بإنشاء أقسام رئيسية.")
        
    db_section = CustomSection(**section.model_dump())
    db.add(db_section)
    await db.commit()
    await db.refresh(db_section, ["tables"]) 
    return db_section


@router.get("/sections")
async def get_sections(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(CustomSection).options(selectinload(CustomSection.tables)).order_by(CustomSection.order)
    result = await db.execute(stmt)
    sections = result.scalars().all()
    
    if current_user.role in [
        UserRole.ADMIN,
        UserRole.PARTNER
    ]:
        return sections

    # تصفية القوائم بناءً على مصفوفة الصلاحيات الحركية للموظف
    if getattr(current_user, "is_dynamic_staff", False):
        user_perms = current_user.dynamic_permissions or {}
        filtered_sections = []
        
        for section in sections:
            allowed_tables = []
            for table in section.tables:
                table_id_str = str(table.id)
                
                # استثناء: جدول الموظفين يظهر دوماً كقراءة فقط للموظف لضمان بيئة العمل
                if hasattr(current_user, 'staff_table_id') and table.id == current_user.staff_table_id:
                    table_data = table.__dict__.copy()
                    table_data["user_permission"] = "read_only" 
                    allowed_tables.append(table_data)
                    continue

                permission = user_perms.get(table_id_str, "no_access")

                if permission == "no_access":
                    continue

                table_data = table.__dict__.copy()
                table_data["user_permission"] = permission
                allowed_tables.append(table_data)
                
                table_data = table.__dict__.copy()
                table_data["user_permission"] = user_perms.get(
                    table_id_str,
                    "read_only"
                )
                allowed_tables.append(table_data)
            
            if allowed_tables:
                section_data = section.__dict__.copy()
                section_data["tables"] = allowed_tables
                filtered_sections.append(section_data)
                
        return filtered_sections

    return sections


@router.put("/sections/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: int, 
    section_data: SectionCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "is_dynamic_staff", False):
        raise HTTPException(status_code=403, detail="غير مصرح لك بتعديل الأقسام الرئيسية.")

    db_section = await db.get(CustomSection, section_id)
    if not db_section:
        raise HTTPException(status_code=404, detail="القسم المطلوب تعديله غير موجود")
    db_section.title = section_data.title
    await db.commit()
    await db.refresh(db_section, ["tables"])
    return db_section


@router.delete("/sections/{section_id}", status_code=status.HTTP_200_OK)
async def delete_section(
    section_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "is_dynamic_staff", False):
        raise HTTPException(status_code=403, detail="غير مصرح لك بحذف الأقسام الرئيسية.")

    db_section = await db.get(CustomSection, section_id)
    if not db_section:
        raise HTTPException(status_code=404, detail="القسم المطلوب حذفه غير موجود")
    await db.delete(db_section)
    await db.commit()
    return {"status": "success", "message": "تم حذف القسم بنجاح"}


# ==================== 2. إدارة الجداول وهيكلة الأعمدة ====================

@router.post("/tables", response_model=TableResponse)
async def create_table(
    table: TableCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "is_dynamic_staff", False):
        raise HTTPException(status_code=403, detail="غير مصرح للموظفين بإنشاء جداول جديدة.")

    section_check = await db.get(CustomSection, table.section_id)
    if not section_check:
        raise HTTPException(status_code=404, detail="القسم الرئيسي غير موجود")
        
    db_table = CustomTable(**table.model_dump())
    db.add(db_table)
    await db.commit()
    await db.refresh(db_table)
    return db_table


@router.get("/sections/{section_id}/tables", response_model=List[TableResponse])
async def get_tables_by_section(
    section_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    result = await db.execute(
        select(CustomTable)
        .filter(CustomTable.section_id == section_id)
    )

    tables = result.scalars().all()


    # =====================================
    # ADMIN يرى كل شيء
    # =====================================

    if (
        current_user.role == UserRole.ADMIN
        or current_user.role == UserRole.PARTNER
    ):
        for table in tables:
            table.user_permission = "read_write"

        return tables

    # =====================================
    # الموظف الديناميكي
    # =====================================

    if getattr(current_user, "is_dynamic_staff", False):

        permissions = current_user.dynamic_permissions or {}

        allowed_tables = []

        for table in tables:

            permission = permissions.get(
                str(table.id),
                "no_access"
            )

            if permission == "no_access":
                continue
            table.user_permission = permission
            allowed_tables.append(table)

        return allowed_tables

    return []


from app.schemas.dynamic import TableSchemaUpdate 

@router.put("/tables/{table_id}", response_model=TableResponse)
async def update_table_structure(
    table_id: int, 
    updated_data: TableSchemaUpdate, # 🎯 استخدام الـ Schema بدلاً من الـ Dict المفتوح
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "is_dynamic_staff", False):
        raise HTTPException(status_code=403, detail="غير مصرح للموظفين بتعديل هيكلية الجداول أو الأعمدة.")

    db_table = await db.get(CustomTable, table_id)
    if not db_table:
        raise HTTPException(status_code=404, detail="الجدول المستهدف غير موجود")
    
    # تحديث الحقول المسموح بها فقط بأمان
    db_table.name = updated_data.name
    db_table.columns_definition = [col.model_dump() for col in updated_data.columns_definition]
    db_table.view_mode = updated_data.default_view
    db_table.is_staff_table = updated_data.is_staff_table
    if updated_data.calendar_mapping:
        db_table.calendar_mapping = updated_data.calendar_mapping
    
    await db.commit()
    await db.refresh(db_table)
    return db_table

@router.delete("/tables/{table_id}", status_code=status.HTTP_200_OK)
async def delete_table(
    table_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if getattr(current_user, "is_dynamic_staff", False):
        raise HTTPException(status_code=403, detail="إجراء محظور. لا يمكنك حذف الجداول.")

    db_table = await db.get(CustomTable, table_id)
    if not db_table:
        raise HTTPException(status_code=404, detail="الجدول غير موجود")
    
    await db.delete(db_table)
    await db.commit()
    return {"status": "success", "message": "تم حذف الجدول بنجاح"}


# ==================== 3. نظام الأسطر والبيانات (الصفوف) ====================

@router.post("/tables/{table_id}/rows", status_code=status.HTTP_201_CREATED)
async def create_row(
    table_id: int,
    row_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    table_check = await db.get(CustomTable, table_id)
    if not table_check:
        raise HTTPException(status_code=404, detail="الجدول المستهدف غير موجود")

    # 🔒 [قفل أمان موحد]: فحص صلاحية الكتابة للموظف
    check_dynamic_permission(current_user, table_id, required_level="write")
            
    # 🛑 [حماية جدول الموظفين]: منع أي موظف من توليد حسابات أو موظفين جدد
    if getattr(current_user, "is_dynamic_staff", False) and table_check.is_staff_table:
        raise HTTPException(
            status_code=403,
            detail="غير مصرح لك بإضافة موظفين، هذه الصلاحية للمحامي المدير فقط."
        )

    cells_content = row_data.get("cells_data", row_data)

    # 🧼 [تطهير الصلاحيات]: حماية حقول مصفوفة الصلاحيات لمنع التلاعب بها عند الإدخال
    if table_check.is_staff_table:
        cells_content = sanitize_staff_permissions(cells_content, table_id)

    db_row = CustomRow(table_id=table_id, cells_data=cells_content)
    db.add(db_row)
    await db.commit()
    await db.refresh(db_row)
    return db_row


@router.get("/tables/{table_id}/rows", response_model=List[RowResponse])
async def get_table_rows(
    table_id: int, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # 🔒 [قفل أمان موحد]: فحص صلاحية القراءة ومنع الـ hidden
    check_dynamic_permission(current_user, table_id, required_level="read")

    result = await db.execute(
        select(CustomRow)
        .filter(CustomRow.table_id == table_id)
        .order_by(CustomRow.id.asc()) 
    )
    return result.scalars().all()


@router.put("/rows/{row_id}", response_model=RowResponse)
async def update_row_cell(
    row_id: int, 
    updated_cells: Dict[str, Any], 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CustomRow).filter(CustomRow.id == row_id))
    db_row = result.scalar_one_or_none()
    
    if not db_row:
        raise HTTPException(status_code=404, detail="السجل غير موجود")
        
    table_check = await db.get(CustomTable, db_row.table_id)

    # 🔒 [قفل أمان موحد]: فحص صلاحية التعديل
    check_dynamic_permission(current_user, db_row.table_id, required_level="write")
            
    # 🛑 [حماية جدول الموظفين]: منع الموظف من تعديل بيانات أو رتب زملائه
    if getattr(current_user, "is_dynamic_staff", False) and table_check and table_check.is_staff_table:
        raise HTTPException(
            status_code=403,
            detail="غير مصرح للموظفين بتعديل سجلات جدول الموظفين والصلاحيات."
        )

    actual_data = updated_cells.get("cells_data", updated_cells) if isinstance(updated_cells, dict) else updated_cells
    current_data = dict(db_row.cells_data) if db_row.cells_data else {}
    current_data.update(actual_data)
    
    # 🧼 [تطهير الصلاحيات]
    if table_check and table_check.is_staff_table:
        current_data = sanitize_staff_permissions(current_data, db_row.table_id)
        
    db_row.cells_data = current_data
    await db.commit()
    await db.refresh(db_row)
    return db_row


@router.delete("/rows/{row_id}", status_code=status.HTTP_200_OK)
async def delete_row(
    row_id: int, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CustomRow).filter(CustomRow.id == row_id))
    db_row = result.scalar_one_or_none()
    
    if not db_row:
        raise HTTPException(status_code=404, detail="السجل المطلوب لحذفه غير موجود")
        
    table_check = await db.get(CustomTable, db_row.table_id)

    # 🔒 [قفل أمان موحد]: فحص صلاحيات الحذف للموظف الديناميكي
    check_dynamic_permission(current_user, db_row.table_id, required_level="write")
        
    # 🛑 منع حذف سجلات من جدول الموظفين عبر طاقم العمل الديناميكي
    if getattr(current_user, "is_dynamic_staff", False) and table_check and table_check.is_staff_table:
        raise HTTPException(
            status_code=403,
            detail="إجراء محظور. لا يمكنك حذف سجلات من جدول الموظفين."
        )
        
    await db.delete(db_row)
    await db.commit()
    return {"status": "success", "message": "تم حذف السجل بنجاح"}


@router.get("/tables/all", response_model=List[TableResponse])
async def get_all_tables(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # حماية هذا المسار العام لضمان تصفية الجداول المحجوبة عن الموظف
    result = await db.execute(select(CustomTable))
    tables = result.scalars().all()
    
    if getattr(current_user, "is_dynamic_staff", False):
        user_perms = current_user.dynamic_permissions or {}
        return [t for t in tables if user_perms.get(str(t.id), "no_access") != "no_access"]
        
    return tables