from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict


class AnalysisResponse(BaseModel):
    id: int
    timestamp: datetime
    filename: str
    condition: str
    confidence: float
    dry_probability: float
    damp_probability: float
    wet_probability: float

    model_config = ConfigDict(from_attributes=True)


class TrendResponse(BaseModel):
    sequence: List[str]
    trend: str      # "improving", "deteriorating", or "stable"
    condition: str  # "wet", "damp", "drying", or "dry"
    message: str


class StrategyResponse(BaseModel):
    current_condition: str
    trend: str
    current_tire: str
    recommendation: str
    urgency: str    # "low", "medium", or "high"
    reason: str


class HealthResponse(BaseModel):
    status: str


class FrameAnalysisItem(BaseModel):
    timestamp: float
    condition: str
    confidence: float
    dry_probability: float = 0.0
    damp_probability: float = 0.0
    wet_probability: float = 0.0


class VideoAnalysisResponse(BaseModel):
    filename: str
    frames_analyzed: int
    frames: List[FrameAnalysisItem]
    condition_sequence: List[str]
    trend: TrendResponse
    strategy: StrategyResponse
