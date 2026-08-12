from typing import Dict, Any, List


def evaluate_strategy(current_condition: str, trend: str, history_sequence: List[str] = None) -> Dict[str, Any]:
    """
    Explainable deterministic tire-strategy decision engine using:
    - current_condition: 'dry', 'damp', 'drying', 'wet'
    - trend: 'improving', 'deteriorating', 'stable'
    - history_sequence: optional recent condition sequence

    Prototype decision matrix:
    - WET + stable        -> "Recommend staying on wet/intermediate setup" | urgency: low  | tire: wet
    - WET + improving     -> "Recommend monitoring the drying transition"  | urgency: medium| tire: wet
    - WET + deteriorating -> "Recommend wet-weather tire strategy"         | urgency: high  | tire: wet
    - DAMP + stable       -> "Recommend intermediate tire"                 | urgency: low  | tire: intermediate
    - DAMP + improving    -> "Recommend preparing for a tire transition"   | urgency: medium| tire: intermediate
    - DRYING + improving  -> "Prepare for slick-tire transition"           | urgency: high  | tire: intermediate
    - DRY + stable        -> "Recommend dry-weather tire strategy"         | urgency: low  | tire: slick
    - DRY + deteriorating -> "Recommend monitoring for changing conditions"| urgency: medium| tire: slick
    """
    cond = (current_condition or "dry").lower()
    tr = (trend or "stable").lower()

    # Deduce current mounted tire type
    if cond == "dry":
        current_tire = "slick"
    elif cond == "wet":
        current_tire = "wet"
    else:  # damp or drying
        current_tire = "intermediate"

    # Default fallback reason / recommendation for unexpected states
    recommendation = "Recommend dry-weather tire strategy"
    urgency = "low"
    reason = "Prototype decision-support baseline."

    if cond == "wet":
        if tr == "stable":
            recommendation = "Recommend staying on wet/intermediate setup"
            urgency = "low"
            reason = "Track remains consistently wet with stable moisture levels."
        elif tr == "improving":
            recommendation = "Recommend monitoring the drying transition"
            urgency = "medium"
            reason = "Track is wet but drying up. Monitor for crossover opportunity to intermediate tires."
        elif tr == "deteriorating":
            recommendation = "Recommend wet-weather tire strategy"
            urgency = "high"
            reason = "Track conditions are heavily wet and worsening. Immediate wet-weather tire enforcement required."

    elif cond == "damp":
        if tr == "stable":
            recommendation = "Recommend intermediate tire"
            urgency = "low"
            reason = "Track remains damp with stable moisture levels. Intermediate tires offer optimal performance."
        elif tr == "improving":
            recommendation = "Recommend preparing for a tire transition"
            urgency = "medium"
            reason = "Track moisture is decreasing. Prepare pit crew for potential slick tire transition."
        elif tr == "deteriorating":
            recommendation = "Recommend wet-weather tire strategy"
            urgency = "high"
            reason = "Track moisture is increasing rapidly. Prepare for wet-weather tire transition."

    elif cond == "drying":
        if tr == "improving":
            recommendation = "Prepare for slick-tire transition"
            urgency = "high"
            reason = "Recent observations indicate progressively drying track conditions."
        elif tr == "stable":
            recommendation = "Recommend preparing for a tire transition"
            urgency = "medium"
            reason = "Track is drying and stabilizing. Prepare for slick tire crossover."
        elif tr == "deteriorating":
            recommendation = "Recommend intermediate tire"
            urgency = "medium"
            reason = "Track drying phase stalled; moisture is returning. Maintain intermediate tire strategy."

    elif cond == "dry":
        if tr == "stable" or tr == "improving":
            recommendation = "Recommend dry-weather tire strategy"
            urgency = "low"
            reason = "Track is dry and stable. Maximum pace on dry slick compounds."
        elif tr == "deteriorating":
            recommendation = "Recommend monitoring for changing conditions"
            urgency = "medium"
            reason = "Track surface moisture is increasing. Prepare for transition away from slicks."

    return {
        "current_condition": cond,
        "trend": tr,
        "current_tire": current_tire,
        "recommendation": recommendation,
        "urgency": urgency,
        "reason": reason
    }
