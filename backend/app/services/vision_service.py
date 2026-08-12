import io
from pathlib import Path
from typing import Union
from PIL import Image
from transformers import pipeline

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
    _classifier = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VisionService, cls).__new__(cls)
        return cls._instance

    def initialize(self):
        """Pre-load Hugging Face CLIP model on startup."""
        if self._classifier is None:
            print("Loading Hugging Face model 'openai/clip-vit-base-patch32'...")
            self._classifier = pipeline(
                "zero-shot-image-classification",
                model="openai/clip-vit-base-patch32"
            )
            print("Hugging Face CLIP vision model loaded successfully.")

    def analyze_image(self, image_input: Union[bytes, str, Path]) -> dict:
        """
        Classifies an image (bytes, file path, or PIL Image) against Dry, Damp, and Wet track labels.
        Returns a dict with condition, confidence, and dry/damp/wet probabilities.
        """
        if self._classifier is None:
            self.initialize()

        # Handle bytes vs path vs PIL Image
        if isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, (str, Path)):
            image = Image.open(str(image_input)).convert("RGB")
        elif isinstance(image_input, Image.Image):
            image = image.convert("RGB")
        else:
            raise ValueError("Unsupported image input type. Expected bytes, file path, or PIL Image.")

        raw_results = self._classifier(image, candidate_labels=CANDIDATE_LABELS)

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
