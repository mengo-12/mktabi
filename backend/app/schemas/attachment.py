from pydantic import BaseModel
from datetime import datetime

class AttachmentResponse(BaseModel):
    id: int
    case_id: int
    original_name: str
    file_type: str
    file_size: int
    uploaded_by: int
    uploaded_at: datetime

    class Config:
        from_attributes = True