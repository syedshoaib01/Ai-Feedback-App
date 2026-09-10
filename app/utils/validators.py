from typing import Tuple, Dict, Any, Optional

REQUIRED_RATING_FIELDS = ["food", "service", "ambience", "value", "overall"]

FIELD_LABELS = {
    "food": "Food & Drinks",
    "service": "Service",
    "ambience": "Ambience",
    "value": "Value for Money",
    "overall": "Overall Experience",
}


def validate_feedback_payload(data: Any) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
    """
    Validates the customer feedback JSON payload.
    
    Returns:
        (is_valid, error_message, cleaned_data)
    """
    if not isinstance(data, dict):
        return False, "Invalid request body. Expected a JSON object.", None

    # Check for missing rating fields
    missing = [f for f in REQUIRED_RATING_FIELDS if f not in data or data[f] is None or data[f] == ""]
    if missing:
        return False, "Please rate all five categories on the sliders (Food, Service, Ambience, Value, Overall).", None

    cleaned_scores = {}
    for field in REQUIRED_RATING_FIELDS:
        try:
            val = int(data[field])
            if not (1 <= val <= 5):
                raise ValueError()
            cleaned_scores[field] = val
        except (ValueError, TypeError):
            display_name = FIELD_LABELS.get(field, field.capitalize())
            return False, f"Rating for {display_name} must be an integer between 1 and 5.", None

    # Optional fields
    highlight = str(data.get("highlight", "") or "").strip()
    if len(highlight) > 100:
        highlight = highlight[:100]

    comment = str(data.get("comment", "") or "").strip()
    if len(comment) > 500:
        comment = comment[:500]

    cleaned_data = {
        **cleaned_scores,
        "highlight": highlight,
        "comment": comment,
    }

    return True, None, cleaned_data
