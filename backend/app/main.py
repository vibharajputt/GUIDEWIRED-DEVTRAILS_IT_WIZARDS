import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func

# ============================================
# DATABASE SETUP
# ============================================
SQLALCHEMY_DATABASE_URL = "sqlite:///./gigshield.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================
# DATABASE MODELS
# ============================================

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    token_id = Column(String, unique=True, nullable=False, index=True)
    aadhaar_hash = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    platform = Column(String, nullable=False)
    pincode = Column(String, nullable=False)
    zone = Column(String, nullable=False)
    monthly_earning = Column(Float, nullable=False)
    working_hours_per_day = Column(Float, nullable=False)
    working_days_per_week = Column(Integer, nullable=False)
    hourly_rate = Column(Float, nullable=False)
    upi_id = Column(String, nullable=True)
    risk_score = Column(Float, default=0.5)
    trust_score = Column(Integer, default=50)
    trust_tier = Column(String, default="SILVER")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    plan_type = Column(String, nullable=False)
    weekly_premium = Column(Float, nullable=False)
    coverage_percent = Column(Float, nullable=False)
    hourly_payout = Column(Float, nullable=False)
    daily_max_payout = Column(Float, nullable=False)
    weekly_max_payout = Column(Float, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="active")
    auto_renew = Column(Boolean, default=True)
    total_paid_out = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Trigger(Base):
    __tablename__ = "triggers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    threshold = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    affected_zone = Column(String, nullable=False)
    affected_pincode = Column(String, nullable=False)
    duration_hours = Column(Float, default=0.0)
    source_api = Column(String, nullable=False)
    verified = Column(Boolean, default=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id"), nullable=False)
    trigger_id = Column(Integer, ForeignKey("triggers.id"), nullable=False)
    claim_amount = Column(Float, nullable=False)
    disruption_hours = Column(Float, nullable=False)
    hourly_rate = Column(Float, nullable=False)
    coverage_percent = Column(Float, nullable=False)
    fraud_score = Column(Float, default=0.0)
    fraud_details = Column(JSON, nullable=True)
    status = Column(String, default="pending")
    payout_amount = Column(Float, default=0.0)
    payout_status = Column(String, default="pending")
    payout_transaction_id = Column(String, nullable=True)
    priority_rank = Column(String, default="medium")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    payment_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    upi_id = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    status = Column(String, default="pending")
    gateway_response = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)


# ============================================
# CREATE ALL TABLES
# ============================================
Base.metadata.create_all(bind=engine)


# ============================================
# FASTAPI APP
# ============================================
app = FastAPI(
    title="GigShield API",
    description="AI-Powered Parametric Insurance for India's Gig Economy",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "GigShield API is running!",
        "version": "1.0.0",
        "status": "active"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "service": "GigShield Insurance Platform"
    }