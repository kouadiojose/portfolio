"""Application configuration, driven by environment variables.

Defaults are development-friendly (SQLite database, permissive CORS for the
Angular dev server). Production values are injected via docker-compose / the
hosting environment.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    app_name: str = "Portfolio API"
    database_url: str = "sqlite:///./portfolio.db"

    # Security
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 12
    jwt_algorithm: str = "HS256"

    # Initial admin account, created by the seed script if missing
    admin_email: str = "kouadiojose@gmail.com"
    admin_password: str = "admin"

    # Comma-separated list of allowed CORS origins
    cors_origins: str = "http://localhost:4200,http://127.0.0.1:4200"

    # When the database schema no longer matches the models (e.g. after a
    # pre-launch schema change), drop and re-seed automatically at startup.
    # Set to false once your content is curated and you prefer manual resets.
    reset_on_schema_mismatch: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_dev_database(self) -> bool:
        """SQLite is only ever used in local development — every deployment
        target (Railway, docker-compose) injects a real DATABASE_URL."""
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


DEFAULT_SECRET_KEY = "change-me-in-production"


def assert_production_secrets(settings: Settings) -> None:
    """Refuse to boot against a real database with the placeholder secret key.

    The secret key signs every admin JWT and the contact-form anti-spam
    token, and salts the visitor-analytics hash — a leaked/default value lets
    anyone forge an admin session. SQLite is used only in local dev, so a
    non-SQLite DATABASE_URL is treated as "this is a real deployment".
    """
    if not settings.is_dev_database and settings.secret_key == DEFAULT_SECRET_KEY:
        raise RuntimeError(
            "SECRET_KEY is still the default placeholder value while DATABASE_URL points "
            "to a non-SQLite database. Set a strong SECRET_KEY (e.g. `openssl rand -hex 32`) "
            "before deploying — refusing to start with an insecure secret."
        )
