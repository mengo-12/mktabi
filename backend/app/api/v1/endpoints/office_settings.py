from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.office_settings import CustomTemplate
from app.schemas.office_settings import CustomTemplateCreate, CustomTemplateResponse, CustomTemplateUpdate
from app.models.office_settings import GeneratedDocument
from app.schemas.office_settings import GeneratedDocumentCreate, GeneratedDocumentResponse

router = APIRouter()

# ➕ 1. إنشاء قالب مستند جديد تماماً
@router.post("/templates", response_model=CustomTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_document_template(payload: CustomTemplateCreate, db: AsyncSession = Depends(get_db)):
    db_template = CustomTemplate(**payload.model_dump())
    db.add(db_template)
    await db.commit()
    await db.refresh(db_template)
    return db_template

# 📋 2. جلب جميع القوالب التي صممها المحامي
@router.get("/templates", response_model=List[CustomTemplateResponse])
async def get_all_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CustomTemplate))
    return result.scalars().all()

# 🔍 3. جلب قالب معين بواسطة المعرف (ID)
@router.get("/templates/{template_id}", response_model=CustomTemplateResponse)
async def get_template_by_id(template_id: int, db: AsyncSession = Depends(get_db)):
    db_template = await db.get(CustomTemplate, template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="قالب المستند غير موجود")
    return db_template

# 🔄 4. تعديل وتحديث التصميم أو النص الخاص بالقالب
@router.put("/templates/{template_id}", response_model=CustomTemplateResponse)
async def update_document_template(template_id: int, payload: CustomTemplateUpdate, db: AsyncSession = Depends(get_db)):
    db_template = await db.get(CustomTemplate, template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="قالب المستند المستهدف غير موجود")
        
    db_template.title = payload.title
    db_template.template_type = payload.template_type
    db_template.visual_design = payload.visual_design
    db_template.content_body = payload.content_body
    db_template.variables_meta = payload.variables_meta
    
    await db.commit()
    await db.refresh(db_template)
    return db_template

# ❌ 5. حذف قالب مستند
@router.delete("/templates/{template_id}", status_code=status.HTTP_200_OK)
async def delete_template(template_id: int, db: AsyncSession = Depends(get_db)):
    db_template = await db.get(CustomTemplate, template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="القالب غير موجود")
    await db.delete(db_template)
    await db.commit()
    return {"status": "success", "message": "تم حذف القالب بنجاح"}

# 💾 1. حفظ وتوليد مستند جديد في الأرشيف
@router.post("/generated", response_model=GeneratedDocumentResponse, status_code=status.HTTP_201_CREATED)
async def save_generated_document(payload: GeneratedDocumentCreate, db: AsyncSession = Depends(get_db)):
    db_doc = GeneratedDocument(**payload.model_dump())
    db.add(db_doc)
    await db.commit()
    await db.refresh(db_doc)
    return db_doc

# 🔍 2. جلب جميع المستندات المؤرشفة التابعة لسجل/قضية معينة (تُعرض داخل ملف القضية بالفروينت إند)
@router.get("/rows/{row_id}/documents", response_model=List[GeneratedDocumentResponse])
async def get_documents_by_row(row_id: int, table_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GeneratedDocument)
        .filter(GeneratedDocument.row_id == row_id, GeneratedDocument.table_id == table_id)
        .order_by(GeneratedDocument.created_at.desc())
    )
    return result.scalars().all()

# ❌ 3. حذف مستند من الأرشيف
@router.delete("/generated/{document_id}", status_code=status.HTTP_200_OK)
async def delete_generated_document(document_id: int, db: AsyncSession = Depends(get_db)):
    db_doc = await db.get(GeneratedDocument, document_id)
    if not db_doc:
        raise HTTPException(status_code=404, detail="المستند غير موجود في الأرشيف")
    await db.delete(db_doc)
    await db.commit()
    return {"status": "success", "message": "تم حذف المستند من الأرشيف بنجاح"}

# أضف هذا المسار في نهاية ملف office_settings.py ليلبي طلب الـ /api/v1/office-settings/
@router.get("/")
async def get_default_office_settings():
    return {
        "primary_color": "#f59e0b",
        "logo_url": "",
        "header_data": {
            "office_name_ar": "مكتب المحاماة الرقمي",
            "tax_number": "300123456700003"
        },
        "footer_data": {
            "address": "المملكة العربية السعودية",
            "phone": "0500000000"
        }
    }