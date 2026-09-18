from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="MAINTIQ_")

    version: str = "0.1.0"
    database_url: str = "sqlite:///./maintiq.db"
    session_secret: str = "dev-only-change-me"
    cookie_secure: bool = False  # True in production (HTTPS)
    cors_origins: str = "http://localhost:3000"  # comma-separated in production
    scheduler_enabled: bool = True
    schedule_hours: float = 24.0


settings = Settings()
