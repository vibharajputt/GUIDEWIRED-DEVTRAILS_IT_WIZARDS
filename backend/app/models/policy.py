from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base


class Policy(Base):
    __tablename__ = "policies"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Worker link
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    
    # Plan details
    plan_type = Column(String, nullable=False)  # basic, standard, pro
    weekly_premium = Column(Float, nullable=False)
    
    # Coverage details
    coverage_percent = Column(Float, nullable=False)  # 70, 80, 90
    hourly_payout = Column(Float, nullable=False)  # 40, 55, 75
    daily_max_payout = Column(Float, nullable=False)  # 300, 450, 600
    weekly_max_payout = Column(Float, nullable=False)  # 1500, 2250, 3000
    
    # Duration
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    
    # Status
    status = Column(String, default="active")  # active, expired, paused, cancelled
    auto_renew = Column(Boolean, default=True)
    
    # Payment tracking
    total_paid_out = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())