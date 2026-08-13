import os
import tempfile
from typing import List, Dict, Any, Tuple
import cv2
from PIL import Image
from fastapi import HTTPException
from app.services.vision_service import vision_service
from app.services.trend_service import analyze_trend
from app.services.strategy_service import evaluate_strategy

ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
ALLOWED_VIDEO_MIME_TYPES = {
    "video/mp4",
    "video/x-msvideo",
    "video/quicktime",
    "video/x-matroska",
    "video/webm",
    "application/octet-stream"  # Browser fallback for some video uploads
}
MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024  # 100 MB
MAX_VIDEO_DURATION_SECONDS = 180.0       # 3 minutes
MAX_SAMPLE_FRAMES = 16                    # Maximum frames to process


class VideoService:
    """
    Service responsible for validating, opening, sampling, and processing video files
    for track condition analysis.
    """

    def process_video(self, video_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Processes a raw video byte stream:
        1. Validates format and size.
        2. Writes to temporary file and opens via OpenCV.
        3. Samples frames at ~1.5s intervals (capped at MAX_SAMPLE_FRAMES).
        4. Passes each frame through vision_service.analyze_image.
        5. Computes temporal trend and strategy recommendations.
        """
        if not video_bytes:
            raise HTTPException(status_code=400, detail="Uploaded video file is empty.")

        if len(video_bytes) > MAX_VIDEO_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"Video file exceeds maximum allowed size of {MAX_VIDEO_SIZE_BYTES // (1024 * 1024)}MB."
            )

        ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in ALLOWED_VIDEO_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported video extension '{ext}'. Supported formats: {', '.join(sorted(ALLOWED_VIDEO_EXTENSIONS))}."
            )

        # Write to temporary file for OpenCV reading
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            temp_file.write(video_bytes)
            temp_file_path = temp_file.name

        try:
            cap = cv2.VideoCapture(temp_file_path)
            if not cap.isOpened():
                raise HTTPException(status_code=400, detail="Could not open or decode video file.")

            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

            if fps <= 0 or total_frames <= 0:
                cap.release()
                raise HTTPException(status_code=400, detail="Invalid video file: duration/frames could not be determined.")

            duration = total_frames / fps
            if duration > MAX_VIDEO_DURATION_SECONDS:
                cap.release()
                raise HTTPException(
                    status_code=400,
                    detail=f"Video duration ({duration:.1f}s) exceeds maximum allowed duration ({MAX_VIDEO_DURATION_SECONDS:.0f}s)."
                )

            # Determine frame sampling indices (1 frame every 1.5 - 2s, or evenly spread up to MAX_SAMPLE_FRAMES)
            sample_indices_with_time = self._calculate_sample_indices(total_frames, fps, MAX_SAMPLE_FRAMES)

            frame_results = []
            condition_sequence = []

            for frame_idx, timestamp in sample_indices_with_time:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame_bgr = cap.read()
                if not ret or frame_bgr is None:
                    continue

                # Convert BGR (OpenCV) -> RGB (PIL)
                frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                pil_image = Image.fromarray(frame_rgb)

                # Send sampled frame through existing vision_service
                analysis = vision_service.analyze_image(pil_image)

                frame_results.append({
                    "timestamp": round(timestamp, 2),
                    "condition": analysis["condition"],
                    "confidence": analysis["confidence"],
                    "dry_probability": analysis["dry_probability"],
                    "damp_probability": analysis["damp_probability"],
                    "wet_probability": analysis["wet_probability"],
                })
                condition_sequence.append(analysis["condition"])

            cap.release()

            if not frame_results:
                raise HTTPException(status_code=400, detail="Failed to extract readable frames from video.")

            # Run existing temporal trend logic over condition sequence
            trend_result = analyze_trend(condition_sequence)

            # Run existing strategy engine using latest condition & trend
            latest_condition = trend_result.get("condition") or condition_sequence[-1]
            latest_trend = trend_result.get("trend", "stable")
            strategy_result = evaluate_strategy(latest_condition, latest_trend, condition_sequence)

            return {
                "filename": filename,
                "frames_analyzed": len(frame_results),
                "frames": frame_results,
                "condition_sequence": condition_sequence,
                "trend": trend_result,
                "strategy": strategy_result,
            }

        finally:
            if os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except Exception:
                    pass

    def _calculate_sample_indices(self, total_frames: int, fps: float, max_samples: int) -> List[Tuple[int, float]]:
        """
        Calculates frame index numbers and corresponding timestamps to sample.
        Samples approximately 1 frame every 1.5 seconds, bounded by max_samples.
        """
        duration = total_frames / fps
        target_interval_sec = 1.5

        # Number of frames based on 1.5s interval
        desired_count = max(2, min(max_samples, int(duration / target_interval_sec)))
        if desired_count >= total_frames:
            step = 1
        else:
            step = (total_frames - 1) / (desired_count - 1)

        samples = []
        for i in range(desired_count):
            idx = int(round(i * step))
            idx = min(idx, total_frames - 1)
            ts = idx / fps
            samples.append((idx, ts))

        return samples


video_service = VideoService()
