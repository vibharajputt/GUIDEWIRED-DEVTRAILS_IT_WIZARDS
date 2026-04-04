from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# SQLite use karenge development ke liye (PostgreSQL baad mein)
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Agar SQLite hai toh connect_args chahiye
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database session dene ka function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
