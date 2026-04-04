from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from app.database.connection import Base


class Trigger(Base):
    __tablename__ = "triggers"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Trigger details
    type = Column(String, nullable=False)
    # Examples: HEAVY_RAIN, EXTREME_HEAT, SEVERE_AQI, FLOOD, 
    # CYCLONE, EARTHQUAKE, CURFEW, BANDH, APP_DOWN, INTERNET_SHUTDOWN
    
    category = Column(String, nullable=False)
    # weather, natural_disaster, social, technical
    
    severity = Column(String, nullable=False)  # low, medium, high, critical
    
    # Measurement
    value = Column(Float, nullable=False)  # actual measured value
    threshold = Column(Float, nullable=False)  # threshold that was crossed
    unit = Column(String, nullable=False)  # mm_per_hr, celsius, aqi, etc
    
    # Location
    affected_zone = Column(String, nullable=False)
    affected_pincode = Column(String, nullable=False)
    
    # Duration
    duration_hours = Column(Float, default=0.0)
    
    # Source
    source_api = Column(String, nullable=False)  # openweathermap, aqicn, newsapi, manual
    
    # Verification
    verified = Column(Boolean, default=True)
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
