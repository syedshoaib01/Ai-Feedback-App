"""
ReviewFlow Application Entrypoint & WSGI Shim.
Provides backward-compatibility for commands like `python app.py`, `flask run`, or `gunicorn app:app`.
"""
import os
from app import create_app

app = create_app(os.getenv("FLASK_CONFIG", "development"))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true" if "FLASK_DEBUG" in os.environ else app.config.get("DEBUG", True)
    print(f"[ReviewFlow] Starting application server on http://{host}:{port} (debug={debug})")
    app.run(host=host, port=port, debug=debug)
