"""
analyze.py — Analysis API routes

ARCHITECTURE CHANGE:
  CLIP vision inference has moved to the browser frontend (Transformers.js).
  The backend no longer calls Hugging Face or runs any vision model.

  New endpoints accept pre-computed JSON results from the frontend and
  persist them to the database so that /api/history, /api/trend, and
  /api/strategy continue to work correctly.

  POST /api/record-analysis  — persist a single image analysis result
  POST /api/record-video     — persist video frame results + compute trend/strategy

  The old POST /api/analyze and POST /api/analyze-video endpoints now
  forward to the same logic using JSON bodies for backward compatibility.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Analysis
from app.models.schemas import AnalysisResponse, VideoAnalysisResponse
from app.services.trend_service import analyze_trend
from app.services.strategy_service import evaluate_strategy

router = APIRouter()


# ─── Request schemas for pre-computed frontend results ────────────────────────

class AnalysisInput(BaseModel):
    """Pre-computed image analysis result sent from the frontend CLIP pipeline."""
    filename: str = "image"
    condition: str
    confidence: float
    dry_probability: float = Field(default=0.0)
    damp_probability: float = Field(default=0.0)
    wet_probability: float = Field(default=0.0)


class FrameInput(BaseModel):
    """Single sampled video frame analysis result."""
    timestamp: float
    condition: str
    confidence: float
    dry_probability: float = Field(default=0.0)
    damp_probability: float = Field(default=0.0)
    wet_probability: float = Field(default=0.0)


class VideoAnalysisInput(BaseModel):
    """Pre-computed video analysis result sent from the frontend CLIP pipeline."""
    filename: str = "video"
    frames_analyzed: int = 0
    frames: List[FrameInput] = []
    condition_sequence: List[str] = []


# ─── Image analysis endpoint ──────────────────────────────────────────────────

@router.post("/record-analysis", response_model=AnalysisResponse)
async def record_analysis(
    data: AnalysisInput,
    db: Session = Depends(get_db)
):
    """
    Persist a pre-computed image analysis result (from the frontend CLIP pipeline)
    to the database. Returns a full AnalysisResponse with id and timestamp.
    """
    try:
        db_analysis = Analysis(
            filename=data.filename,
            condition=data.condition,
            confidence=data.confidence,
            dry_probability=data.dry_probability,
            damp_probability=data.damp_probability,
            wet_probability=data.wet_probability,
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        return db_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record analysis: {str(e)}")


# ─── Video analysis endpoint ──────────────────────────────────────────────────

@router.post("/record-video", response_model=VideoAnalysisResponse)
async def record_video(
    data: VideoAnalysisInput,
    db: Session = Depends(get_db)
):
    """
    Accepts pre-computed video frame results from the frontend CLIP pipeline.
    Persists each frame to the database and computes trend + strategy server-side
    so the existing /api/trend and /api/strategy endpoints stay accurate.
    """
    try:
        if not data.frames:
            raise HTTPException(status_code=400, detail="No frames provided in video analysis.")

        # Persist each frame to DB history
        for frame in data.frames:
            db_analysis = Analysis(
                filename=f"{data.filename} @ {frame.timestamp}s",
                condition=frame.condition,
                confidence=frame.confidence,
                dry_probability=frame.dry_probability,
                damp_probability=frame.damp_probability,
                wet_probability=frame.wet_probability,
            )
            db.add(db_analysis)
        db.commit()

        # Build condition sequence (use provided sequence or derive from frames)
        condition_sequence = data.condition_sequence or [f.condition for f in data.frames]

        # Run trend and strategy engines (unchanged backend logic)
        trend_result = analyze_trend(condition_sequence)
        latest_condition = trend_result.get("condition") or condition_sequence[-1]
        latest_trend = trend_result.get("trend", "stable")
        strategy_result = evaluate_strategy(latest_condition, latest_trend, condition_sequence)

        return {
            "filename": data.filename,
            "frames_analyzed": len(data.frames),
            "frames": [f.model_dump() for f in data.frames],
            "condition_sequence": condition_sequence,
            "trend": trend_result,
            "strategy": strategy_result,
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Video analysis error: {str(e)}")
