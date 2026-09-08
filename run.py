import os
from app import create_app

config_name = os.getenv("FLASK_CONFIG", "development")
app = create_app(config_name)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "127.0.0.1")
    debug = app.config.get("DEBUG", True)
    print(f"[ReviewFlow] Starting application server on http://{host}:{port} (debug={debug})")
    app.run(host=host, port=port, debug=debug)
