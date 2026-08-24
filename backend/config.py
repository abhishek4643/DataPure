"""
config.py — Loads environment variables and exposes them as a typed settings object.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # PostgreSQL / Supabase connection string
    DATABASE_URL: str

    # Similarity thresholds (adjustable via .env)
    FUZZY_REDUNDANT_THRESHOLD: float = 95.0   # >= this → REDUNDANT (reject)
    FUZZY_FLAGGED_THRESHOLD: float = 75.0     # >= this and < redundant → FLAGGED

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# Singleton settings instance used app-wide
settings = Settings()
