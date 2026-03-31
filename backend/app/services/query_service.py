"""Saved query service — CRUD for persisted queries."""

import uuid
import json
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models.schemas import SavedQuery, QueryResult


async def save_query(dataset_id: str, question: str, result: QueryResult) -> SavedQuery:
    query_id = str(uuid.uuid4())
    db = await get_db()
    try:
        result_json = result.model_dump_json()
        await db.execute(
            """INSERT INTO queries (id, dataset_id, question, result, is_favorite, created_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                query_id,
                dataset_id,
                question,
                result_json,
                False,
                datetime.utcnow().isoformat(),
            ),
        )
        await db.commit()
        return SavedQuery(
            id=query_id,
            dataset_id=dataset_id,
            question=question,
            result=result,
            is_favorite=False,
            created_at=datetime.utcnow(),
        )
    finally:
        await db.close()


async def list_queries(dataset_id: Optional[str] = None) -> list[SavedQuery]:
    db = await get_db()
    try:
        if dataset_id:
            cursor = await db.execute(
                "SELECT * FROM queries WHERE dataset_id = ? ORDER BY created_at DESC",
                (dataset_id,),
            )
        else:
            cursor = await db.execute(
                "SELECT * FROM queries ORDER BY created_at DESC"
            )
        rows = await cursor.fetchall()
        results = []
        for row in rows:
            result = None
            if row["result"]:
                try:
                    result = QueryResult.model_validate_json(row["result"])
                except Exception:
                    pass
            results.append(
                SavedQuery(
                    id=row["id"],
                    dataset_id=row["dataset_id"],
                    question=row["question"],
                    result=result,
                    is_favorite=bool(row["is_favorite"]),
                    created_at=datetime.fromisoformat(row["created_at"]),
                )
            )
        return results
    finally:
        await db.close()


async def toggle_favorite(query_id: str, is_favorite: bool) -> bool:
    db = await get_db()
    try:
        await db.execute(
            "UPDATE queries SET is_favorite = ? WHERE id = ?",
            (is_favorite, query_id),
        )
        await db.commit()
        return True
    finally:
        await db.close()


async def delete_query(query_id: str) -> bool:
    db = await get_db()
    try:
        await db.execute("DELETE FROM queries WHERE id = ?", (query_id,))
        await db.commit()
        return True
    finally:
        await db.close()
