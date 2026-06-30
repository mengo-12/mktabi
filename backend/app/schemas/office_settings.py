from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any, List, Optional

class CustomTemplateBase(BaseModel):
    title: str
    template_type: str
    visual_design: Dict[str, Any] = {}
    content_body: str
    variables_meta: Optional[List[str]] = []

class CustomTemplateCreate(CustomTemplateBase):
    pass

class CustomTemplateUpdate(CustomTemplateBase):
    pass

class CustomTemplateResponse(CustomTemplateBase):
    id: int
    class Config:
        from_attributes = True

class GeneratedDocumentCreate(BaseModel):
    title: str
    template_id: int | None = None
    table_id: int
    row_id: int
    content_body: Optional[str] = ""  # 🎯 أضفنا هذا الحقل لحل مشكلة الـ AttributeError
    final_content: str
    created_by: Optional[str] = None

class GeneratedDocumentResponse(GeneratedDocumentCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True