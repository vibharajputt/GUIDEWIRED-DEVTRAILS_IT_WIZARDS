import sys
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
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
# PYDANTIC MODELS (Request/Response Schemas)
# ============================================

# --- Aadhaar OTP ---
class AadhaarOTPRequest(BaseModel):
    aadhaar_number: str

class AadhaarOTPResponse(BaseModel):
    message: str
    otp_sent: bool
    masked_phone: str
    session_id: str

class AadhaarVerifyRequest(BaseModel):
    aadhaar_number: str
    otp: str
    session_id: str

class AadhaarVerifyResponse(BaseModel):
    verified: bool
    message: str
    aadhaar_hash: str

# --- Worker Registration ---
class WorkerRegisterRequest(BaseModel):
    aadhaar_number: str
    name: str
    phone: str
    platform: str          # zepto, blinkit, swiggy_instamart
    pincode: str
    zone: str
    monthly_earning: float
    working_hours_per_day: float
    working_days_per_week: int
    upi_id: Optional[str] = None

class WorkerResponse(BaseModel):
    id: int
    token_id: str
    name: str
    phone: str
    platform: str
    pincode: str
    zone: str
    monthly_earning: float
    weekly_earning: float
    daily_earning: float
    hourly_rate: float
    working_hours_per_day: float
    working_days_per_week: int
    upi_id: Optional[str]
    risk_score: float
    trust_score: int
    trust_tier: str
    is_active: bool

    class Config:
        from_attributes = True


# ============================================
# HELPER FUNCTIONS
# ============================================

# Mock OTP Storage (in production use Redis)
otp_storage = {}

def generate_aadhaar_hash(aadhaar_number: str) -> str:
    """Generate SHA-256 hash of Aadhaar number"""
    salt = "gigshield_salt_2026"
    return hashlib.sha256(f"{aadhaar_number}{salt}".encode()).hexdigest()

def generate_token_id(aadhaar_hash: str) -> str:
    """Generate unique GigShield token from Aadhaar hash"""
    short_hash = aadhaar_hash[:8].upper()
    return f"GS-{short_hash}"

def calculate_hourly_rate(monthly_earning: float, working_days_per_week: int, working_hours_per_day: float) -> float:
    """Calculate hourly earning rate"""
    weekly_earning = monthly_earning / 4
    daily_earning = weekly_earning / working_days_per_week
    hourly_rate = daily_earning / working_hours_per_day
    return round(hourly_rate, 2)

def calculate_risk_score(pincode: str, zone: str, platform: str) -> float:
    """Calculate initial risk score based on zone"""
    # High risk zones (flood-prone, AQI-prone)
    high_risk_zones = {
        "400053": 0.72,  # Andheri, Mumbai
        "400050": 0.65,  # Bandra, Mumbai
        "110001": 0.60,  # Connaught Place, Delhi
        "122001": 0.68,  # Gurugram
        "560066": 0.55,  # Whitefield, Bangalore
        "600004": 0.75,  # Marina Beach, Chennai
    }
    
    # Check if pincode is in high risk list
    if pincode in high_risk_zones:
        base_risk = high_risk_zones[pincode]
    else:
        # Default moderate risk
        base_risk = 0.45
    
    # Platform adjustment (quick-commerce = slightly higher risk)
    platform_risk = {
        "zepto": 0.05,
        "blinkit": 0.05,
        "swiggy_instamart": 0.03,
        "swiggy": 0.02,
        "zomato": 0.02,
        "amazon": 0.01,
        "flipkart": 0.01,
    }
    
    platform_adj = platform_risk.get(platform.lower(), 0.03)
    
    final_risk = min(1.0, base_risk + platform_adj)
    return round(final_risk, 2)

def get_trust_tier(trust_score: int) -> str:
    """Get trust tier based on score"""
    if trust_score >= 80:
        return "PLATINUM"
    elif trust_score >= 60:
        return "GOLD"
    elif trust_score >= 40:
        return "SILVER"
    elif trust_score >= 20:
        return "BRONZE"
    else:
        return "SUSPENDED"


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


# ============================================
# ROOT ENDPOINTS
# ============================================

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


# ============================================
# AADHAAR OTP ENDPOINTS (Mock)
# ============================================

@app.post("/api/aadhaar/send-otp", response_model=AadhaarOTPResponse, tags=["Aadhaar Verification"])
def send_aadhaar_otp(request: AadhaarOTPRequest):
    """
    Step 1: Send OTP to Aadhaar-linked mobile number (MOCK)
    In production this would call UIDAI API
    """
    aadhaar = request.aadhaar_number.strip()
    
    # Validate Aadhaar format (12 digits)
    if len(aadhaar) != 12 or not aadhaar.isdigit():
        raise HTTPException(
            status_code=400,
            detail="Invalid Aadhaar number. Must be 12 digits."
        )
    
    # Generate mock OTP (in production UIDAI sends this)
    mock_otp = "123456"  # Fixed OTP for testing
    session_id = secrets.token_hex(16)
    
    # Store OTP temporarily
    otp_storage[session_id] = {
        "aadhaar": aadhaar,
        "otp": mock_otp,
        "created_at": datetime.now(),
        "verified": False
    }
    
    # Mask phone number (mock)
    masked_phone = f"XXXXXX{aadhaar[-4:]}"
    
    return AadhaarOTPResponse(
        message=f"OTP sent to mobile number ending with {aadhaar[-4:]}",
        otp_sent=True,
        masked_phone=masked_phone,
        session_id=session_id
    )


@app.post("/api/aadhaar/verify-otp", response_model=AadhaarVerifyResponse, tags=["Aadhaar Verification"])
def verify_aadhaar_otp(request: AadhaarVerifyRequest):
    """
    Step 2: Verify OTP and authenticate Aadhaar (MOCK)
    Use OTP: 123456 for testing
    """
    session = otp_storage.get(request.session_id)
    
    if not session:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired session. Please request OTP again."
        )
    
    # Check if OTP matches
    if session["otp"] != request.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP. Please try again. (Hint: Use 123456)"
        )
    
    # Check if Aadhaar matches
    if session["aadhaar"] != request.aadhaar_number:
        raise HTTPException(
            status_code=400,
            detail="Aadhaar number mismatch."
        )
    
    # Mark as verified
    session["verified"] = True
    
    # Generate Aadhaar hash
    aadhaar_hash = generate_aadhaar_hash(request.aadhaar_number)
    
    return AadhaarVerifyResponse(
        verified=True,
        message="Aadhaar verified successfully!",
        aadhaar_hash=aadhaar_hash
    )


# ============================================
# WORKER REGISTRATION ENDPOINTS
# ============================================

@app.post("/api/workers/register", response_model=WorkerResponse, tags=["Worker Registration"])
def register_worker(request: WorkerRegisterRequest, db: Session = Depends(get_db)):
    """
    Step 3: Register a new delivery worker
    
    This will:
    1. Verify Aadhaar is not already registered
    2. Generate unique GigShield token (GS-XXXXXXXX)
    3. Calculate hourly earning rate
    4. Assign zone risk score
    5. Set initial trust score to 50 (SILVER)
    """
    
    # Validate Aadhaar
    aadhaar = request.aadhaar_number.strip()
    if len(aadhaar) != 12 or not aadhaar.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number. Must be 12 digits.")
    
    # Validate platform
    valid_platforms = ["zepto", "blinkit", "swiggy_instamart", "swiggy", "zomato", "amazon", "flipkart", "dunzo"]
    if request.platform.lower() not in valid_platforms:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid platform. Must be one of: {', '.join(valid_platforms)}"
        )
    
    # Validate earning
    if request.monthly_earning <= 0:
        raise HTTPException(status_code=400, detail="Monthly earning must be greater than 0")
    
    if request.working_hours_per_day <= 0 or request.working_hours_per_day > 24:
        raise HTTPException(status_code=400, detail="Working hours must be between 1 and 24")
    
    if request.working_days_per_week <= 0 or request.working_days_per_week > 7:
        raise HTTPException(status_code=400, detail="Working days must be between 1 and 7")
    
    # Generate Aadhaar hash
    aadhaar_hash = generate_aadhaar_hash(aadhaar)
    
    # Check if Aadhaar already registered
    existing_worker = db.query(Worker).filter(Worker.aadhaar_hash == aadhaar_hash).first()
    if existing_worker:
        raise HTTPException(
            status_code=409,
            detail="This Aadhaar is already registered. One Aadhaar = One Account."
        )
    
    # Check if phone already registered
    existing_phone = db.query(Worker).filter(Worker.phone == request.phone).first()
    if existing_phone:
        raise HTTPException(
            status_code=409,
            detail="This phone number is already registered."
        )
    
    # Generate unique token
    token_id = generate_token_id(aadhaar_hash)
    
    # Calculate hourly rate
    hourly_rate = calculate_hourly_rate(
        request.monthly_earning,
        request.working_days_per_week,
        request.working_hours_per_day
    )
    
    # Calculate risk score
    risk_score = calculate_risk_score(
        request.pincode,
        request.zone,
        request.platform
    )
    
    # Create worker
    new_worker = Worker(
        token_id=token_id,
        aadhaar_hash=aadhaar_hash,
        name=request.name,
        phone=request.phone,
        platform=request.platform.lower(),
        pincode=request.pincode,
        zone=request.zone,
        monthly_earning=request.monthly_earning,
        working_hours_per_day=request.working_hours_per_day,
        working_days_per_week=request.working_days_per_week,
        hourly_rate=hourly_rate,
        upi_id=request.upi_id,
        risk_score=risk_score,
        trust_score=50,
        trust_tier="SILVER",
        is_active=True
    )
    
    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)
    
    # Calculate earnings for response
    weekly_earning = round(request.monthly_earning / 4, 2)
    daily_earning = round(weekly_earning / request.working_days_per_week, 2)
    
    return WorkerResponse(
        id=new_worker.id,
        token_id=new_worker.token_id,
        name=new_worker.name,
        phone=new_worker.phone,
        platform=new_worker.platform,
        pincode=new_worker.pincode,
        zone=new_worker.zone,
        monthly_earning=new_worker.monthly_earning,
        weekly_earning=weekly_earning,
        daily_earning=daily_earning,
        hourly_rate=new_worker.hourly_rate,
        working_hours_per_day=new_worker.working_hours_per_day,
        working_days_per_week=new_worker.working_days_per_week,
        upi_id=new_worker.upi_id,
        risk_score=new_worker.risk_score,
        trust_score=new_worker.trust_score,
        trust_tier=new_worker.trust_tier,
        is_active=new_worker.is_active
    )


@app.get("/api/workers/token/{token_id}", response_model=WorkerResponse, tags=["Worker Management"])
def get_worker_by_token(token_id: str, db: Session = Depends(get_db)):
    """
    Get worker details by their unique GigShield token (GS-XXXXXXXX)
    """
    worker = db.query(Worker).filter(Worker.token_id == token_id).first()
    
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found with this token.")
    
    weekly_earning = round(worker.monthly_earning / 4, 2)
    daily_earning = round(weekly_earning / worker.working_days_per_week, 2)
    
    return WorkerResponse(
        id=worker.id,
        token_id=worker.token_id,
        name=worker.name,
        phone=worker.phone,
        platform=worker.platform,
        pincode=worker.pincode,
        zone=worker.zone,
        monthly_earning=worker.monthly_earning,
        weekly_earning=weekly_earning,
        daily_earning=daily_earning,
        hourly_rate=worker.hourly_rate,
        working_hours_per_day=worker.working_hours_per_day,
        working_days_per_week=worker.working_days_per_week,
        upi_id=worker.upi_id,
        risk_score=worker.risk_score,
        trust_score=worker.trust_score,
        trust_tier=worker.trust_tier,
        is_active=worker.is_active
    )


@app.get("/api/workers/{worker_id}", response_model=WorkerResponse, tags=["Worker Management"])
def get_worker_by_id(worker_id: int, db: Session = Depends(get_db)):
    """
    Get worker details by database ID
    """
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")
    
    weekly_earning = round(worker.monthly_earning / 4, 2)
    daily_earning = round(weekly_earning / worker.working_days_per_week, 2)
    
    return WorkerResponse(
        id=worker.id,
        token_id=worker.token_id,
        name=worker.name,
        phone=worker.phone,
        platform=worker.platform,
        pincode=worker.pincode,
        zone=worker.zone,
        monthly_earning=worker.monthly_earning,
        weekly_earning=weekly_earning,
        daily_earning=daily_earning,
        hourly_rate=worker.hourly_rate,
        working_hours_per_day=worker.working_hours_per_day,
        working_days_per_week=worker.working_days_per_week,
        upi_id=worker.upi_id,
        risk_score=worker.risk_score,
        trust_score=worker.trust_score,
        trust_tier=worker.trust_tier,
        is_active=worker.is_active
    )


@app.get("/api/workers", tags=["Worker Management"])
def get_all_workers(db: Session = Depends(get_db)):
    """
    Get all registered workers (Admin endpoint)
    """
    workers = db.query(Worker).all()
    
    result = []
    for worker in workers:
        weekly_earning = round(worker.monthly_earning / 4, 2)
        daily_earning = round(weekly_earning / worker.working_days_per_week, 2)
        
        result.append({
            "id": worker.id,
            "token_id": worker.token_id,
            "name": worker.name,
            "phone": worker.phone,
            "platform": worker.platform,
            "pincode": worker.pincode,
            "zone": worker.zone,
            "monthly_earning": worker.monthly_earning,
            "weekly_earning": weekly_earning,
            "daily_earning": daily_earning,
            "hourly_rate": worker.hourly_rate,
            "risk_score": worker.risk_score,
            "trust_score": worker.trust_score,
            "trust_tier": worker.trust_tier,
            "is_active": worker.is_active
        })
    
    return {
        "total_workers": len(result),
        "workers": result
    }


@app.get("/api/workers/phone/{phone}", response_model=WorkerResponse, tags=["Worker Management"])
def get_worker_by_phone(phone: str, db: Session = Depends(get_db)):
    """
    Get worker details by phone number
    """
    worker = db.query(Worker).filter(Worker.phone == phone).first()
    
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found with this phone number.")
    
    weekly_earning = round(worker.monthly_earning / 4, 2)
    daily_earning = round(weekly_earning / worker.working_days_per_week, 2)
    
    return WorkerResponse(
        id=worker.id,
        token_id=worker.token_id,
        name=worker.name,
        phone=worker.phone,
        platform=worker.platform,
        pincode=worker.pincode,
        zone=worker.zone,
        monthly_earning=worker.monthly_earning,
        weekly_earning=weekly_earning,
        daily_earning=daily_earning,
        hourly_rate=worker.hourly_rate,
        working_hours_per_day=worker.working_hours_per_day,
        working_days_per_week=worker.working_days_per_week,
        upi_id=worker.upi_id,
        risk_score=worker.risk_score,
        trust_score=worker.trust_score,
        trust_tier=worker.trust_tier,
        is_active=worker.is_active
    )