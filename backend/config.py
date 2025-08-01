"""
Simple Configuration Management
"""
import os

class Settings:
    def __init__(self):
        # Database
        self.MONGO_CONN = os.getenv("MONGO_CONN", "mongodb+srv://sandeepsathunuri:Zs8Sltk7Bgkm0OLw@cluster0.9jgkwaa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        
        # Security
        self.JWT_SECRET = os.getenv("JWT_SECRET", "default-secret-key-change-in-production")
        self.JWT_ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 1440
        
        # AI Services
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your-groq-api-key-here")
        self.ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "your-elevenlabs-api-key-here")
        
        # Environment
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        self.DEBUG = False

settings = Settings()