from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Analysis
from app.models.schemas import AnalysisResponse

router = APIRouter()


@router.get("/history", response_model=List[AnalysisResponse])
def get_history(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Retrieve previous track condition analyses, ordered newest first.
    """
    history = (
        db.query(Analysis)
        .order_by(Analysis.timestamp.desc())
        .limit(limit)
        .all()
    )
    return history
