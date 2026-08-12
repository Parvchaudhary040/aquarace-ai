from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Analysis
from app.models.schemas import TrendResponse
from app.services.trend_service import analyze_trend

router = APIRouter()


@router.get("/trend", response_model=TrendResponse)
def get_trend(
    sample_size: int = 10,
    db: Session = Depends(get_db)
):
    """
    Analyzes recent track condition sequence and returns overall trend and explanatory message.
    """
    recent_records = (
        db.query(Analysis)
        .order_by(Analysis.timestamp.desc())
        .limit(sample_size)
        .all()
    )

    # Order from oldest to newest for trend analysis
    chronological_records = list(reversed(recent_records))
    sequence = [record.condition for record in chronological_records]

    trend_result = analyze_trend(sequence)
    return trend_result
