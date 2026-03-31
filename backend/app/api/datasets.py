"""Dataset routes — upload, list, profile, delete."""

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import DatasetProfile, DatasetSummary
from app.services import dataset_service

router = APIRouter()


@router.post("/upload", response_model=DatasetProfile)
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:  # 50 MB
        raise HTTPException(status_code=413, detail="File too large. Max 50 MB.")

    try:
        profile = await dataset_service.save_dataset(file.filename, content)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=list[DatasetSummary])
async def list_datasets():
    return await dataset_service.list_datasets()


@router.get("/{dataset_id}", response_model=DatasetProfile)
async def get_dataset(dataset_id: str):
    profile = await dataset_service.get_dataset_profile(dataset_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return profile


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str):
    ok = await dataset_service.delete_dataset(dataset_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return {"message": "Dataset deleted."}
