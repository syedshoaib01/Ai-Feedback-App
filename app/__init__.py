import os
from flask import Flask, jsonify, render_template
from app.config import get_config, BASE_DIR
from app.routes import web_bp, api_bp


def create_app(config_name=None):
    """Application factory for ReviewFlow Flask app."""
    templates_dir = os.path.join(BASE_DIR, "templates")
    static_dir = os.path.join(BASE_DIR, "static")

    app = Flask(
        __name__,
        template_folder=templates_dir,
        static_folder=static_dir,
    )

    # Load configuration
    config_class = get_config(config_name)
    app.config.from_object(config_class)

    # Register blueprints
    app.register_blueprint(web_bp)
    app.register_blueprint(api_bp)

    # Global error handlers
    @app.errorhandler(404)
    def handle_not_found(error):
        from flask import request
        if request.path.startswith("/api/"):
            return jsonify({"error": "Resource not found"}), 404
        return render_template("index.html", error="Page not found"), 404

    @app.errorhandler(500)
    def handle_server_error(error):
        from flask import request
        if request.path.startswith("/api/"):
            return jsonify({"error": "Internal server error"}), 500
        return "Internal Server Error", 500

    return app
