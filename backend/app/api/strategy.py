from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Analysis
from app.models.schemas import StrategyResponse
from app.services.trend_service import analyze_trend
from app.services.strategy_service import evaluate_strategy

router = APIRouter()


@router.get("/strategy", response_model=StrategyResponse)
def get_strategy(db: Session = Depends(get_db)):
    """
    Returns prototype tire strategy recommendation based on latest track condition and trend.
    """
    recent_records = (
        db.query(Analysis)
        .order_by(Analysis.timestamp.desc())
        .limit(10)
        .all()
    )

    if not recent_records:
        latest_condition = "dry"
        trend_status = "stable"
        history_seq = []
    else:
        history_seq = [record.condition for record in reversed(recent_records)]
        trend_analysis = analyze_trend(history_seq)
        latest_condition = trend_analysis.get("condition", recent_records[0].condition)
        trend_status = trend_analysis["trend"]

    strategy_result = evaluate_strategy(latest_condition, trend_status, history_seq)
    return strategy_result
