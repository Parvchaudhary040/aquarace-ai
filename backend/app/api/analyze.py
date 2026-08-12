from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Analysis
from app.models.schemas import AnalysisResponse
from app.services.vision_service import vision_service

router = APIRouter()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Classify track condition from uploaded image and record the analysis to SQLite database.
    """
    filename = file.filename or "unknown.jpg"
    file_ext = "." + filename.split(".")[-1].lower() if "." in filename else ""

    # Validate image file
    if file.content_type not in ALLOWED_MIME_TYPES and file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Must be a supported image file (.jpg, .jpeg, .png, .webp, .bmp)."
        )

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

        # Perform zero-shot model inference
        result = vision_service.analyze_image(image_bytes)

        # Save to database
        db_analysis = Analysis(
            filename=filename,
            condition=result["condition"],
            confidence=result["confidence"],
            dry_probability=result["dry_probability"],
            damp_probability=result["damp_probability"],
            wet_probability=result["wet_probability"]
        )
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)

        return db_analysis

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Image analysis error: {str(e)}")
