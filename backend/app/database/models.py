from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    filename = Column(String, nullable=False)
    condition = Column(String, nullable=False)  # Dry, Damp, or Wet
    confidence = Column(Float, nullable=False)
    dry_probability = Column(Float, nullable=False)
    damp_probability = Column(Float, nullable=False)
    wet_probability = Column(Float, nullable=False)
