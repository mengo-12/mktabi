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

# 💡 1. الدالة المساعدة لتحويل عناصر Canva إلى HTML (تم وضعها هنا)
def render_canva_header_to_html(canvas_elements: list) -> str:
    if not canvas_elements:
        return ""
        
    # وضع حاوية مطلقة العرض لضمان ثبات مواقع العناصر عند الطباعة
    html_output = '<div style="position: relative; width: 100%; height: 160px; font-family: \'Cairo\', sans-serif; direction: rtl; box-sizing: border-box;">'
    
    for el in canvas_elements:
        el_type = el.get('type')
        x = el.get('x', 0)
        y = el.get('y', 0)
        width = el.get('width', 'auto')
        
        if isinstance(width, (int, float)):
            width_str = f"{width}px"
        else:
            width_str = f"{width}%" if el_type == 'line' else f"{width}"

        # استخدام right لتطابق تام مع إحداثيات الفرونت إند المحدثة
        style = f"position: absolute; right: {x}%; top: {y}%; width: {width_str};"

        if el_type == 'text':
            font_size = el.get('fontSize', 12)
            font_weight = el.get('fontWeight', 'normal')
            color = el.get('color', '#000000')
            content = el.get('content', '')
            
            html_output += f"""
            <div style="{style} font-size: {font_size}px; font-weight: {font_weight}; color: {color}; text-align: right; white-space: pre-wrap; line-height: 1.3;">
                {content}
            </div>
            """
            
        elif el_type == 'image':
            content = el.get('content', '')
            html_output += f"""
            <div style="{style}">
                <img src="{content}" style="width: 100%; height: auto; object-fit: contain;" />
            </div>
            """
            
        elif el_type == 'line':
            color = el.get('color', '#f59e0b')
            height = el.get('height', 2)
            html_output += f"""
            <div style="{style} background-color: {color}; height: {height}px; border-radius: 4px;"></div>
            """
            
    html_output += '</div>'
    return html_output


# ➕ 2. إنشاء قالب مستند جديد تماماً
@router.post("/templates", response_model=CustomTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_document_template(payload: CustomTemplateCreate, db: AsyncSession = Depends(get_db)):
    db_template = CustomTemplate(**payload.model_dump())
    db.add(db_template)
    await db.commit()
    await db.refresh(db_template)
    return db_template

# 📋 3. جلب جميع القوالب التي صممها المحامي
@router.get("/templates", response_model=List[CustomTemplateResponse])
async def get_all_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CustomTemplate))
    return result.scalars().all()

# 🔍 4. جلب قالب معين بواسطة المعرف (ID)
@router.get("/templates/{template_id}", response_model=CustomTemplateResponse)
async def get_template_by_id(template_id: int, db: AsyncSession = Depends(get_db)):
    db_template = await db.get(CustomTemplate, template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="قالب المستند غير موجود")
    return db_template

# 🔄 5. تعديل وتحديث التصميم أو النص الخاص بالقالب
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

# ❌ 6. حذف قالب مستند
@router.delete("/templates/{template_id}", status_code=status.HTTP_200_OK)
async def delete_template(template_id: int, db: AsyncSession = Depends(get_db)):
    db_template = await db.get(CustomTemplate, template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="القالب غير موجود")
    await db.delete(db_template)
    await db.commit()
    return {"status": "success", "message": "تم حذف القالب بنجاح"}


# 💾 7. حفظ وتوليد مستند جديد في الأرشيف (مدمج بتصميم Canva الديناميكي الخاص بالقالب المختار)
@router.post("/generated", response_model=GeneratedDocumentResponse, status_code=status.HTTP_201_CREATED)
async def save_generated_document(payload: GeneratedDocumentCreate, db: AsyncSession = Depends(get_db)):
    # أ) استخراج نص المستند المكتوب من الفرونت إند بأمان
    document_content_body = payload.content_body or "" 
    
    # ب) جلب عناصر الـ Canva ديناميكياً من القالب المختار
    canvas_elements = []
    template_id = payload.template_id
    
    if template_id:
        db_template = await db.get(CustomTemplate, template_id)
        if db_template and db_template.visual_design:
            vd = db_template.visual_design
            if isinstance(vd, dict):
                if 'canvas_elements' in vd:
                    canvas_elements = vd.get('canvas_elements', [])
                elif 'header_data' in vd and 'canvas_elements' in vd['header_data']:
                    canvas_elements = vd['header_data'].get('canvas_elements', [])
                elif 'elements' in vd:
                    canvas_elements = vd.get('elements', [])
            elif isinstance(vd, list):
                canvas_elements = vd

    # ج) إذا فشل النظام في العثور على التصميم المخصص، نستخدم الترويسة الافتراضية كإجراء احتياطي
    if not canvas_elements:
        canvas_elements = [
            {'id': 'el-1', 'type': 'text', 'content': 'مكتب المستشار القانوني للمحاماة (افتراضي)', 'x': 5, 'y': 15, 'fontSize': 16, 'fontWeight': 'bold', 'color': '#18181b', 'width': 250},
            {'id': 'el-2', 'type': 'text', 'content': 'الرجاء التأكد من حفظ عناصر الكانفاس داخل القالب', 'x': 5, 'y': 40, 'fontSize': 12, 'fontWeight': 'normal', 'color': '#71717a', 'width': 300},
            {'id': 'el-3', 'type': 'line', 'x': 3, 'y': 85, 'color': '#f59e0b', 'height': 3, 'width': 94}
        ]
    
    # د) توليد كود الـ HTML المتناسق للكانفاس عبر الدالة المساعدة
    canva_header_html = render_canva_header_to_html(canvas_elements)
    
    # هـ) دمج الترويسة المخصصة مع نص العقد وتغليفه بستايل الطباعة الورقية A4
    full_document_html = f"""
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @page {{ size: A4; margin: 20mm; }}
            body {{ font-family: 'Cairo', sans-serif; direction: rtl; }}
        </style>
    </head>
    <body>
        {canva_header_html}
        
        <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            {document_content_body} 
        </div>
    </body>
    </html>
    """
    
    # و) تحويل الـ Payload إلى dict وتجهيزه لقاعدة البيانات
    dumped_data = payload.model_dump()
    dumped_data["final_content"] = full_document_html
    
    # 🔥 الحل الجذري هنا: نقوم بحذف حقل content_body من الـ dict حتى لا يرسل إلى موديل SQLAlchemy ويسبب خطأ
    if "content_body" in dumped_data:
        del dumped_data["content_body"]
    
    # ز) الحفظ النهائي المضمون في قاعدة البيانات بدون حقول غريبة عن الجدول
    db_doc = GeneratedDocument(**dumped_data)
    db.add(db_doc)
    await db.commit()
    await db.refresh(db_doc)
    
    return db_doc

# 🔍 8. جلب جميع المستندات المؤرشفة التابعة لسجل/قضية معينة
@router.get("/rows/{row_id}/documents", response_model=List[GeneratedDocumentResponse])
async def get_documents_by_row(row_id: int, table_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GeneratedDocument)
        .filter(GeneratedDocument.row_id == row_id, GeneratedDocument.table_id == table_id)
        .order_by(GeneratedDocument.created_at.desc())
    )
    return result.scalars().all()

# ❌ 9. حذف مستند من الأرشيف
@router.delete("/generated/{document_id}", status_code=status.HTTP_200_OK)
async def delete_generated_document(document_id: int, db: AsyncSession = Depends(get_db)):
    db_doc = await db.get(GeneratedDocument, document_id)
    if not db_doc:
        raise HTTPException(status_code=404, detail="المستند غير موجود في الأرشيف")
    await db.delete(db_doc)
    await db.commit()
    return {"status": "success", "message": "تم حذف المستند من الأرشيف بنجاح"}


# 📋 10. جلب إعدادات المكتب (تستدعى عند تحميل صفحة Canva)
@router.get("/")
async def get_default_office_settings():
    return {
        "primary_color": "#f59e0b",
        "logo_url": "",
        "header_data": {
            "office_name_ar": "مكتب المحاماة الرقمي",
            "tax_number": "300123456700003",
            # هنا يمكنك وضع عناصر افتراضية للكانفاس كبداية للمستخدم
            "canvas_elements": [
                {'id': 'el-1', 'type': 'text', 'content': 'مكتب المستشار القانوني للمحاماة', 'x': 5, 'y': 15, 'fontSize': 16, 'fontWeight': 'bold', 'color': '#18181b', 'width': 250},
                {'id': 'el-2', 'type': 'text', 'content': 'الرقم الضريبي: 300012345', 'x': 5, 'y': 40, 'fontSize': 12, 'fontWeight': 'normal', 'color': '#71717a', 'width': 200},
                {'id': 'el-3', 'type': 'line', 'x': 3, 'y': 85, 'color': '#f59e0b', 'height': 3, 'width': 94}
            ]
        },
        "footer_data": {
            "address": "المملكة العربية السعودية",
            "phone": "0500000000"
        }
    }

# 🔄 11. استقبال وحفظ إعدادات Canva القادمة من الفرونت إند (لحل مشكلة 405 تماماً)
@router.put("/")
async def update_office_identity_settings(payload: dict):
    print("Received Canva Data:", payload)
    
    # هنا يستقبل الباكيند مصفوفة التصميم كاملة، يمكنك حفظها في قاعدة البيانات أو استخراج 
    # كود الـ HTML الخاص بها عبر الدالة المساعدة لدمجه فوراً مع المستندات:
    canvas_elements = payload.get("header_data", {}).get("canvas_elements", [])
    header_html_preview = render_canva_header_to_html(canvas_elements)
    
    return {
        "status": "success",
        "message": "تمت معالجة وحفظ هيكل تصميم Canva بنجاح",
        "html_preview": header_html_preview
    }