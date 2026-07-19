from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    JSON,
    func,
)

from app.core.database import Base


class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"

    id = Column(Integer, primary_key=True, index=True)

    dashboard_id = Column(
        Integer,
        ForeignKey("dashboards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(
        String(255),
        nullable=False,
    )

    widget_type = Column(
        String(50),
        nullable=False,
    )

    report_id = Column(
        Integer,
        nullable=True,
    )

    config = Column(
        JSON,
        nullable=False,
        default=dict,
    )

    x = Column(
        Integer,
        default=0,
        nullable=False,
    )

    y = Column(
        Integer,
        default=0,
        nullable=False,
    )

    w = Column(
        Integer,
        default=4,
        nullable=False,
    )

    h = Column(
        Integer,
        default=3,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )