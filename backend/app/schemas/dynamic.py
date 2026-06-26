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
    calendar_mapping: Optional[Dict[str, str]] = None

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

class ColumnDefinition(BaseModel):
    id: str
    name: str
    type: str  # text, date, dropdown, relation, etc.
    options: Optional[List[str]] = None
    relatedTableId: Optional[str] = None

# تحديث الموديل الرئيسي للجدول
class TableSchemaUpdate(BaseModel):
    name: str
    default_view: str = "table"  # 👈 إضافة هذا الحقل (table, calendar, grid, list)
    calendar_mapping: Optional[Dict[str, str]] = None  # 👈 إضافة روابط التقويم الديناميكية
    columns_definition: List[ColumnDefinition]