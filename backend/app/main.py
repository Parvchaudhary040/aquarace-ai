from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.services.vision_service import vision_service
from app.api import analyze, history, trend, strategy
from app.models.schemas import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Pre-loading Hugging Face vision model...")
    vision_service.initialize()
    yield
    # Shutdown logic
    print("Shutting down AquaRace AI Backend...")


app = FastAPI(
    title="AquaRace AI - Weather Whiplash Backend",
    description="Live Track Condition Detector & Strategy Recommendation API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for all local React development ports (5173, 5174, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
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
