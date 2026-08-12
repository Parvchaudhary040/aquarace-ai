import sys
from pathlib import Path

# Add backend directory to sys.path if running as standalone script
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.vision_service import vision_service

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def find_image_files(target_path: Path) -> list[Path]:
    """Resolve target path to a single image file or list of image files in a directory."""
    if not target_path.exists():
        print(f"Error: Path '{target_path}' does not exist.")
        sys.exit(1)

    if target_path.is_file():
        if target_path.suffix.lower() in VALID_EXTENSIONS:
            return [target_path]
        else:
            print(f"Error: File '{target_path.name}' is not a supported image format {sorted(VALID_EXTENSIONS)}.")
            sys.exit(1)

    if target_path.is_dir():
        image_files = sorted([
            f for f in target_path.iterdir()
            if f.is_file() and f.suffix.lower() in VALID_EXTENSIONS
        ])
        if not image_files:
            print(f"Error: No supported image files ({', '.join(sorted(VALID_EXTENSIONS))}) found in directory '{target_path}'.")
            sys.exit(1)
        return image_files

    print(f"Error: Path '{target_path}' is neither a valid file nor directory.")
    sys.exit(1)


def print_summary_table(summary_data: list[dict]):
    """Print a clean summary table of all predictions."""
    print("\n" + "=" * 65)
    print("                    PREDICTION SUMMARY TABLE                     ")
    print("=" * 65)
    
    col_file = "Filename"
    col_pred = "Predicted Condition"
    col_conf = "Confidence"

    divider = "+" + "-" * 27 + "+" + "-" * 24 + "+" + "-" * 12 + "+"
    header = f"| {col_file:<25} | {col_pred:<22} | {col_conf:<10} |"

    print(divider)
    print(header)
    print(divider)

    for item in summary_data:
        fname = item["filename"]
        if len(fname) > 25:
            fname = fname[:22] + "..."
        pred = item["predicted_condition"]
        conf_str = f"{item['confidence']:.2f}%"
        print(f"| {fname:<25} | {pred:<22} | {conf_str:>10} |")

    print(divider)
    print(f"Total Images Processed: {len(summary_data)}\n")


def main():
    default_dir = backend_dir.parent / "data" / "sample_images"

    if len(sys.argv) > 1:
        target_input = Path(sys.argv[1])
    else:
        target_input = default_dir

    image_files = find_image_files(target_input)

    print("=================================================================")
    print("  AquaRace AI - PS2 Track Condition Zero-Shot Classifier Test    ")
    print("=================================================================")
    
    # Initialize vision service (reuses singleton model instance)
    vision_service.initialize()
    print(f"Processing {len(image_files)} image(s) from: '{target_input}'\n")

    summary_data = []

    for idx, img_path in enumerate(image_files, 1):
        filename = img_path.name
        
        # Analyze image via shared vision_service
        result = vision_service.analyze_image(img_path)

        condition = result["condition"]
        confidence = result["confidence"]
        dry_prob = result["dry_probability"]
        damp_prob = result["damp_probability"]
        wet_prob = result["wet_probability"]

        # Print per-image details
        print(f"[{idx}/{len(image_files)}] File: {filename}")
        print(f"  Predicted Condition : {condition}")
        print(f"  Confidence          : {confidence:.2f}%")
        print(f"  All Probabilities   :")
        print(f"    - Dry  ('a dry racing track')  : {dry_prob:.2f}%")
        print(f"    - Damp ('a damp racing track') : {damp_prob:.2f}%")
        print(f"    - Wet  ('a wet racing track')  : {wet_prob:.2f}%")
        print("-" * 65)

        summary_data.append({
            "filename": filename,
            "predicted_condition": condition,
            "confidence": confidence
        })

    # Print summary table at the end
    print_summary_table(summary_data)


if __name__ == "__main__":
    main()
