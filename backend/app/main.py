"""Ask Your Data — FastAPI Backend"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import init_db
from app.api import datasets, queries, query as query_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="Ask Your Data API",
    description="AI-powered analytics backend",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router, prefix="/api/datasets", tags=["datasets"])
app.include_router(query_router.router, prefix="/api/query", tags=["query"])
app.include_router(queries.router, prefix="/api/queries", tags=["saved-queries"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
