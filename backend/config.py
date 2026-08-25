"""
config.py — Application configuration.
Loads environment variables using Pydantic Settings.
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str

    FUZZY_REDUNDANT_THRESHOLD: float = 85.0
    FUZZY_FLAGGED_THRESHOLD: float = 70.0

    @field_validator("DATABASE_URL")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if v:
            # Strip any accidental quotes from the string
            v = v.strip('"').strip("'")
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql://", 1)
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


import sys
from pydantic import ValidationError

try:
    settings = Settings()
except ValidationError as e:
    print("========================================")
    print("FATAL CONFIGURATION ERROR:")
    print("Missing or invalid environment variables.")
    print("Make sure you added DATABASE_URL in Render!")
    print(e)
    print("========================================")
    sys.exit(3)