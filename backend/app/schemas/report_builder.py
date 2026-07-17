from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class DataSourceColumn(BaseModel):

    id: str

    name: str

    type: str

    relatedTableId: Optional[str] = None


class DataSourceTable(BaseModel):

    id: int

    name: str

    section_id: int

    columns: List[DataSourceColumn]


class DataSourceSection(BaseModel):

    id: int

    title: str

    tables: List[DataSourceTable]


class ReportRunRequest(BaseModel):
    table_id: int
    columns: List[str]