from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.database.connection import Base


class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Links
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    
    # Payment type
    payment_type = Column(String, nullable=False)
    # premium_collection, claim_payout, advance_payout, remaining_payout
    
    # Amount
    amount = Column(Float, nullable=False)
    
    # UPI details
    upi_id = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    
    # Status
    status = Column(String, default="pending")
    # pending, processing, completed, failed
    
    # Gateway response
    gateway_response = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
