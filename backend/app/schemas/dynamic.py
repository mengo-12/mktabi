# backend\app\schemas\dynamic.py
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# --- مخططات الأعمدة الداخلية ---
class ColumnDefinition(BaseModel):
    id: str
    name: str
    type: str  # text, date, dropdown, relation, etc.
    options: Optional[List[str]] = None
    relatedTableId: Optional[str] = None

# --- مخططات الجداول والأعمدة ---
class TableCreate(BaseModel):
    section_id: int
    name: str
    view_mode: Optional[str] = "table"
    columns_definition: List[Dict[str, Any]] # مصفوفة الأعمدة الديناميكية
    is_staff_table: Optional[bool] = False 
    calendar_mapping: Optional[Dict[str, str]] = None

class TableResponse(TableCreate):
    id: int
    # 🔒 حقل أمني حرج: يخبر الفرونت إند بصلاحية المستخدم الحالي على هذا الجدول (read_only, read_write, hidden)
    user_permission: Optional[str] = "read_write" 

    class Config:
        from_attributes = True

# --- مخططات الأقسام (Pages/Sections) ---
class SectionCreate(BaseModel):
    title: str
    icon: Optional[str] = "Folder"
    order: Optional[int] = 0

# 🌟 تم الدمج هنا وإزالة التكرار الكارثي لربط العلاقة في الاستجابة بشكل سليم
class SectionResponse(SectionCreate):
    id: int
    tables: List[TableResponse] = []  

    class Config:
        from_attributes = True

# --- مخططات السجلات والبيانات (الصفوف) ---
class RowCreate(BaseModel):
    table_id: int
    cells_data: Dict[str, Any] # البيانات المدخلة عبر النموذج الديناميكي

class RowResponse(RowCreate):
    id: int
    class Config:
        from_attributes = True

# --- مخططات التحديث للهيكل ---
class TableSchemaUpdate(BaseModel):
    name: str
    default_view: str = "table"
    calendar_mapping: Optional[Dict[str, str]] = None
    columns_definition: List[ColumnDefinition]
    is_staff_table: bool = False