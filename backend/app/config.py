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


@lru_cache
def get_settings() -> Settings:
    return Settings()
