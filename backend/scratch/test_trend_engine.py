import sys
from pathlib import Path

# Add backend root to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.trend_service import analyze_trend

def run_test(name, sequence):
    result = analyze_trend(sequence)
    print(f"--- Test Case: {name} ---")
    print(f"Input Sequence : {sequence}")
    print(f"Result Trend   : '{result['trend']}'")
    print(f"Result Cond    : '{result['condition']}'")
    print(f"Result Message : '{result['message']}'")
    print()

def main():
    run_test("Example 1 (Wet -> Wet -> Damp)", ["wet", "wet", "damp"])
    run_test("Example 2 (Dry -> Dry -> Damp -> Wet)", ["dry", "dry", "damp", "wet"])
    run_test("Example 3 (Damp -> Damp -> Damp)", ["damp", "damp", "damp"])
    run_test("Transition (Wet -> Damp -> Dry)", ["wet", "damp", "dry"])
    run_test("Single Observation", ["dry"])
    run_test("Empty Sequence", [])

if __name__ == "__main__":
    main()
