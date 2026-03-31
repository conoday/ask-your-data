"""Saved queries routes — list, favorite, delete."""

from fastapi import APIRouter, HTTPException
from typing import Optional

from app.models.schemas import SavedQuery, ToggleFavoriteRequest
from app.services import query_service

router = APIRouter()


@router.get("/", response_model=list[SavedQuery])
async def list_queries(dataset_id: Optional[str] = None):
    return await query_service.list_queries(dataset_id)


@router.patch("/{query_id}/favorite")
async def toggle_favorite(query_id: str, body: ToggleFavoriteRequest):
    ok = await query_service.toggle_favorite(query_id, body.is_favorite)
    if not ok:
        raise HTTPException(status_code=404, detail="Query not found.")
    return {"message": "Updated."}


@router.delete("/{query_id}")
async def delete_query(query_id: str):
    await query_service.delete_query(query_id)
    return {"message": "Deleted."}
