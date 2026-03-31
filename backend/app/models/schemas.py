"""Pydantic schemas"""

from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime


# ── Dataset ──────────────────────────────────────────────
class ColumnProfile(BaseModel):
    name: str
    dtype: str
    null_pct: float
    unique_count: int
    sample_values: list[Any]
    is_numeric: bool
    is_datetime: bool
    min: Optional[Any] = None
    max: Optional[Any] = None
    mean: Optional[float] = None


class DatasetProfile(BaseModel):
    id: str
    name: str
    filename: str
    row_count: int
    col_count: int
    columns: list[ColumnProfile]
    quality_score: float   # 0-100
    created_at: datetime


class DatasetSummary(BaseModel):
    id: str
    name: str
    filename: str
    row_count: int
    col_count: int
    quality_score: float
    created_at: datetime


# ── Query / NLQ ──────────────────────────────────────────
class QueryRequest(BaseModel):
    dataset_id: str
    question: str
    session_id: Optional[str] = None


class ChartSpec(BaseModel):
    type: str           # bar | line | pie | scatter | area | heatmap
    x: Optional[str] = None
    y: Optional[str] = None
    x_label: Optional[str] = None
    y_label: Optional[str] = None
    title: str
    data: list[dict[str, Any]]
    color_key: Optional[str] = None


class TableData(BaseModel):
    columns: list[str]
    rows: list[list[Any]]
    total_rows: int


class QueryResult(BaseModel):
    id: str
    question: str
    answer_text: str
    chart_spec: Optional[ChartSpec] = None
    table_data: Optional[TableData] = None
    insight_text: str
    confidence_score: float   # 0-1
    operation: Optional[str] = None   # SQL-like description
    created_at: datetime


# ── Saved Queries ─────────────────────────────────────────
class SavedQuery(BaseModel):
    id: str
    dataset_id: str
    question: str
    result: Optional[QueryResult] = None
    is_favorite: bool
    created_at: datetime


class ToggleFavoriteRequest(BaseModel):
    is_favorite: bool
