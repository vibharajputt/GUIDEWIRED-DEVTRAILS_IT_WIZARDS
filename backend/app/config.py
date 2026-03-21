import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gigshield.db")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    JWT_SECRET = os.getenv("JWT_SECRET", "gigshield_super_secret_key_2026")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRY_MINUTES = 1440  # 24 hours
    
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
    AQICN_API_KEY = os.getenv("AQICN_API_KEY", "")
    NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

settings = Settings()