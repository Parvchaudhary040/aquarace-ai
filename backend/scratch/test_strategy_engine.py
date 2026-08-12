import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.strategy_service import evaluate_strategy

def main():
    test_cases = [
        ("WET + stable", "wet", "stable"),
        ("WET + improving", "wet", "improving"),
        ("WET + deteriorating", "wet", "deteriorating"),
        ("DAMP + stable", "damp", "stable"),
        ("DAMP + improving", "damp", "improving"),
        ("DRYING + improving", "drying", "improving"),
        ("DRY + stable", "dry", "stable"),
        ("DRY + deteriorating", "dry", "deteriorating"),
        ("Fallback (Empty/Invalid)", "", ""),
    ]

    print("==========================================================================")
    print("           AQUARACE AI - STRATEGY ENGINE DECISION MATRIX TEST            ")
    print("==========================================================================")

    for label, cond, trend in test_cases:
        res = evaluate_strategy(cond, trend)
        print(f"[{label}]")
        print(f"  Inputs         : condition='{cond}', trend='{trend}'")
        print(f"  Current Cond   : {res['current_condition']}")
        print(f"  Current Tire   : {res['current_tire']}")
        print(f"  Recommendation : {res['recommendation']}")
        print(f"  Urgency        : {res['urgency']}")
        print(f"  Reason         : {res['reason']}")
        print("-" * 74)

if __name__ == "__main__":
    main()
