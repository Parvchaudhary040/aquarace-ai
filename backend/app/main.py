"""
main.py — AquaRace AI FastAPI Application

ARCHITECTURE:
  CLIP vision inference runs in the browser (Transformers.js, Xenova/clip-vit-base-patch32).
  This backend no longer calls Hugging Face or holds an HF_TOKEN for vision.

  Kept endpoints:
    GET  /api/health
    GET  /api/history
    GET  /api/trend
    GET  /api/strategy
    POST /api/record-analysis  — persist pre-computed image result from frontend
    POST /api/record-video     — persist pre-computed video result from frontend
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.api import analyze, history, trend, strategy
from app.models.schemas import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    print("AquaRace AI Backend started. Vision inference runs in the browser.")
    yield
    print("Shutting down AquaRace AI Backend...")


app = FastAPI(
    title="AquaRace AI - Weather Whiplash Backend",
    description="Live Track Condition Detector & Strategy Recommendation API",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for all local React development ports (5173, 5174, etc.) and Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under /api
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(trend.router, prefix="/api", tags=["Trend"])
app.include_router(strategy.router, prefix="/api", tags=["Strategy"])


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
