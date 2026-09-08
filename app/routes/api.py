from flask import Blueprint, request, jsonify, current_app
from app.utils.validators import validate_feedback_payload
from app.services.gemini_service import GeminiService, GeminiConfigError, GeminiServiceError

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.post("/generate")
def generate():
    """Generates an authentic review from customer feedback using Gemini."""
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({
            "error": "Invalid request body. Expected JSON with satisfaction ratings."
        }), 400

    # 1. Validate payload
    is_valid, error_msg, cleaned_data = validate_feedback_payload(payload)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    api_key = current_app.config.get("GEMINI_API_KEY", "").strip()
    model = current_app.config.get("GEMINI_MODEL", "gemini-3.5-flash").strip()
    google_review_url = current_app.config.get("GOOGLE_REVIEW_URL", "").strip()

    # 2. Check configuration
    if not api_key:
        current_app.logger.warning("[ReviewFlow] Gemini request failed: GEMINI_API_KEY not configured.")
        return jsonify({
            "error": "GEMINI_API_KEY is not configured in .env. Please set GEMINI_API_KEY.",
            "source": "error",
            "google_review_url": google_review_url,
        }), 503

    # 3. Call Gemini Service
    try:
        service = GeminiService(api_key=api_key, model=model)
        review = service.generate_review(cleaned_data)

        return jsonify({
            "review": review,
            "source": "Gemini",
            "google_review_url": google_review_url,
        }), 200

    except GeminiConfigError as exc:
        return jsonify({
            "error": str(exc),
            "source": "error",
            "google_review_url": google_review_url,
        }), 503

    except GeminiServiceError as exc:
        return jsonify({
            "error": "Gemini couldn't generate the review. Please try again.",
            "details": str(exc),
            "source": "error",
            "google_review_url": google_review_url,
        }), 502

    except Exception as exc:
        current_app.logger.exception("[ReviewFlow] Unexpected error in generate endpoint: %s", exc)
        return jsonify({
            "error": "An unexpected error occurred while generating the review.",
            "details": str(exc)[:160],
            "source": "error",
            "google_review_url": google_review_url,
        }), 500


@api_bp.get("/health")
def health():
    """Healthcheck endpoint reporting server status and configuration flags."""
    return jsonify({
        "status": "healthy",
        "gemini_configured": bool(current_app.config.get("GEMINI_API_KEY")),
        "google_review_configured": bool(current_app.config.get("GOOGLE_REVIEW_URL")),
        "model": current_app.config.get("GEMINI_MODEL", "gemini-3.5-flash"),
    }), 200
