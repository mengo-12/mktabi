from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class CustomTemplate(Base):
    """نظام قوالب المستندات والعقود والفواتير الحرّة التي يصممها المحامي بنفسه"""
    __tablename__ = "custom_templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)        # اسم القالب (مثال: عقد مصادقة، فاتورة ضريبية)
    template_type = Column(String, nullable=False) # نوع المستند (invoice, contract, letter, custom)
    
    # 🎨 التصميم البصري للقالب (الألوان، موقع الشعار، حجم الخط، الهوامش)
    visual_design = Column(JSON, nullable=False, default=dict)
    
    # 📝 المحتوى النصي الحر (يدعم نظام الـ Rich Text المكتوب من الفروينت إند)
    # هنا يكتب المحامي ما يريد ويضع متغيرات مثل: {{اسم_العميل}} أو {{المبلغ_المستحق}}
    content_body = Column(Text, nullable=False)
    
    # قائمة بالرموز/المتغيرات الديناميكية التي استخدمها المحامي في هذا المستند
    variables_meta = Column(JSON, nullable=True, default=list) # مثال: ["اسم_العميل", "رقم_الهوية"]

class GeneratedDocument(Base):
    """أرشيف المستندات والعقود والفواتير الفعليّة التي تم توليدها وحفظها للموكلين أو القضايا"""
    __tablename__ = "generated_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)          # اسم المستند النهائي (مثال: فاتورة العميل أحمد - رقم 102)
    template_id = Column(Integer, ForeignKey("custom_templates.id", ondelete="SET NULL"), nullable=True)
    
    # 🔗 الربط الديناميكي مع المحرك: يربط المستند بجدول معين وصف معين داخل النظام
    table_id = Column(Integer, nullable=False)      # معرف الجدول الديناميكي (مثل جدول القضايا)
    row_id = Column(Integer, nullable=False)        # معرف السجل/الصف الفعلي (ملف القضية أو العميل)
    
    # 📝 النص النهائي الكامل بعد المعالجة واستبدال الـ Variables (HTML / Rich Text)
    final_content = Column(Text, nullable=False)
    
    # 📅 بيانات الأرشفة
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, nullable=True)      # اسم المحامي أو الموظف الذي قام بتوليد المستند

    # علاقة اختيارية مع القالب الأساسي
    template = relationship("CustomTemplate")