from flask import Blueprint, render_template, current_app

web_bp = Blueprint("web", __name__)


@web_bp.get("/")
def index():
    """Renders the main feedback questionnaire UI."""
    google_review_url = current_app.config.get("GOOGLE_REVIEW_URL", "")
    gemini_api_key = current_app.config.get("GEMINI_API_KEY", "")

    return render_template(
        "index.html",
        google_review_url=google_review_url,
        gemini_configured=bool(gemini_api_key),
    )
