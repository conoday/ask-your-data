"""Dataset service — upload, store, profile CSV files."""

import uuid
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import Optional

import pandas as pd
import numpy as np

from app.models.schemas import DatasetProfile, DatasetSummary, ColumnProfile
from app.database import get_db

UPLOAD_DIR = Path(__file__).parent.parent.parent / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _quality_score(df: pd.DataFrame) -> float:
    """Simple data quality score 0-100."""
    null_ratio = df.isnull().mean().mean()
    dup_ratio = df.duplicated().sum() / max(len(df), 1)
    score = 100 * (1 - null_ratio * 0.6 - dup_ratio * 0.4)
    return round(max(0.0, min(100.0, score)), 1)


def _profile_column(series: pd.Series) -> ColumnProfile:
    is_numeric = pd.api.types.is_numeric_dtype(series)
    is_dt = pd.api.types.is_datetime64_any_dtype(series)

    # Try parse datetime from object columns
    if series.dtype == object:
        try:
            parsed = pd.to_datetime(series, errors="coerce")
            if parsed.notna().sum() > len(series) * 0.7:
                series = parsed
                is_dt = True
        except Exception:
            pass

    null_pct = round(series.isnull().mean() * 100, 2)
    unique_count = int(series.nunique())
    sample = series.dropna().head(5).tolist()
    sample = [str(v) if isinstance(v, (pd.Timestamp,)) else v for v in sample]

    return ColumnProfile(
        name=series.name,
        dtype=str(series.dtype),
        null_pct=null_pct,
        unique_count=unique_count,
        sample_values=sample,
        is_numeric=is_numeric,
        is_datetime=is_dt,
        min=(str(series.min()) if series.notna().any() else None) if not is_numeric else (float(series.min()) if series.notna().any() else None),
        max=(str(series.max()) if series.notna().any() else None) if not is_numeric else (float(series.max()) if series.notna().any() else None),
        mean=float(series.mean()) if is_numeric and series.notna().any() else None,
    )


async def save_dataset(filename: str, content: bytes) -> DatasetProfile:
    dataset_id = str(uuid.uuid4())
    dest = UPLOAD_DIR / dataset_id
    dest.mkdir(parents=True, exist_ok=True)
    file_path = dest / filename

    file_path.write_bytes(content)

    # Read and profile
    df = pd.read_csv(file_path)
    profile = DatasetProfile(
        id=dataset_id,
        name=filename.removesuffix(".csv"),
        filename=str(file_path),
        row_count=len(df),
        col_count=len(df.columns),
        columns=[_profile_column(df[col]) for col in df.columns],
        quality_score=_quality_score(df),
        created_at=datetime.utcnow(),
    )

    # Persist to DB
    db = await get_db()
    try:
        profile_json = json.dumps([c.model_dump() for c in profile.columns])
        await db.execute(
            """INSERT INTO datasets (id, name, filename, row_count, col_count, profile, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                dataset_id,
                profile.name,
                str(file_path),
                profile.row_count,
                profile.col_count,
                profile_json,
                profile.created_at.isoformat(),
            ),
        )
        await db.commit()
    finally:
        await db.close()

    return profile


async def list_datasets() -> list[DatasetSummary]:
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT id, name, filename, row_count, col_count, profile, created_at FROM datasets ORDER BY created_at DESC"
        )
        rows = await cursor.fetchall()
        results = []
        for row in rows:
            columns = json.loads(row["profile"] or "[]")
            quality = _compute_quality_from_profile(columns)
            results.append(
                DatasetSummary(
                    id=row["id"],
                    name=row["name"],
                    filename=row["filename"],
                    row_count=row["row_count"],
                    col_count=row["col_count"],
                    quality_score=quality,
                    created_at=datetime.fromisoformat(row["created_at"]),
                )
            )
        return results
    finally:
        await db.close()


def _compute_quality_from_profile(columns: list[dict]) -> float:
    if not columns:
        return 100.0
    avg_null = sum(c.get("null_pct", 0) for c in columns) / len(columns)
    return round(max(0.0, 100.0 - avg_null * 0.6), 1)


async def get_dataset_profile(dataset_id: str) -> Optional[DatasetProfile]:
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT * FROM datasets WHERE id = ?", (dataset_id,)
        )
        row = await cursor.fetchone()
        if not row:
            return None
        columns = [ColumnProfile(**c) for c in json.loads(row["profile"] or "[]")]
        return DatasetProfile(
            id=row["id"],
            name=row["name"],
            filename=row["filename"],
            row_count=row["row_count"],
            col_count=row["col_count"],
            columns=columns,
            quality_score=_compute_quality_from_profile([c.model_dump() for c in columns]),
            created_at=datetime.fromisoformat(row["created_at"]),
        )
    finally:
        await db.close()


def load_dataframe(filename: str) -> pd.DataFrame:
    return pd.read_csv(filename)


async def delete_dataset(dataset_id: str) -> bool:
    db = await get_db()
    try:
        cursor = await db.execute(
            "SELECT filename FROM datasets WHERE id = ?", (dataset_id,)
        )
        row = await cursor.fetchone()
        if not row:
            return False
        # Delete file
        file_path = Path(row["filename"])
        if file_path.parent.exists():
            shutil.rmtree(file_path.parent, ignore_errors=True)
        await db.execute("DELETE FROM datasets WHERE id = ?", (dataset_id,))
        await db.commit()
        return True
    finally:
        await db.close()
