from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class DataSourceColumn(BaseModel):

    id: str

    name: str

    type: str

    relatedTableId: Optional[str] = None


class RelationNode(BaseModel):
    column_id: str
    column_name: str
    table: "DataSourceTable"


class ReportColumn(BaseModel):
    id: str
    name: str
    type: str
    path: List[Dict[str, Any]] = []


class DataSourceTable(BaseModel):

    id: int

    name: str

    section_id: int

    columns: List[DataSourceColumn]

    relations: List[RelationNode] = []


class DataSourceSection(BaseModel):

    id: int

    title: str

    tables: List[DataSourceTable]


RelationNode.model_rebuild()


class RelationRequest(BaseModel):
    column_id: str
    table_id: int


class ReportRunRequest(BaseModel):
    table_id: int
    columns: List[ReportColumn]
    relations: List[RelationRequest] = []
