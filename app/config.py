import os
from dotenv import load_dotenv

# Base directory is the project root (one level up from app/)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Load .env file from the root directory
load_dotenv(os.path.join(BASE_DIR, ".env"))


class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-reviewflow-2026")
    GOOGLE_REVIEW_URL = os.getenv("GOOGLE_REVIEW_URL", "").strip()
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash").strip()
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    """Development environment configuration."""
    DEBUG = True


class TestingConfig(Config):
    """Testing environment configuration."""
    TESTING = True
    DEBUG = True
    GEMINI_API_KEY = "test-mock-api-key"
    GOOGLE_REVIEW_URL = "https://maps.google.com/test-review-link"


class ProductionConfig(Config):
    """Production environment configuration."""
    DEBUG = False


CONFIG_BY_NAME = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config(config_name=None):
    """Retrieve configuration class by environment name or FLASK_CONFIG env var."""
    if config_name is None:
        config_name = os.getenv("FLASK_CONFIG", "default")
    return CONFIG_BY_NAME.get(config_name.lower(), DevelopmentConfig)
