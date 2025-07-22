"""
Enterprise Configuration Management
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    MONGO_CONN: str = "mongodb+srv://sandeepsathunuri:Zs8Sltk7Bgkm0OLw@cluster0.9jgkwaa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

    
    # Security
    JWT_SECRET: str = "default-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # AI Services
    GROQ_API_KEY: str = "your-groq-api-key-here"
    ELEVENLABS_API_KEY: str = "your-elevenlabs-api-key-here"
    OPENAI_API_KEY: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # File Storage
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/webp"]
    ALLOWED_AUDIO_TYPES: list = ["audio/mpeg", "audio/wav", "audio/webm"]
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "INFO"
    
    # Performance
    WORKER_PROCESSES: int = 4
    MAX_CONCURRENT_REQUESTS: int = 100
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    @field_validator('ENVIRONMENT')
    @classmethod
    def validate_environment(cls, v):
        if v not in ['development', 'staging', 'production']:
            raise ValueError('Environment must be development, staging, or production')
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()