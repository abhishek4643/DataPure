"""
config.py — Application configuration.
Loads environment variables using Pydantic Settings.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str

    FUZZY_REDUNDANT_THRESHOLD: float = 85.0
    FUZZY_FLAGGED_THRESHOLD: float = 70.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()