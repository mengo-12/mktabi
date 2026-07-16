from datetime import datetime
from pydantic import BaseModel
from typing import Optional, Dict, Any


class CalendarEvent(BaseModel):
    id: str

    table_id: int
    row_id: int
    section_id: int

    table_name: str
    section_name: str

    title: str

    start: datetime
    end: Optional[datetime] = None

    description: Optional[str] = None

    color: str = "#3b82f6"

    all_day: bool = True

    editable: bool = True

    icon: Optional[str] = "calendar"

class CalendarEventUpdate(BaseModel):
    start: datetime
    end: Optional[datetime] = None
    all_day: bool = True

class CalendarEventCreate(BaseModel):
    table_id: int
    cells_data: Dict[str, Any]