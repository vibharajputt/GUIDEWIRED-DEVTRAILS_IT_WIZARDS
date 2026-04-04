from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from app.database.connection import Base


class Worker(Base):
    __tablename__ = "workers"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Unique Token (Aadhaar based)
    token_id = Column(String, unique=True, nullable=False, index=True)
    aadhaar_hash = Column(String, unique=True, nullable=False)
    
    # Personal Info
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    
    # Work Info
    platform = Column(String, nullable=False)  # zepto, blinkit, swiggy_instamart
    pincode = Column(String, nullable=False)
    zone = Column(String, nullable=False)
    
    # Earning Info
    monthly_earning = Column(Float, nullable=False)
    working_hours_per_day = Column(Float, nullable=False)
    working_days_per_week = Column(Integer, nullable=False)
    hourly_rate = Column(Float, nullable=False)
    
    # Payment
    upi_id = Column(String, nullable=True)
    
    # Risk and Trust
    risk_score = Column(Float, default=0.5)
    trust_score = Column(Integer, default=50)  # Starts at SILVER
    trust_tier = Column(String, default="SILVER")
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
