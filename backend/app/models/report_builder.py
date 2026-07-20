from sqlalchemy import (
    Column,
    Integer,
    String,
    JSON,
    ForeignKey
)

from sqlalchemy import DateTime, func

from sqlalchemy.orm import relationship

from app.core.database import Base


class ReportBuilder(Base):
    __tablename__ = "report_builders"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    description = Column(String)

    section_id = Column(
        Integer,
        ForeignKey("custom_sections.id", ondelete="SET NULL"),
        nullable=True
    )

    base_table_id = Column(
        Integer,
        ForeignKey("custom_tables.id", ondelete="CASCADE")
    )

    config = Column(
        JSON,
        default=dict
    )

    created_at = Column(
    DateTime(timezone=True),
    server_default=func.now(),
    nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    section = relationship("CustomSection")

    base_table = relationship("CustomTable")