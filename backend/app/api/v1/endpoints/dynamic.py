from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from app.core.database import get_db 
from app.models.dynamic import CustomSection, CustomTable, CustomRow
from app.schemas.dynamic import (
    SectionCreate, SectionResponse, 
    TableCreate, TableResponse, 
    RowCreate, RowResponse
)

router = APIRouter()

# ==================== 1. إدارة صفحات الـ Sidebar ====================

@router.post("/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(section: SectionCreate, db: AsyncSession = Depends(get_db)):
    db_section = CustomSection(**section.model_dump())
    db.add(db_section)
    await db.commit()
    await db.refresh(db_section)
    return db_section

@router.get("/sections", response_model=List[SectionResponse])
async def get_sections(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CustomSection).order_by(CustomSection.order))
    return result.scalars().all()


# ==================== 2. إدارة الجداول وهيكلة الأعمدة ====================

@router.post("/tables", response_model=TableResponse)
async def create_table(table: TableCreate, db: AsyncSession = Depends(get_db)):
    section_check = await db.get(CustomSection, table.section_id)
    if not section_check:
        raise HTTPException(status_code=404, detail="القسم الرئيسي غير موجود")
        
    db_table = CustomTable(**table.model_dump())
    db.add(db_table)
    await db.commit()
    await db.refresh(db_table)
    return db_table

@router.get("/sections/{section_id}/tables", response_model=List[TableResponse])
async def get_tables_by_section(section_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CustomTable).filter(CustomTable.section_id == section_id))
    return result.scalars().all()

# ✅ تعديل هيكل الجدول (الأعمدة والاسم) بشكل ديناميكي مرن (حل خطأ 422)
@router.put("/tables/{table_id}", response_model=TableResponse)
async def update_table_structure(table_id: int, updated_data: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    db_table = await db.get(CustomTable, table_id)
    if not db_table:
        raise HTTPException(status_code=404, detail="الجدول المستهدف غير موجود")
    
    if "name" in updated_data:
        db_table.name = updated_data["name"]
    if "columns_definition" in updated_data:
        db_table.columns_definition = updated_data["columns_definition"]
    if "view_mode" in updated_data:
        db_table.view_mode = updated_data["view_mode"]

    if "calendar_mapping" in updated_data:
        db_table.calendar_mapping = updated_data["calendar_mapping"]
    
    await db.commit()
    await db.refresh(db_table)
    return db_table

# ✅ حذف الجدول بالكامل
@router.delete("/tables/{table_id}", status_code=status.HTTP_200_OK)
async def delete_table(table_id: int, db: AsyncSession = Depends(get_db)):
    db_table = await db.get(CustomTable, table_id)
    if not db_table:
        raise HTTPException(status_code=404, detail="الجدول غير موجود")
    
    await db.delete(db_table)
    await db.commit()
    return {"status": "success", "message": "تم حذف الجدول بنجاح"}


# ==================== 3. نظام الأسطر والبيانات (الصفوف) ====================

@router.post("/rows", response_model=RowResponse, status_code=status.HTTP_201_CREATED)
async def add_new_row(row: RowCreate, db: AsyncSession = Depends(get_db)):
    table_check = await db.get(CustomTable, row.table_id)
    if not table_check:
        raise HTTPException(status_code=404, detail="الجدول المستهدف غير موجود")

    db_row = CustomRow(**row.model_dump())
    db.add(db_row)
    await db.commit()
    await db.refresh(db_row)
    return db_row

@router.get("/tables/{table_id}/rows", response_model=List[RowResponse])
async def get_table_rows(table_id: int, db: AsyncSession = Depends(get_db)):
    # 🎯 الإصلاح: فرز الصفوف دائماً حسب المعرف لضمان عدم قفز الصف عند التعديل
    result = await db.execute(
        select(CustomRow)
        .filter(CustomRow.table_id == table_id)
        .order_by(CustomRow.id.asc()) 
    )
    return result.scalars().all()

# ✅ المسار الصحيح لتعديل خلايا الصف (حل خطأ 405 Method Not Allowed)
@router.put("/rows/{row_id}", response_model=RowResponse)
async def update_row_cell(row_id: int, updated_cells: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CustomRow).filter(CustomRow.id == row_id))
    db_row = result.scalar_one_or_none()
    
    if not db_row:
        raise HTTPException(status_code=404, detail="السجل غير موجود")
    
    # استخراج البيانات سواء جاءت مباشرة أو مغلفة بداخل مفتاح cells_data
    actual_data = updated_cells.get("cells_data", updated_cells) if isinstance(updated_cells, dict) else updated_cells

    current_data = dict(db_row.cells_data) if db_row.cells_data else {}
    current_data.update(actual_data)
    
    db_row.cells_data = current_data
    await db.commit()
    await db.refresh(db_row)
    return db_row

# ✅ حذف صف معين
@router.delete("/rows/{row_id}", status_code=status.HTTP_200_OK)
async def delete_row(row_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CustomRow).filter(CustomRow.id == row_id))
    db_row = result.scalar_one_or_none()
    
    if not db_row:
        raise HTTPException(status_code=404, detail="السجل المطلوب لحذفه غير موجود")
        
    await db.delete(db_row)
    await db.commit()
    return {"status": "success", "message": "تم حذف السجل بنجاح"}