from typing import List, Dict, Any

# Condition severity mapping: wet (3) -> damp (2) -> drying (1) -> dry (0)
CONDITION_SCORES = {
    "wet": 3,
    "damp": 2,
    "drying": 1,
    "dry": 0
}


def analyze_trend(sequence: List[str]) -> Dict[str, Any]:
    """
    Analyzes recent track condition sequence and determines:
    - trend: "improving" (becoming drier), "deteriorating" (becoming wetter), or "stable"
    - condition: "wet", "damp", "drying", or "dry"
    - message: explanatory rationale string

    Rules:
    - Drying is a temporal condition returned during transitions from wetter towards dry conditions.
    - Single image observations return 'stable' with an insufficient data message.
    """
    if not sequence:
        return {
            "sequence": [],
            "trend": "stable",
            "condition": "dry",
            "message": "No historical track condition data recorded yet."
        }

    # Normalize sequence strings to lowercase
    norm_sequence = [str(item).lower() for item in sequence]

    if len(norm_sequence) < 2:
        latest = norm_sequence[0]
        return {
            "sequence": sequence,
            "trend": "stable",
            "condition": latest if latest != "drying" else "damp",
            "message": f"Insufficient historical data to determine a trend. Current observation: {latest}."
        }

    scores = [CONDITION_SCORES.get(cond, 0) for cond in norm_sequence]

    total_delta = scores[-1] - scores[0]
    recent_delta = scores[-1] - scores[-2]

    # Calculate step differences across sequence
    diffs = [scores[i] - scores[i - 1] for i in range(1, len(scores))]
    net_diff_sum = sum(diffs)

    # 1. Improving (Track is becoming progressively drier)
    if total_delta < 0 or (total_delta == 0 and recent_delta < 0) or (net_diff_sum < 0):
        trend = "improving"
        # Drying is returned when transitioning from wetter conditions towards dry
        condition = "drying"
        message = "Track conditions are progressively drying."

    # 2. Deteriorating (Track is becoming progressively wetter)
    elif total_delta > 0 or (total_delta == 0 and recent_delta > 0) or (net_diff_sum > 0):
        trend = "deteriorating"
        condition = norm_sequence[-1]
        message = "Track conditions are becoming progressively wetter."

    # 3. Stable (Condition remains approximately unchanged)
    else:
        trend = "stable"
        condition = norm_sequence[-1]
        message = "Track conditions are relatively stable."

    return {
        "sequence": sequence,
        "trend": trend,
        "condition": condition,
        "message": message
    }
