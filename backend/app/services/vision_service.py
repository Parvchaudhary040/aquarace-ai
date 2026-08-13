import os
import io
import base64
from pathlib import Path
from typing import Union
from PIL import Image
from fastapi import HTTPException
import httpx

CANDIDATE_LABELS = [
    "a dry racing track",
    "a damp racing track",
    "a wet racing track"
]

LABEL_DISPLAY = {
    "a dry racing track": "Dry",
    "a damp racing track": "Damp",
    "a wet racing track": "Wet"
}


class VisionService:
    _instance = None
    _token = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VisionService, cls).__new__(cls)
        return cls._instance

    def initialize(self):
        """Verify Hugging Face token is available on startup."""
        if self._token is None:
            hf_token = os.getenv("HF_TOKEN")
            if not hf_token:
                raise HTTPException(status_code=500, detail="Configuration Error: HF_TOKEN environment variable is missing. Cannot initialize vision service.")
            
            print("Verified Hugging Face token for direct API access.")
            self._token = hf_token

    def analyze_image(self, image_input: Union[bytes, str, Path]) -> dict:
        """
        Classifies an image (bytes, file path, or PIL Image) against Dry, Damp, and Wet track labels.
        Uses direct HTTP POST to Hugging Face Inference API to bypass client routing issues.
        Returns a dict with condition, confidence, and dry/damp/wet probabilities.
        """
        if self._token is None:
            self.initialize()

        # Handle bytes vs path vs PIL Image
        if isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, (str, Path)):
            image = Image.open(str(image_input)).convert("RGB")
        elif hasattr(image_input, "convert"):
            image = image_input.convert("RGB")
        else:
            raise ValueError(f"Unsupported image input type '{type(image_input)}'. Expected bytes, file path, or PIL Image.")

        # Save to buffer and convert to base64
        buffer = io.BytesIO()
        image.thumbnail((512, 512)) # Shrink to save bandwidth
        image.save(buffer, format="JPEG")
        img_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        payload = {
            "inputs": img_b64,
            "parameters": {
                "candidate_labels": CANDIDATE_LABELS
            }
        }

        url = "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32"
        headers = {"Authorization": f"Bearer {self._token}"}

        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                raw_results = response.json()
                
                # If API is loading model, it might return {"error": "Model is currently loading", "estimated_time": ...}
                if isinstance(raw_results, dict) and "error" in raw_results:
                    print(f"HF API returning error: {raw_results}")
                    raise Exception(raw_results.get("error"))
                    
        except Exception as e:
            print(f"HF Inference API Error: {e}")
            raise HTTPException(status_code=503, detail="Vision inference service is temporarily unavailable.")

        # Parse probabilities for each candidate label
        prob_dict = {res["label"]: res["score"] * 100 for res in raw_results}

        top_prediction = raw_results[0]
        top_label = top_prediction["label"]
        top_condition = LABEL_DISPLAY.get(top_label, top_label)
        top_confidence = round(top_prediction["score"] * 100, 2)

        dry_prob = round(prob_dict.get("a dry racing track", 0.0), 2)
        damp_prob = round(prob_dict.get("a damp racing track", 0.0), 2)
        wet_prob = round(prob_dict.get("a wet racing track", 0.0), 2)

        return {
            "condition": top_condition,
            "confidence": top_confidence,
            "dry_probability": dry_prob,
            "damp_probability": damp_prob,
            "wet_probability": wet_prob,
        }


# Singleton instance
vision_service = VisionService()

