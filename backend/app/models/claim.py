from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.database.connection import Base


class Claim(Base):
    __tablename__ = "claims"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Links
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    trigger_id = Column(Integer, ForeignKey("triggers.id"), nullable=False)
    
    # Claim details
    claim_amount = Column(Float, nullable=False)
    disruption_hours = Column(Float, nullable=False)
    hourly_rate = Column(Float, nullable=False)
    coverage_percent = Column(Float, nullable=False)
    
    # Fraud detection
    fraud_score = Column(Float, default=0.0)  # 0 to 100
    fraud_details = Column(JSON, nullable=True)
    # Stores: layer_scores, flags, checks passed/failed
    
    # Decision
    status = Column(String, default="pending")
    # pending, auto_approved, manual_review, approved, rejected, appealed
    
    # Payout
    payout_amount = Column(Float, default=0.0)
    payout_status = Column(String, default="pending")
    # pending, processing, paid, failed
    
    payout_transaction_id = Column(String, nullable=True)
    
    # Priority ranking
    priority_rank = Column(String, default="medium")
    # critical, high, medium, low
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
