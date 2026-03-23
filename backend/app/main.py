import sys
import os
import hashlib
import secrets
import random
from datetime import datetime, timedelta
from typing import Optional, List

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
    premium_breakdown = Column(JSON, nullable=True)
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
# PYDANTIC MODELS (Request/Response)
# ============================================

# --- Aadhaar ---
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

# --- Worker ---
class WorkerRegisterRequest(BaseModel):
    aadhaar_number: str
    name: str
    phone: str
    platform: str
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

# --- Premium Calculation ---
class PremiumCalculateRequest(BaseModel):
    worker_id: int
    plan_type: str  # basic, standard, pro

class PremiumBreakdown(BaseModel):
    base_rate: float
    zone_risk_multiplier: float
    seasonal_multiplier: float
    claims_history_multiplier: float
    working_hours_multiplier: float
    trust_discount: float
    platform_surcharge: float
    final_weekly_premium: float
    plan_type: str
    coverage_percent: float
    hourly_payout: float
    daily_max_payout: float
    weekly_max_payout: float

# --- Policy ---
class PolicyCreateRequest(BaseModel):
    worker_id: int
    plan_type: str  # basic, standard, pro
    auto_renew: Optional[bool] = True

class PolicyResponse(BaseModel):
    id: int
    worker_id: int
    worker_name: str
    worker_token: str
    plan_type: str
    weekly_premium: float
    coverage_percent: float
    hourly_payout: float
    daily_max_payout: float
    weekly_max_payout: float
    start_date: str
    end_date: str
    status: str
    auto_renew: bool
    total_paid_out: float
    premium_breakdown: dict
    days_remaining: int

class PolicyRenewRequest(BaseModel):
    policy_id: int


# ============================================
# HELPER FUNCTIONS
# ============================================

otp_storage = {}

def generate_aadhaar_hash(aadhaar_number: str) -> str:
    salt = "gigshield_salt_2026"
    return hashlib.sha256(f"{aadhaar_number}{salt}".encode()).hexdigest()

def generate_token_id(aadhaar_hash: str) -> str:
    short_hash = aadhaar_hash[:8].upper()
    return f"GS-{short_hash}"

def calculate_hourly_rate(monthly_earning, working_days_per_week, working_hours_per_day):
    weekly_earning = monthly_earning / 4
    daily_earning = weekly_earning / working_days_per_week
    hourly_rate = daily_earning / working_hours_per_day
    return round(hourly_rate, 2)

def calculate_risk_score(pincode, zone, platform):
    high_risk_zones = {
        "400053": 0.72, "400050": 0.65, "110001": 0.60,
        "122001": 0.68, "560066": 0.55, "600004": 0.75,
        "400069": 0.70, "110085": 0.62, "560103": 0.58,
        "500081": 0.50, "411014": 0.52, "302001": 0.48,
    }
    base_risk = high_risk_zones.get(pincode, 0.45)
    platform_risk = {
        "zepto": 0.05, "blinkit": 0.05, "swiggy_instamart": 0.03,
        "swiggy": 0.02, "zomato": 0.02, "amazon": 0.01, "flipkart": 0.01,
    }
    platform_adj = platform_risk.get(platform.lower(), 0.03)
    return round(min(1.0, base_risk + platform_adj), 2)

def get_trust_tier(trust_score):
    if trust_score >= 80: return "PLATINUM"
    elif trust_score >= 60: return "GOLD"
    elif trust_score >= 40: return "SILVER"
    elif trust_score >= 20: return "BRONZE"
    else: return "SUSPENDED"


# ============================================
# PREMIUM CALCULATOR (AI/ML Based)
# ============================================

PLAN_CONFIG = {
    "basic": {
        "coverage_percent": 70,
        "hourly_payout": 40,
        "daily_max_payout": 300,
        "weekly_max_payout": 1500,
    },
    "standard": {
        "coverage_percent": 80,
        "hourly_payout": 55,
        "daily_max_payout": 450,
        "weekly_max_payout": 2250,
    },
    "pro": {
        "coverage_percent": 90,
        "hourly_payout": 75,
        "daily_max_payout": 600,
        "weekly_max_payout": 3000,
    }
}

def get_zone_risk_multiplier(risk_score: float) -> float:
    """ML-based zone risk multiplier"""
    if risk_score <= 0.2:
        return 0.85
    elif risk_score <= 0.4:
        return 1.00
    elif risk_score <= 0.6:
        return 1.15
    elif risk_score <= 0.8:
        return 1.30
    else:
        return 1.50

def get_seasonal_multiplier() -> float:
    """Seasonal risk multiplier based on current month"""
    month = datetime.now().month
    seasonal_map = {
        1: 1.10,   # January - Winter fog
        2: 1.10,   # February - Winter fog
        3: 1.15,   # March - Summer starting
        4: 1.15,   # April - Summer heat
        5: 1.20,   # May - Peak summer
        6: 1.30,   # June - Monsoon starts
        7: 1.40,   # July - Peak monsoon
        8: 1.35,   # August - Monsoon
        9: 1.25,   # September - Monsoon ending
        10: 1.05,  # October - Post monsoon
        11: 1.10,  # November - Winter + AQI
        12: 1.10,  # December - Winter
    }
    return seasonal_map.get(month, 1.10)

def get_claims_history_multiplier(worker_id: int, db: Session) -> float:
    """Claims history factor - rewards good behavior"""
    four_weeks_ago = datetime.now() - timedelta(weeks=4)
    claims_count = db.query(Claim).filter(
        Claim.worker_id == worker_id,
        Claim.created_at >= four_weeks_ago
    ).count()
    
    if claims_count == 0:
        return 0.85  # Loyalty reward
    elif claims_count == 1:
        return 1.00  # Normal
    elif claims_count == 2:
        return 1.10  # Slight increase
    elif claims_count >= 3:
        return 1.25  # Higher risk
    return 1.00

def get_working_hours_multiplier(hours_per_day: float, days_per_week: int) -> float:
    """Working hours factor"""
    weekly_hours = hours_per_day * days_per_week
    if weekly_hours < 20:
        return 0.70   # Part-time
    elif weekly_hours <= 40:
        return 1.00   # Regular
    elif weekly_hours <= 60:
        return 1.10   # Full-time
    else:
        return 1.20   # Overtime

def get_trust_discount(trust_score: int) -> float:
    """Trust score discount"""
    if trust_score >= 80:
        return -5.0   # Platinum: Rs 5 off
    elif trust_score >= 60:
        return -3.0   # Gold: Rs 3 off
    elif trust_score >= 40:
        return 0.0    # Silver: No discount
    elif trust_score >= 20:
        return 3.0    # Bronze: Rs 3 surcharge
    else:
        return 5.0    # Suspended: Rs 5 surcharge

def get_platform_surcharge(platform: str) -> float:
    """Platform-specific surcharge"""
    surcharges = {
        "zepto": 2.0,
        "blinkit": 2.0,
        "swiggy_instamart": 1.5,
        "swiggy": 1.0,
        "zomato": 1.0,
        "amazon": 0.5,
        "flipkart": 0.5,
        "dunzo": 1.5,
    }
    return surcharges.get(platform.lower(), 1.0)

def calculate_weekly_premium(worker: Worker, plan_type: str, db: Session) -> dict:
    """
    AI-POWERED DYNAMIC PREMIUM CALCULATOR
    
    Formula:
    Premium = (Base Rate × Zone Risk × Seasonal × Claims History × Working Hours)
              + Platform Surcharge + Trust Adjustment
    
    Clamped to: Rs 25 minimum, Rs 60 maximum
    """
    
    # Base rate depends on plan
    base_rates = {
        "basic": 25.0,
        "standard": 32.0,
        "pro": 40.0,
    }
    base_rate = base_rates.get(plan_type, 32.0)
    
    # Factor 1: Zone Risk
    zone_multiplier = get_zone_risk_multiplier(worker.risk_score)
    
    # Factor 2: Seasonal
    seasonal_multiplier = get_seasonal_multiplier()
    
    # Factor 3: Claims History
    claims_multiplier = get_claims_history_multiplier(worker.id, db)
    
    # Factor 4: Working Hours
    hours_multiplier = get_working_hours_multiplier(
        worker.working_hours_per_day,
        worker.working_days_per_week
    )
    
    # Factor 5: Trust Discount
    trust_adj = get_trust_discount(worker.trust_score)
    
    # Factor 6: Platform Surcharge
    platform_surcharge = get_platform_surcharge(worker.platform)
    
    # Calculate premium
    premium = (base_rate * zone_multiplier * seasonal_multiplier 
               * claims_multiplier * hours_multiplier)
    premium = premium + platform_surcharge + trust_adj
    
    # Clamp to min-max
    final_premium = round(max(25, min(60, premium)), 2)
    
    plan = PLAN_CONFIG[plan_type]
    
    breakdown = {
        "base_rate": base_rate,
        "zone_risk_multiplier": zone_multiplier,
        "seasonal_multiplier": seasonal_multiplier,
        "claims_history_multiplier": claims_multiplier,
        "working_hours_multiplier": hours_multiplier,
        "trust_discount": trust_adj,
        "platform_surcharge": platform_surcharge,
        "calculated_premium": round(premium, 2),
        "final_weekly_premium": final_premium,
        "plan_type": plan_type,
        "coverage_percent": plan["coverage_percent"],
        "hourly_payout": plan["hourly_payout"],
        "daily_max_payout": plan["daily_max_payout"],
        "weekly_max_payout": plan["weekly_max_payout"],
        "current_month": datetime.now().strftime("%B"),
        "current_season": get_current_season(),
        "worker_risk_level": get_risk_level(worker.risk_score),
        "worker_trust_tier": worker.trust_tier,
    }
    
    return breakdown

def get_current_season():
    month = datetime.now().month
    if month in [6, 7, 8, 9]:
        return "Monsoon"
    elif month in [3, 4, 5]:
        return "Summer"
    elif month in [11, 12, 1, 2]:
        return "Winter"
    else:
        return "Post-Monsoon"

def get_risk_level(risk_score):
    if risk_score <= 0.3:
        return "LOW"
    elif risk_score <= 0.6:
        return "MEDIUM"
    elif risk_score <= 0.8:
        return "HIGH"
    else:
        return "VERY HIGH"


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

@app.get("/", tags=["System"])
def root():
    return {
        "message": "GigShield API is running!",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "service": "GigShield Insurance Platform"
    }


# ============================================
# AADHAAR OTP ENDPOINTS
# ============================================

@app.post("/api/aadhaar/send-otp", response_model=AadhaarOTPResponse, tags=["Aadhaar Verification"])
def send_aadhaar_otp(request: AadhaarOTPRequest):
    aadhaar = request.aadhaar_number.strip()
    if len(aadhaar) != 12 or not aadhaar.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number. Must be 12 digits.")
    
    mock_otp = "123456"
    session_id = secrets.token_hex(16)
    otp_storage[session_id] = {
        "aadhaar": aadhaar, "otp": mock_otp,
        "created_at": datetime.now(), "verified": False
    }
    masked_phone = f"XXXXXX{aadhaar[-4:]}"
    
    return AadhaarOTPResponse(
        message=f"OTP sent to mobile number ending with {aadhaar[-4:]}",
        otp_sent=True, masked_phone=masked_phone, session_id=session_id
    )

@app.post("/api/aadhaar/verify-otp", response_model=AadhaarVerifyResponse, tags=["Aadhaar Verification"])
def verify_aadhaar_otp(request: AadhaarVerifyRequest):
    session = otp_storage.get(request.session_id)
    if not session:
        raise HTTPException(status_code=400, detail="Invalid or expired session.")
    if session["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP. Use 123456 for testing.")
    if session["aadhaar"] != request.aadhaar_number:
        raise HTTPException(status_code=400, detail="Aadhaar number mismatch.")
    
    session["verified"] = True
    aadhaar_hash = generate_aadhaar_hash(request.aadhaar_number)
    
    return AadhaarVerifyResponse(
        verified=True, message="Aadhaar verified successfully!",
        aadhaar_hash=aadhaar_hash
    )


# ============================================
# WORKER REGISTRATION ENDPOINTS
# ============================================

@app.post("/api/workers/register", response_model=WorkerResponse, tags=["Worker Registration"])
def register_worker(request: WorkerRegisterRequest, db: Session = Depends(get_db)):
    aadhaar = request.aadhaar_number.strip()
    if len(aadhaar) != 12 or not aadhaar.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number.")
    
    valid_platforms = ["zepto", "blinkit", "swiggy_instamart", "swiggy", "zomato", "amazon", "flipkart", "dunzo"]
    if request.platform.lower() not in valid_platforms:
        raise HTTPException(status_code=400, detail=f"Invalid platform. Use: {', '.join(valid_platforms)}")
    
    if request.monthly_earning <= 0:
        raise HTTPException(status_code=400, detail="Monthly earning must be greater than 0")
    if request.working_hours_per_day <= 0 or request.working_hours_per_day > 24:
        raise HTTPException(status_code=400, detail="Working hours must be 1-24")
    if request.working_days_per_week <= 0 or request.working_days_per_week > 7:
        raise HTTPException(status_code=400, detail="Working days must be 1-7")
    
    aadhaar_hash = generate_aadhaar_hash(aadhaar)
    
    if db.query(Worker).filter(Worker.aadhaar_hash == aadhaar_hash).first():
        raise HTTPException(status_code=409, detail="Aadhaar already registered. One Aadhaar = One Account.")
    if db.query(Worker).filter(Worker.phone == request.phone).first():
        raise HTTPException(status_code=409, detail="Phone number already registered.")
    
    token_id = generate_token_id(aadhaar_hash)
    hourly_rate = calculate_hourly_rate(request.monthly_earning, request.working_days_per_week, request.working_hours_per_day)
    risk_score = calculate_risk_score(request.pincode, request.zone, request.platform)
    
    new_worker = Worker(
        token_id=token_id, aadhaar_hash=aadhaar_hash, name=request.name,
        phone=request.phone, platform=request.platform.lower(),
        pincode=request.pincode, zone=request.zone,
        monthly_earning=request.monthly_earning,
        working_hours_per_day=request.working_hours_per_day,
        working_days_per_week=request.working_days_per_week,
        hourly_rate=hourly_rate, upi_id=request.upi_id,
        risk_score=risk_score, trust_score=50, trust_tier="SILVER", is_active=True
    )
    
    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)
    
    weekly_earning = round(request.monthly_earning / 4, 2)
    daily_earning = round(weekly_earning / request.working_days_per_week, 2)
    
    return WorkerResponse(
        id=new_worker.id, token_id=new_worker.token_id, name=new_worker.name,
        phone=new_worker.phone, platform=new_worker.platform,
        pincode=new_worker.pincode, zone=new_worker.zone,
        monthly_earning=new_worker.monthly_earning,
        weekly_earning=weekly_earning, daily_earning=daily_earning,
        hourly_rate=new_worker.hourly_rate,
        working_hours_per_day=new_worker.working_hours_per_day,
        working_days_per_week=new_worker.working_days_per_week,
        upi_id=new_worker.upi_id, risk_score=new_worker.risk_score,
        trust_score=new_worker.trust_score, trust_tier=new_worker.trust_tier,
        is_active=new_worker.is_active
    )

@app.get("/api/workers", tags=["Worker Management"])
def get_all_workers(db: Session = Depends(get_db)):
    workers = db.query(Worker).all()
    result = []
    for w in workers:
        weekly = round(w.monthly_earning / 4, 2)
        daily = round(weekly / w.working_days_per_week, 2)
        result.append({
            "id": w.id, "token_id": w.token_id, "name": w.name,
            "phone": w.phone, "platform": w.platform,
            "pincode": w.pincode, "zone": w.zone,
            "monthly_earning": w.monthly_earning,
            "weekly_earning": weekly, "daily_earning": daily,
            "hourly_rate": w.hourly_rate, "risk_score": w.risk_score,
            "trust_score": w.trust_score, "trust_tier": w.trust_tier,
            "is_active": w.is_active
        })
    return {"total_workers": len(result), "workers": result}

@app.get("/api/workers/{worker_id}", response_model=WorkerResponse, tags=["Worker Management"])
def get_worker_by_id(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")
    weekly = round(worker.monthly_earning / 4, 2)
    daily = round(weekly / worker.working_days_per_week, 2)
    return WorkerResponse(
        id=worker.id, token_id=worker.token_id, name=worker.name,
        phone=worker.phone, platform=worker.platform,
        pincode=worker.pincode, zone=worker.zone,
        monthly_earning=worker.monthly_earning,
        weekly_earning=weekly, daily_earning=daily,
        hourly_rate=worker.hourly_rate,
        working_hours_per_day=worker.working_hours_per_day,
        working_days_per_week=worker.working_days_per_week,
        upi_id=worker.upi_id, risk_score=worker.risk_score,
        trust_score=worker.trust_score, trust_tier=worker.trust_tier,
        is_active=worker.is_active
    )

@app.get("/api/workers/token/{token_id}", response_model=WorkerResponse, tags=["Worker Management"])
def get_worker_by_token(token_id: str, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.token_id == token_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found with this token.")
    weekly = round(worker.monthly_earning / 4, 2)
    daily = round(weekly / worker.working_days_per_week, 2)
    return WorkerResponse(
        id=worker.id, token_id=worker.token_id, name=worker.name,
        phone=worker.phone, platform=worker.platform,
        pincode=worker.pincode, zone=worker.zone,
        monthly_earning=worker.monthly_earning,
        weekly_earning=weekly, daily_earning=daily,
        hourly_rate=worker.hourly_rate,
        working_hours_per_day=worker.working_hours_per_day,
        working_days_per_week=worker.working_days_per_week,
        upi_id=worker.upi_id, risk_score=worker.risk_score,
        trust_score=worker.trust_score, trust_tier=worker.trust_tier,
        is_active=worker.is_active
    )


# ============================================
# PREMIUM CALCULATOR ENDPOINTS
# ============================================

@app.post("/api/premium/calculate", tags=["Premium Calculator"])
def calculate_premium(request: PremiumCalculateRequest, db: Session = Depends(get_db)):
    """
    AI-POWERED DYNAMIC PREMIUM CALCULATOR
    
    Calculates personalized weekly premium based on:
    1. Zone Risk Score (ML Model)
    2. Seasonal Factor (Monsoon = higher premium)
    3. Claims History (0 claims = discount)
    4. Working Hours (Full-time = slightly higher)
    5. Trust Score (Platinum = 10% discount)
    6. Platform Surcharge (Quick-commerce = +Rs 2)
    
    Returns detailed breakdown of each factor.
    """
    valid_plans = ["basic", "standard", "pro"]
    if request.plan_type.lower() not in valid_plans:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid plan. Must be one of: {', '.join(valid_plans)}"
        )
    
    worker = db.query(Worker).filter(Worker.id == request.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")
    
    breakdown = calculate_weekly_premium(worker, request.plan_type.lower(), db)
    
    return {
        "worker_id": worker.id,
        "worker_name": worker.name,
        "worker_token": worker.token_id,
        "zone": worker.zone,
        "pincode": worker.pincode,
        "platform": worker.platform,
        "premium_breakdown": breakdown,
        "message": f"Weekly premium for {request.plan_type.upper()} plan: Rs {breakdown['final_weekly_premium']}/week"
    }

@app.get("/api/premium/compare/{worker_id}", tags=["Premium Calculator"])
def compare_all_plans(worker_id: int, db: Session = Depends(get_db)):
    """
    Compare premium for all 3 plans (Basic, Standard, Pro)
    Helps worker choose the best plan for their needs
    """
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")
    
    plans = {}
    for plan_type in ["basic", "standard", "pro"]:
        breakdown = calculate_weekly_premium(worker, plan_type, db)
        plans[plan_type] = {
            "weekly_premium": breakdown["final_weekly_premium"],
            "coverage_percent": breakdown["coverage_percent"],
            "hourly_payout": breakdown["hourly_payout"],
            "daily_max_payout": breakdown["daily_max_payout"],
            "weekly_max_payout": breakdown["weekly_max_payout"],
        }
    
    weekly_earning = round(worker.monthly_earning / 4, 2)
    
    return {
        "worker_id": worker.id,
        "worker_name": worker.name,
        "worker_token": worker.token_id,
        "weekly_earning": weekly_earning,
        "hourly_rate": worker.hourly_rate,
        "risk_level": get_risk_level(worker.risk_score),
        "trust_tier": worker.trust_tier,
        "current_season": get_current_season(),
        "plans": plans,
        "recommendation": "standard",
        "recommendation_reason": "Best balance of affordable premium and good coverage for regular workers"
    }


# ============================================
# POLICY MANAGEMENT ENDPOINTS
# ============================================

@app.post("/api/policies/create", tags=["Policy Management"])
def create_policy(request: PolicyCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new weekly insurance policy for a worker.
    
    1. Calculates personalized premium
    2. Sets coverage based on plan type
    3. Policy starts NOW and ends in 7 days
    4. Auto-renewal is ON by default
    """
    valid_plans = ["basic", "standard", "pro"]
    if request.plan_type.lower() not in valid_plans:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Use: {', '.join(valid_plans)}")
    
    worker = db.query(Worker).filter(Worker.id == request.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")
    
    if not worker.is_active:
        raise HTTPException(status_code=400, detail="Worker account is suspended.")
    
    # Check if worker already has an active policy
    existing_policy = db.query(Policy).filter(
        Policy.worker_id == worker.id,
        Policy.status == "active"
    ).first()
    
    if existing_policy:
        raise HTTPException(
            status_code=409,
            detail=f"Worker already has an active {existing_policy.plan_type.upper()} policy (ID: {existing_policy.id}). Cancel or wait for it to expire."
        )
    
    # Calculate premium
    breakdown = calculate_weekly_premium(worker, request.plan_type.lower(), db)
    plan = PLAN_CONFIG[request.plan_type.lower()]
    
    # Create policy (starts now, ends in 7 days)
    start_date = datetime.now()
    end_date = start_date + timedelta(days=7)
    
    new_policy = Policy(
        worker_id=worker.id,
        plan_type=request.plan_type.lower(),
        weekly_premium=breakdown["final_weekly_premium"],
        coverage_percent=plan["coverage_percent"],
        hourly_payout=plan["hourly_payout"],
        daily_max_payout=plan["daily_max_payout"],
        weekly_max_payout=plan["weekly_max_payout"],
        start_date=start_date,
        end_date=end_date,
        status="active",
        auto_renew=request.auto_renew if request.auto_renew is not None else True,
        total_paid_out=0.0,
        premium_breakdown=breakdown,
    )
    
    db.add(new_policy)
    
    # Record premium payment
    premium_payment = Payment(
        worker_id=worker.id,
        payment_type="premium_collection",
        amount=breakdown["final_weekly_premium"],
        upi_id=worker.upi_id,
        transaction_id=f"PREM-{secrets.token_hex(8).upper()}",
        status="completed",
        gateway_response={"method": "UPI", "status": "success"},
    )
    
    db.add(premium_payment)
    db.commit()
    db.refresh(new_policy)
    
    days_remaining = (end_date - datetime.now()).days
    
    return {
        "message": f"Policy created successfully! {request.plan_type.upper()} plan activated.",
        "policy": {
            "id": new_policy.id,
            "worker_id": worker.id,
            "worker_name": worker.name,
            "worker_token": worker.token_id,
            "plan_type": new_policy.plan_type,
            "weekly_premium": new_policy.weekly_premium,
            "coverage_percent": new_policy.coverage_percent,
            "hourly_payout": new_policy.hourly_payout,
            "daily_max_payout": new_policy.daily_max_payout,
            "weekly_max_payout": new_policy.weekly_max_payout,
            "start_date": start_date.strftime("%Y-%m-%d %H:%M"),
            "end_date": end_date.strftime("%Y-%m-%d %H:%M"),
            "status": new_policy.status,
            "auto_renew": new_policy.auto_renew,
            "days_remaining": days_remaining,
            "premium_breakdown": breakdown,
        },
        "payment": {
            "amount": breakdown["final_weekly_premium"],
            "transaction_id": premium_payment.transaction_id,
            "status": "completed",
            "message": f"Rs {breakdown['final_weekly_premium']} deducted from UPI"
        }
    }


@app.get("/api/policies/worker/{worker_id}", tags=["Policy Management"])
def get_worker_policies(worker_id: int, db: Session = Depends(get_db)):
    """
    Get all policies for a worker (active + expired)
    """
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")
    
    policies = db.query(Policy).filter(Policy.worker_id == worker_id).all()
    
    result = []
    for p in policies:
        days_remaining = max(0, (p.end_date - datetime.now()).days)
        
        # Auto-expire if end_date passed
        if p.end_date < datetime.now() and p.status == "active":
            p.status = "expired"
            db.commit()
        
        result.append({
            "id": p.id,
            "plan_type": p.plan_type,
            "weekly_premium": p.weekly_premium,
            "coverage_percent": p.coverage_percent,
            "hourly_payout": p.hourly_payout,
            "daily_max_payout": p.daily_max_payout,
            "weekly_max_payout": p.weekly_max_payout,
            "start_date": p.start_date.strftime("%Y-%m-%d %H:%M"),
            "end_date": p.end_date.strftime("%Y-%m-%d %H:%M"),
            "status": p.status,
            "auto_renew": p.auto_renew,
            "total_paid_out": p.total_paid_out,
            "days_remaining": days_remaining,
        })
    
    return {
        "worker_id": worker_id,
        "worker_name": worker.name,
        "worker_token": worker.token_id,
        "total_policies": len(result),
        "policies": result
    }


@app.get("/api/policies/{policy_id}", tags=["Policy Management"])
def get_policy_details(policy_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific policy"""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
    
    worker = db.query(Worker).filter(Worker.id == policy.worker_id).first()
    days_remaining = max(0, (policy.end_date - datetime.now()).days)
    
    return {
        "id": policy.id,
        "worker_id": worker.id,
        "worker_name": worker.name,
        "worker_token": worker.token_id,
        "plan_type": policy.plan_type,
        "weekly_premium": policy.weekly_premium,
        "coverage_percent": policy.coverage_percent,
        "hourly_payout": policy.hourly_payout,
        "daily_max_payout": policy.daily_max_payout,
        "weekly_max_payout": policy.weekly_max_payout,
        "start_date": policy.start_date.strftime("%Y-%m-%d %H:%M"),
        "end_date": policy.end_date.strftime("%Y-%m-%d %H:%M"),
        "status": policy.status,
        "auto_renew": policy.auto_renew,
        "total_paid_out": policy.total_paid_out,
        "days_remaining": days_remaining,
        "premium_breakdown": policy.premium_breakdown,
    }


@app.post("/api/policies/renew", tags=["Policy Management"])
def renew_policy(request: PolicyRenewRequest, db: Session = Depends(get_db)):
    """
    Renew an expired or expiring policy for another week.
    Recalculates premium based on latest risk factors.
    """
    policy = db.query(Policy).filter(Policy.id == request.policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
    
    if policy.status == "active" and policy.end_date > datetime.now():
        raise HTTPException(status_code=400, detail="Policy is still active. Cannot renew yet.")
    
    worker = db.query(Worker).filter(Worker.id == policy.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")
    
    # Recalculate premium with latest factors
    breakdown = calculate_weekly_premium(worker, policy.plan_type, db)
    
    # Update policy
    policy.weekly_premium = breakdown["final_weekly_premium"]
    policy.start_date = datetime.now()
    policy.end_date = datetime.now() + timedelta(days=7)
    policy.status = "active"
    policy.premium_breakdown = breakdown
    
    # Record payment
    premium_payment = Payment(
        worker_id=worker.id,
        payment_type="premium_collection",
        amount=breakdown["final_weekly_premium"],
        upi_id=worker.upi_id,
        transaction_id=f"RENEW-{secrets.token_hex(8).upper()}",
        status="completed",
        gateway_response={"method": "UPI", "status": "success"},
    )
    
    db.add(premium_payment)
    db.commit()
    db.refresh(policy)
    
    return {
        "message": f"Policy renewed successfully for another week!",
        "policy_id": policy.id,
        "new_premium": breakdown["final_weekly_premium"],
        "new_start": policy.start_date.strftime("%Y-%m-%d %H:%M"),
        "new_end": policy.end_date.strftime("%Y-%m-%d %H:%M"),
        "status": "active",
        "premium_breakdown": breakdown,
        "payment_transaction_id": premium_payment.transaction_id,
    }


@app.put("/api/policies/{policy_id}/pause", tags=["Policy Management"])
def pause_policy(policy_id: int, db: Session = Depends(get_db)):
    """Pause an active policy (worker wants to take a break)"""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
    if policy.status != "active":
        raise HTTPException(status_code=400, detail=f"Policy is {policy.status}. Only active policies can be paused.")
    
    policy.status = "paused"
    db.commit()
    
    return {
        "message": "Policy paused successfully.",
        "policy_id": policy.id,
        "status": "paused",
        "note": "Coverage is suspended. No claims will be processed. Renew to reactivate."
    }


@app.put("/api/policies/{policy_id}/cancel", tags=["Policy Management"])
def cancel_policy(policy_id: int, db: Session = Depends(get_db)):
    """Cancel a policy permanently"""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
    if policy.status == "cancelled":
        raise HTTPException(status_code=400, detail="Policy is already cancelled.")
    
    policy.status = "cancelled"
    policy.auto_renew = False
    db.commit()
    
    return {
        "message": "Policy cancelled successfully.",
        "policy_id": policy.id,
        "status": "cancelled",
        "note": "No further claims will be processed. You can create a new policy anytime."
    }


@app.get("/api/policies", tags=["Policy Management"])
def get_all_policies(db: Session = Depends(get_db)):
    """Get all policies (Admin endpoint)"""
    policies = db.query(Policy).all()
    
    result = []
    for p in policies:
        worker = db.query(Worker).filter(Worker.id == p.worker_id).first()
        days_remaining = max(0, (p.end_date - datetime.now()).days)
        result.append({
            "id": p.id,
            "worker_name": worker.name if worker else "Unknown",
            "worker_token": worker.token_id if worker else "Unknown",
            "plan_type": p.plan_type,
            "weekly_premium": p.weekly_premium,
            "status": p.status,
            "start_date": p.start_date.strftime("%Y-%m-%d"),
            "end_date": p.end_date.strftime("%Y-%m-%d"),
            "days_remaining": days_remaining,
            "total_paid_out": p.total_paid_out,
        })
    
    total_premium = sum(p.weekly_premium for p in policies if p.status == "active")
    active_count = sum(1 for p in policies if p.status == "active")
    
    return {
        "total_policies": len(result),
        "active_policies": active_count,
        "total_weekly_premium_collection": round(total_premium, 2),
        "policies": result
    }