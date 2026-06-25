from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base  # تأكد أن هذا هو مسار الـ Base الصحيح في مشروعك

class CustomSection(Base):
    """إنشاء الأقسام والصفحات الديناميكية في القائمة الجانبية"""
    __tablename__ = "custom_sections"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)   # اسم الصفحة (مثل: قضايا الشركات)
    icon = Column(String, default="Folder")  # أيقونة الصفحة
    order = Column(Integer, default=0)       # ترتيب ظهورها في الـ Sidebar

    # علاقة مع الجداول التابعة لهذا القسم
    tables = relationship("CustomTable", back_populates="section", cascade="all, delete-orphan")

class CustomTable(Base):
    """بناء هيكل الجداول وتحديد الأعمدة ونمط العرض"""
    __tablename__ = "custom_tables"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("custom_sections.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)      # اسم الجدول الداخلي
    view_mode = Column(String, default="table") # نمط العرض: table, grid, list

    # السحر هنا: مصفوفة الـ JSON لتخزين أسماء وأنواع الأعمدة
    # مثال: [{"id": "c1", "name": "اسم الموكل", "type": "text"}, {"id": "c2", "name": "المبلغ", "type": "number"}]
    columns_definition = Column(JSON, nullable=False, default=list)

    section = relationship("CustomSection", back_populates="tables")
    rows = relationship("CustomRow", back_populates="table", cascade="all, delete-orphan")

class CustomRow(Base):
    """تخزين البيانات والأسطر الفعلية (مثل الإكسل والبطاقات)"""
    __tablename__ = "custom_rows"

    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, ForeignKey("custom_tables.id", ondelete="CASCADE"))

    # تخزين القيم كـ مفتاح وقيمة داخل JSONB بناءً على الأعمدة المصممة
    # مثال: {"c1": "شركة أحمد التجارية", "c2": 75000}
    cells_data = Column(JSON, nullable=False, default=dict)

    table = relationship("CustomTable", back_populates="rows")