from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# --- مخططات الأقسام (Pages/Sections) ---
class SectionCreate(BaseModel):
    title: str
    icon: Optional[str] = "Folder"
    order: Optional[int] = 0

class SectionResponse(SectionCreate):
    id: int
    class Config:
        from_attributes = True

# --- مخططات الجداول والأعمدة ---
class TableCreate(BaseModel):
    section_id: int
    name: str
    view_mode: Optional[str] = "table"
    columns_definition: List[Dict[str, Any]] # مصفوفة الأعمدة الديناميكية

class TableResponse(TableCreate):
    id: int
    class Config:
        from_attributes = True

# --- مخططات السجلات والبيانات (مثل الإكسل) ---
class RowCreate(BaseModel):
    table_id: int
    cells_data: Dict[str, Any] # البيانات المدخلة عبر النموذج الديناميكي

class RowResponse(RowCreate):
    id: int
    class Config:
        from_attributes = True