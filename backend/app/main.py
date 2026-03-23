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

import httpx


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


Base.metadata.create_all(bind=engine)


# ============================================
# PYDANTIC MODELS
# ============================================

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

class PremiumCalculateRequest(BaseModel):
    worker_id: int
    plan_type: str

class PolicyCreateRequest(BaseModel):
    worker_id: int
    plan_type: str
    auto_renew: Optional[bool] = True

class PolicyRenewRequest(BaseModel):
    policy_id: int

# --- NEW: Trigger & Claims Models ---
class SimulateDisruptionRequest(BaseModel):
    disruption_type: str   # HEAVY_RAIN, EXTREME_HEAT, SEVERE_AQI, FLOOD, CYCLONE, CURFEW, APP_DOWN
    pincode: str
    zone: str
    value: float           # actual value (e.g., rainfall 35mm/hr)
    duration_hours: float  # how long disruption lasted

class ManualTriggerRequest(BaseModel):
    trigger_type: str
    pincode: str
    zone: str
    description: str
    duration_hours: float


# ============================================
# HELPER FUNCTIONS
# ============================================

otp_storage = {}

def generate_aadhaar_hash(aadhaar_number):
    salt = "gigshield_salt_2026"
    return hashlib.sha256(f"{aadhaar_number}{salt}".encode()).hexdigest()

def generate_token_id(aadhaar_hash):
    return f"GS-{aadhaar_hash[:8].upper()}"

def calculate_hourly_rate(monthly_earning, working_days_per_week, working_hours_per_day):
    weekly = monthly_earning / 4
    daily = weekly / working_days_per_week
    return round(daily / working_hours_per_day, 2)

def calculate_risk_score(pincode, zone, platform):
    high_risk = {
        "400053": 0.72, "400050": 0.65, "110001": 0.60,
        "122001": 0.68, "560066": 0.55, "600004": 0.75,
        "400069": 0.70, "110085": 0.62, "560103": 0.58,
    }
    base = high_risk.get(pincode, 0.45)
    plat_risk = {"zepto": 0.05, "blinkit": 0.05, "swiggy_instamart": 0.03,
                 "swiggy": 0.02, "zomato": 0.02, "amazon": 0.01, "flipkart": 0.01}
    return round(min(1.0, base + plat_risk.get(platform.lower(), 0.03)), 2)

def get_trust_tier(trust_score):
    if trust_score >= 80: return "PLATINUM"
    elif trust_score >= 60: return "GOLD"
    elif trust_score >= 40: return "SILVER"
    elif trust_score >= 20: return "BRONZE"
    else: return "SUSPENDED"


# ============================================
# PREMIUM CALCULATOR
# ============================================

PLAN_CONFIG = {
    "basic": {"coverage_percent": 70, "hourly_payout": 40, "daily_max_payout": 300, "weekly_max_payout": 1500},
    "standard": {"coverage_percent": 80, "hourly_payout": 55, "daily_max_payout": 450, "weekly_max_payout": 2250},
    "pro": {"coverage_percent": 90, "hourly_payout": 75, "daily_max_payout": 600, "weekly_max_payout": 3000},
}

def get_zone_risk_multiplier(risk_score):
    if risk_score <= 0.2: return 0.85
    elif risk_score <= 0.4: return 1.00
    elif risk_score <= 0.6: return 1.15
    elif risk_score <= 0.8: return 1.30
    else: return 1.50

def get_seasonal_multiplier():
    month = datetime.now().month
    m = {1:1.10, 2:1.10, 3:1.15, 4:1.15, 5:1.20, 6:1.30, 7:1.40, 8:1.35, 9:1.25, 10:1.05, 11:1.10, 12:1.10}
    return m.get(month, 1.10)

def get_claims_history_multiplier(worker_id, db):
    four_weeks_ago = datetime.now() - timedelta(weeks=4)
    count = db.query(Claim).filter(Claim.worker_id == worker_id, Claim.created_at >= four_weeks_ago).count()
    if count == 0: return 0.85
    elif count == 1: return 1.00
    elif count == 2: return 1.10
    else: return 1.25

def get_working_hours_multiplier(hours, days):
    weekly = hours * days
    if weekly < 20: return 0.70
    elif weekly <= 40: return 1.00
    elif weekly <= 60: return 1.10
    else: return 1.20

def get_trust_discount(trust_score):
    if trust_score >= 80: return -5.0
    elif trust_score >= 60: return -3.0
    elif trust_score >= 40: return 0.0
    elif trust_score >= 20: return 3.0
    else: return 5.0

def get_platform_surcharge(platform):
    s = {"zepto": 2.0, "blinkit": 2.0, "swiggy_instamart": 1.5, "swiggy": 1.0, "zomato": 1.0, "amazon": 0.5, "flipkart": 0.5}
    return s.get(platform.lower(), 1.0)

def calculate_weekly_premium(worker, plan_type, db):
    base_rates = {"basic": 25.0, "standard": 32.0, "pro": 40.0}
    base = base_rates.get(plan_type, 32.0)
    zone_m = get_zone_risk_multiplier(worker.risk_score)
    season_m = get_seasonal_multiplier()
    claims_m = get_claims_history_multiplier(worker.id, db)
    hours_m = get_working_hours_multiplier(worker.working_hours_per_day, worker.working_days_per_week)
    trust_adj = get_trust_discount(worker.trust_score)
    plat_s = get_platform_surcharge(worker.platform)
    premium = (base * zone_m * season_m * claims_m * hours_m) + plat_s + trust_adj
    final = round(max(25, min(60, premium)), 2)
    plan = PLAN_CONFIG[plan_type]
    return {
        "base_rate": base, "zone_risk_multiplier": zone_m, "seasonal_multiplier": season_m,
        "claims_history_multiplier": claims_m, "working_hours_multiplier": hours_m,
        "trust_discount": trust_adj, "platform_surcharge": plat_s,
        "final_weekly_premium": final, "plan_type": plan_type,
        "coverage_percent": plan["coverage_percent"], "hourly_payout": plan["hourly_payout"],
        "daily_max_payout": plan["daily_max_payout"], "weekly_max_payout": plan["weekly_max_payout"],
        "current_season": get_current_season(), "worker_risk_level": get_risk_level(worker.risk_score),
    }

def get_current_season():
    m = datetime.now().month
    if m in [6,7,8,9]: return "Monsoon"
    elif m in [3,4,5]: return "Summer"
    elif m in [11,12,1,2]: return "Winter"
    else: return "Post-Monsoon"

def get_risk_level(risk_score):
    if risk_score <= 0.3: return "LOW"
    elif risk_score <= 0.6: return "MEDIUM"
    elif risk_score <= 0.8: return "HIGH"
    else: return "VERY HIGH"


# ============================================
# TRIGGER DEFINITIONS
# ============================================

TRIGGER_THRESHOLDS = {
    "HEAVY_RAIN": {"threshold": 15, "unit": "mm_per_hr", "category": "weather", "severity": "high"},
    "EXTREME_HEAT": {"threshold": 45, "unit": "celsius", "category": "weather", "severity": "high"},
    "SEVERE_AQI": {"threshold": 400, "unit": "aqi", "category": "weather", "severity": "high"},
    "FLOOD": {"threshold": 1, "unit": "alert_level", "category": "natural_disaster", "severity": "critical"},
    "CYCLONE": {"threshold": 1, "unit": "alert_level", "category": "natural_disaster", "severity": "critical"},
    "EARTHQUAKE": {"threshold": 4.0, "unit": "magnitude", "category": "natural_disaster", "severity": "critical"},
    "CURFEW": {"threshold": 1, "unit": "active", "category": "social", "severity": "critical"},
    "BANDH": {"threshold": 1, "unit": "active", "category": "social", "severity": "high"},
    "APP_DOWN": {"threshold": 60, "unit": "minutes", "category": "technical", "severity": "high"},
    "INTERNET_SHUTDOWN": {"threshold": 1, "unit": "active", "category": "technical", "severity": "critical"},
    "DENSE_FOG": {"threshold": 50, "unit": "visibility_meters", "category": "weather", "severity": "medium"},
    "DUST_STORM": {"threshold": 100, "unit": "visibility_meters", "category": "weather", "severity": "high"},
    "HIGH_WIND": {"threshold": 60, "unit": "kmph", "category": "weather", "severity": "medium"},
}

PRIORITY_MAP = {
    "critical": {"rank": "critical", "payout_minutes": 5, "coverage_factor": 1.0},
    "high": {"rank": "high", "payout_minutes": 15, "coverage_factor": 0.9},
    "medium": {"rank": "medium", "payout_minutes": 30, "coverage_factor": 0.8},
    "low": {"rank": "low", "payout_minutes": 60, "coverage_factor": 0.7},
}


# ============================================
# FRAUD DETECTION (Basic)
# ============================================

def calculate_basic_fraud_score(worker, trigger, db):
    """
    Basic fraud detection scoring.
    Returns score 0-100 (lower = more genuine)
    """
    fraud_score = 0
    details = {}

    # Check 1: Does worker pincode match trigger zone?
    if worker.pincode == trigger.affected_pincode:
        details["zone_match"] = "PASS - Worker pincode matches trigger zone"
    else:
        fraud_score += 20
        details["zone_match"] = "FLAG - Worker pincode does NOT match trigger zone"

    # Check 2: Is worker active?
    if worker.is_active:
        details["worker_active"] = "PASS - Worker account is active"
    else:
        fraud_score += 30
        details["worker_active"] = "FAIL - Worker account is not active"

    # Check 3: How many claims this week?
    one_week_ago = datetime.now() - timedelta(weeks=1)
    weekly_claims = db.query(Claim).filter(
        Claim.worker_id == worker.id,
        Claim.created_at >= one_week_ago
    ).count()
    
    if weekly_claims == 0:
        details["claim_frequency"] = "PASS - No claims this week"
    elif weekly_claims <= 2:
        fraud_score += 5
        details["claim_frequency"] = f"OK - {weekly_claims} claims this week"
    else:
        fraud_score += 15
        details["claim_frequency"] = f"FLAG - {weekly_claims} claims this week (high frequency)"

    # Check 4: Duplicate claim for same trigger?
    duplicate = db.query(Claim).filter(
        Claim.worker_id == worker.id,
        Claim.trigger_id == trigger.id
    ).first()
    
    if duplicate:
        fraud_score += 40
        details["duplicate_claim"] = "FAIL - Duplicate claim for same trigger"
    else:
        details["duplicate_claim"] = "PASS - No duplicate claim"

    # Check 5: Trust score factor
    if worker.trust_score >= 60:
        details["trust_check"] = f"PASS - Trust score {worker.trust_score} (trusted worker)"
    elif worker.trust_score >= 40:
        fraud_score += 5
        details["trust_check"] = f"OK - Trust score {worker.trust_score} (standard)"
    else:
        fraud_score += 15
        details["trust_check"] = f"FLAG - Trust score {worker.trust_score} (low trust)"

    # Check 6: Is trigger verified?
    if trigger.verified:
        details["trigger_verified"] = "PASS - Trigger is verified by external data"
    else:
        fraud_score += 20
        details["trigger_verified"] = "FLAG - Trigger not verified"

    # Clamp score
    fraud_score = min(100, max(0, fraud_score))
    
    # Decision
    if fraud_score <= 30:
        decision = "auto_approved"
        decision_reason = "Low fraud risk - Auto approved"
    elif fraud_score <= 70:
        decision = "manual_review"
        decision_reason = "Medium fraud risk - Needs manual review"
    else:
        decision = "rejected"
        decision_reason = "High fraud risk - Auto rejected"

    details["final_score"] = fraud_score
    details["decision"] = decision
    details["decision_reason"] = decision_reason

    return fraud_score, decision, details


def calculate_payout(worker, policy, trigger, db):
    """Calculate payout amount for a claim"""
    
    # Get hourly payout from plan
    hourly_payout = policy.hourly_payout
    coverage = policy.coverage_percent / 100
    duration = trigger.duration_hours
    
    # Base payout
    raw_payout = hourly_payout * duration * coverage
    
    # Apply priority factor
    severity = trigger.severity
    priority = PRIORITY_MAP.get(severity, PRIORITY_MAP["medium"])
    payout = raw_payout * priority["coverage_factor"]
    
    # Check daily max
    today_start = datetime.now().replace(hour=0, minute=0, second=0)
    today_claims = db.query(Claim).filter(
        Claim.worker_id == worker.id,
        Claim.created_at >= today_start,
        Claim.status.in_(["auto_approved", "approved"])
    ).all()
    
    today_paid = sum(c.payout_amount for c in today_claims)
    daily_remaining = policy.daily_max_payout - today_paid
    
    # Check weekly max
    week_start = datetime.now() - timedelta(days=datetime.now().weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0)
    week_claims = db.query(Claim).filter(
        Claim.worker_id == worker.id,
        Claim.created_at >= week_start,
        Claim.status.in_(["auto_approved", "approved"])
    ).all()
    
    week_paid = sum(c.payout_amount for c in week_claims)
    weekly_remaining = policy.weekly_max_payout - week_paid
    
    # Apply caps
    final_payout = min(payout, daily_remaining, weekly_remaining)
    final_payout = max(0, round(final_payout, 2))
    
    breakdown = {
        "hourly_payout": hourly_payout,
        "duration_hours": duration,
        "coverage_percent": policy.coverage_percent,
        "priority_factor": priority["coverage_factor"],
        "raw_payout": round(raw_payout, 2),
        "priority_adjusted": round(payout, 2),
        "today_already_paid": round(today_paid, 2),
        "daily_max": policy.daily_max_payout,
        "daily_remaining": round(daily_remaining, 2),
        "week_already_paid": round(week_paid, 2),
        "weekly_max": policy.weekly_max_payout,
        "weekly_remaining": round(weekly_remaining, 2),
        "final_payout": final_payout,
        "estimated_payout_time": f"{priority['payout_minutes']} minutes",
    }
    
    return final_payout, breakdown


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
# SYSTEM ENDPOINTS
# ============================================

@app.get("/", tags=["System"])
def root():
    return {"message": "GigShield API is running!", "version": "1.0.0", "status": "active"}

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "database": "connected", "service": "GigShield Insurance Platform"}


# ============================================
# AADHAAR ENDPOINTS
# ============================================

@app.post("/api/aadhaar/send-otp", response_model=AadhaarOTPResponse, tags=["Aadhaar Verification"])
def send_aadhaar_otp(request: AadhaarOTPRequest):
    aadhaar = request.aadhaar_number.strip()
    if len(aadhaar) != 12 or not aadhaar.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Aadhaar. Must be 12 digits.")
    session_id = secrets.token_hex(16)
    otp_storage[session_id] = {"aadhaar": aadhaar, "otp": "123456", "created_at": datetime.now(), "verified": False}
    return AadhaarOTPResponse(message=f"OTP sent to mobile ending with {aadhaar[-4:]}", otp_sent=True, masked_phone=f"XXXXXX{aadhaar[-4:]}", session_id=session_id)

@app.post("/api/aadhaar/verify-otp", response_model=AadhaarVerifyResponse, tags=["Aadhaar Verification"])
def verify_aadhaar_otp(request: AadhaarVerifyRequest):
    session = otp_storage.get(request.session_id)
    if not session: raise HTTPException(status_code=400, detail="Invalid session.")
    if session["otp"] != request.otp: raise HTTPException(status_code=400, detail="Invalid OTP. Use 123456.")
    if session["aadhaar"] != request.aadhaar_number: raise HTTPException(status_code=400, detail="Aadhaar mismatch.")
    session["verified"] = True
    return AadhaarVerifyResponse(verified=True, message="Aadhaar verified!", aadhaar_hash=generate_aadhaar_hash(request.aadhaar_number))


# ============================================
# WORKER ENDPOINTS
# ============================================

@app.post("/api/workers/register", response_model=WorkerResponse, tags=["Worker Registration"])
def register_worker(request: WorkerRegisterRequest, db: Session = Depends(get_db)):
    aadhaar = request.aadhaar_number.strip()
    if len(aadhaar) != 12 or not aadhaar.isdigit(): raise HTTPException(status_code=400, detail="Invalid Aadhaar.")
    valid_platforms = ["zepto","blinkit","swiggy_instamart","swiggy","zomato","amazon","flipkart","dunzo"]
    if request.platform.lower() not in valid_platforms: raise HTTPException(status_code=400, detail=f"Invalid platform. Use: {', '.join(valid_platforms)}")
    if request.monthly_earning <= 0: raise HTTPException(status_code=400, detail="Earning must be > 0")
    if request.working_hours_per_day <= 0 or request.working_hours_per_day > 24: raise HTTPException(status_code=400, detail="Hours must be 1-24")
    if request.working_days_per_week <= 0 or request.working_days_per_week > 7: raise HTTPException(status_code=400, detail="Days must be 1-7")
    aadhaar_hash = generate_aadhaar_hash(aadhaar)
    if db.query(Worker).filter(Worker.aadhaar_hash == aadhaar_hash).first(): raise HTTPException(status_code=409, detail="Aadhaar already registered.")
    if db.query(Worker).filter(Worker.phone == request.phone).first(): raise HTTPException(status_code=409, detail="Phone already registered.")
    token_id = generate_token_id(aadhaar_hash)
    hourly_rate = calculate_hourly_rate(request.monthly_earning, request.working_days_per_week, request.working_hours_per_day)
    risk_score = calculate_risk_score(request.pincode, request.zone, request.platform)
    w = Worker(token_id=token_id, aadhaar_hash=aadhaar_hash, name=request.name, phone=request.phone,
               platform=request.platform.lower(), pincode=request.pincode, zone=request.zone,
               monthly_earning=request.monthly_earning, working_hours_per_day=request.working_hours_per_day,
               working_days_per_week=request.working_days_per_week, hourly_rate=hourly_rate,
               upi_id=request.upi_id, risk_score=risk_score, trust_score=50, trust_tier="SILVER", is_active=True)
    db.add(w); db.commit(); db.refresh(w)
    weekly = round(request.monthly_earning/4, 2); daily = round(weekly/request.working_days_per_week, 2)
    return WorkerResponse(id=w.id, token_id=w.token_id, name=w.name, phone=w.phone, platform=w.platform,
                          pincode=w.pincode, zone=w.zone, monthly_earning=w.monthly_earning,
                          weekly_earning=weekly, daily_earning=daily, hourly_rate=w.hourly_rate,
                          working_hours_per_day=w.working_hours_per_day, working_days_per_week=w.working_days_per_week,
                          upi_id=w.upi_id, risk_score=w.risk_score, trust_score=w.trust_score,
                          trust_tier=w.trust_tier, is_active=w.is_active)

@app.get("/api/workers", tags=["Worker Management"])
def get_all_workers(db: Session = Depends(get_db)):
    workers = db.query(Worker).all()
    result = []
    for w in workers:
        weekly = round(w.monthly_earning/4, 2); daily = round(weekly/w.working_days_per_week, 2)
        result.append({"id": w.id, "token_id": w.token_id, "name": w.name, "phone": w.phone,
                       "platform": w.platform, "pincode": w.pincode, "zone": w.zone,
                       "monthly_earning": w.monthly_earning, "weekly_earning": weekly, "daily_earning": daily,
                       "hourly_rate": w.hourly_rate, "risk_score": w.risk_score,
                       "trust_score": w.trust_score, "trust_tier": w.trust_tier, "is_active": w.is_active})
    return {"total_workers": len(result), "workers": result}

@app.get("/api/workers/{worker_id}", response_model=WorkerResponse, tags=["Worker Management"])
def get_worker_by_id(worker_id: int, db: Session = Depends(get_db)):
    w = db.query(Worker).filter(Worker.id == worker_id).first()
    if not w: raise HTTPException(status_code=404, detail="Worker not found.")
    weekly = round(w.monthly_earning/4, 2); daily = round(weekly/w.working_days_per_week, 2)
    return WorkerResponse(id=w.id, token_id=w.token_id, name=w.name, phone=w.phone, platform=w.platform,
                          pincode=w.pincode, zone=w.zone, monthly_earning=w.monthly_earning,
                          weekly_earning=weekly, daily_earning=daily, hourly_rate=w.hourly_rate,
                          working_hours_per_day=w.working_hours_per_day, working_days_per_week=w.working_days_per_week,
                          upi_id=w.upi_id, risk_score=w.risk_score, trust_score=w.trust_score,
                          trust_tier=w.trust_tier, is_active=w.is_active)

@app.get("/api/workers/token/{token_id}", response_model=WorkerResponse, tags=["Worker Management"])
def get_worker_by_token(token_id: str, db: Session = Depends(get_db)):
    w = db.query(Worker).filter(Worker.token_id == token_id).first()
    if not w: raise HTTPException(status_code=404, detail="Worker not found.")
    weekly = round(w.monthly_earning/4, 2); daily = round(weekly/w.working_days_per_week, 2)
    return WorkerResponse(id=w.id, token_id=w.token_id, name=w.name, phone=w.phone, platform=w.platform,
                          pincode=w.pincode, zone=w.zone, monthly_earning=w.monthly_earning,
                          weekly_earning=weekly, daily_earning=daily, hourly_rate=w.hourly_rate,
                          working_hours_per_day=w.working_hours_per_day, working_days_per_week=w.working_days_per_week,
                          upi_id=w.upi_id, risk_score=w.risk_score, trust_score=w.trust_score,
                          trust_tier=w.trust_tier, is_active=w.is_active)


# ============================================
# PREMIUM ENDPOINTS
# ============================================

@app.post("/api/premium/calculate", tags=["Premium Calculator"])
def calculate_premium(request: PremiumCalculateRequest, db: Session = Depends(get_db)):
    if request.plan_type.lower() not in ["basic","standard","pro"]: raise HTTPException(status_code=400, detail="Invalid plan.")
    worker = db.query(Worker).filter(Worker.id == request.worker_id).first()
    if not worker: raise HTTPException(status_code=404, detail="Worker not found.")
    breakdown = calculate_weekly_premium(worker, request.plan_type.lower(), db)
    return {"worker_id": worker.id, "worker_name": worker.name, "worker_token": worker.token_id,
            "premium_breakdown": breakdown, "message": f"Weekly premium: Rs {breakdown['final_weekly_premium']}/week"}

@app.get("/api/premium/compare/{worker_id}", tags=["Premium Calculator"])
def compare_all_plans(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker: raise HTTPException(status_code=404, detail="Worker not found.")
    plans = {}
    for p in ["basic","standard","pro"]:
        b = calculate_weekly_premium(worker, p, db)
        plans[p] = {"weekly_premium": b["final_weekly_premium"], "coverage_percent": b["coverage_percent"],
                     "hourly_payout": b["hourly_payout"], "daily_max_payout": b["daily_max_payout"],
                     "weekly_max_payout": b["weekly_max_payout"]}
    return {"worker_id": worker.id, "worker_name": worker.name, "worker_token": worker.token_id,
            "weekly_earning": round(worker.monthly_earning/4, 2), "hourly_rate": worker.hourly_rate,
            "risk_level": get_risk_level(worker.risk_score), "trust_tier": worker.trust_tier,
            "current_season": get_current_season(), "plans": plans,
            "recommendation": "standard", "recommendation_reason": "Best balance of premium and coverage"}


# ============================================
# POLICY ENDPOINTS
# ============================================

@app.post("/api/policies/create", tags=["Policy Management"])
def create_policy(request: PolicyCreateRequest, db: Session = Depends(get_db)):
    if request.plan_type.lower() not in ["basic","standard","pro"]: raise HTTPException(status_code=400, detail="Invalid plan.")
    worker = db.query(Worker).filter(Worker.id == request.worker_id).first()
    if not worker: raise HTTPException(status_code=404, detail="Worker not found.")
    if not worker.is_active: raise HTTPException(status_code=400, detail="Worker account suspended.")
    existing = db.query(Policy).filter(Policy.worker_id == worker.id, Policy.status == "active").first()
    if existing: raise HTTPException(status_code=409, detail=f"Active {existing.plan_type.upper()} policy exists.")
    breakdown = calculate_weekly_premium(worker, request.plan_type.lower(), db)
    plan = PLAN_CONFIG[request.plan_type.lower()]
    start = datetime.now(); end = start + timedelta(days=7)
    pol = Policy(worker_id=worker.id, plan_type=request.plan_type.lower(), weekly_premium=breakdown["final_weekly_premium"],
                 coverage_percent=plan["coverage_percent"], hourly_payout=plan["hourly_payout"],
                 daily_max_payout=plan["daily_max_payout"], weekly_max_payout=plan["weekly_max_payout"],
                 start_date=start, end_date=end, status="active",
                 auto_renew=request.auto_renew if request.auto_renew is not None else True,
                 total_paid_out=0.0, premium_breakdown=breakdown)
    db.add(pol)
    pay = Payment(worker_id=worker.id, payment_type="premium_collection", amount=breakdown["final_weekly_premium"],
                  upi_id=worker.upi_id, transaction_id=f"PREM-{secrets.token_hex(8).upper()}", status="completed",
                  gateway_response={"method":"UPI","status":"success"})
    db.add(pay); db.commit(); db.refresh(pol)
    return {"message": f"{request.plan_type.upper()} policy created!", "policy": {
        "id": pol.id, "worker_name": worker.name, "worker_token": worker.token_id, "plan_type": pol.plan_type,
        "weekly_premium": pol.weekly_premium, "coverage_percent": pol.coverage_percent,
        "start_date": start.strftime("%Y-%m-%d %H:%M"), "end_date": end.strftime("%Y-%m-%d %H:%M"),
        "status": "active", "auto_renew": pol.auto_renew, "premium_breakdown": breakdown},
        "payment": {"amount": breakdown["final_weekly_premium"], "transaction_id": pay.transaction_id, "status": "completed"}}

@app.get("/api/policies/worker/{worker_id}", tags=["Policy Management"])
def get_worker_policies(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker: raise HTTPException(status_code=404, detail="Worker not found.")
    policies = db.query(Policy).filter(Policy.worker_id == worker_id).all()
    result = []
    for p in policies:
        days = max(0, (p.end_date - datetime.now()).days)
        if p.end_date < datetime.now() and p.status == "active": p.status = "expired"; db.commit()
        result.append({"id": p.id, "plan_type": p.plan_type, "weekly_premium": p.weekly_premium,
                       "coverage_percent": p.coverage_percent, "status": p.status,
                       "start_date": p.start_date.strftime("%Y-%m-%d"), "end_date": p.end_date.strftime("%Y-%m-%d"),
                       "days_remaining": days, "total_paid_out": p.total_paid_out})
    return {"worker_id": worker_id, "worker_name": worker.name, "total_policies": len(result), "policies": result}

@app.get("/api/policies/{policy_id}", tags=["Policy Management"])
def get_policy_details(policy_id: int, db: Session = Depends(get_db)):
    p = db.query(Policy).filter(Policy.id == policy_id).first()
    if not p: raise HTTPException(status_code=404, detail="Policy not found.")
    w = db.query(Worker).filter(Worker.id == p.worker_id).first()
    return {"id": p.id, "worker_name": w.name, "worker_token": w.token_id, "plan_type": p.plan_type,
            "weekly_premium": p.weekly_premium, "coverage_percent": p.coverage_percent,
            "hourly_payout": p.hourly_payout, "daily_max_payout": p.daily_max_payout,
            "weekly_max_payout": p.weekly_max_payout, "status": p.status, "auto_renew": p.auto_renew,
            "total_paid_out": p.total_paid_out, "premium_breakdown": p.premium_breakdown,
            "start_date": p.start_date.strftime("%Y-%m-%d %H:%M"), "end_date": p.end_date.strftime("%Y-%m-%d %H:%M"),
            "days_remaining": max(0, (p.end_date - datetime.now()).days)}

@app.post("/api/policies/renew", tags=["Policy Management"])
def renew_policy(request: PolicyRenewRequest, db: Session = Depends(get_db)):
    p = db.query(Policy).filter(Policy.id == request.policy_id).first()
    if not p: raise HTTPException(status_code=404, detail="Policy not found.")
    if p.status == "active" and p.end_date > datetime.now(): raise HTTPException(status_code=400, detail="Policy still active.")
    w = db.query(Worker).filter(Worker.id == p.worker_id).first()
    breakdown = calculate_weekly_premium(w, p.plan_type, db)
    p.weekly_premium = breakdown["final_weekly_premium"]; p.start_date = datetime.now()
    p.end_date = datetime.now() + timedelta(days=7); p.status = "active"; p.premium_breakdown = breakdown
    pay = Payment(worker_id=w.id, payment_type="premium_collection", amount=breakdown["final_weekly_premium"],
                  upi_id=w.upi_id, transaction_id=f"RENEW-{secrets.token_hex(8).upper()}", status="completed",
                  gateway_response={"method":"UPI","status":"success"})
    db.add(pay); db.commit()
    return {"message": "Policy renewed!", "new_premium": breakdown["final_weekly_premium"], "status": "active",
            "new_end": p.end_date.strftime("%Y-%m-%d %H:%M")}

@app.put("/api/policies/{policy_id}/pause", tags=["Policy Management"])
def pause_policy(policy_id: int, db: Session = Depends(get_db)):
    p = db.query(Policy).filter(Policy.id == policy_id).first()
    if not p: raise HTTPException(status_code=404, detail="Policy not found.")
    if p.status != "active": raise HTTPException(status_code=400, detail=f"Policy is {p.status}.")
    p.status = "paused"; db.commit()
    return {"message": "Policy paused.", "policy_id": p.id, "status": "paused"}

@app.put("/api/policies/{policy_id}/cancel", tags=["Policy Management"])
def cancel_policy(policy_id: int, db: Session = Depends(get_db)):
    p = db.query(Policy).filter(Policy.id == policy_id).first()
    if not p: raise HTTPException(status_code=404, detail="Policy not found.")
    p.status = "cancelled"; p.auto_renew = False; db.commit()
    return {"message": "Policy cancelled.", "policy_id": p.id, "status": "cancelled"}

@app.get("/api/policies", tags=["Policy Management"])
def get_all_policies(db: Session = Depends(get_db)):
    policies = db.query(Policy).all()
    result = []
    for p in policies:
        w = db.query(Worker).filter(Worker.id == p.worker_id).first()
        result.append({"id": p.id, "worker_name": w.name if w else "Unknown", "plan_type": p.plan_type,
                       "weekly_premium": p.weekly_premium, "status": p.status,
                       "start_date": p.start_date.strftime("%Y-%m-%d"), "end_date": p.end_date.strftime("%Y-%m-%d"),
                       "total_paid_out": p.total_paid_out})
    active = sum(1 for p in policies if p.status == "active")
    total_prem = sum(p.weekly_premium for p in policies if p.status == "active")
    return {"total_policies": len(result), "active_policies": active,
            "total_weekly_premium": round(total_prem, 2), "policies": result}


# ============================================
# TRIGGER ENDPOINTS (NEW!)
# ============================================

@app.post("/api/triggers/simulate", tags=["Triggers & Disruptions"])
def simulate_disruption(request: SimulateDisruptionRequest, db: Session = Depends(get_db)):
    """
    SIMULATE a disruption for testing.
    
    This is like pressing a button that says "baarish aa gayi!"
    System will:
    1. Create a trigger
    2. Find all workers in affected zone
    3. Auto-create claims for workers with active policies
    4. Run fraud detection
    5. Calculate payouts
    """
    
    trigger_type = request.disruption_type.upper()
    
    if trigger_type not in TRIGGER_THRESHOLDS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid disruption type. Use: {', '.join(TRIGGER_THRESHOLDS.keys())}"
        )
    
    trigger_config = TRIGGER_THRESHOLDS[trigger_type]
    
    # Check if value crosses threshold
    if trigger_type in ["DENSE_FOG", "DUST_STORM"]:
        # For fog/dust: lower visibility = worse (value should be LESS than threshold)
        if request.value > trigger_config["threshold"]:
            raise HTTPException(
                status_code=400,
                detail=f"Value {request.value} does not cross threshold. For {trigger_type}, visibility must be LESS than {trigger_config['threshold']}{trigger_config['unit']}"
            )
    else:
        if request.value < trigger_config["threshold"]:
            raise HTTPException(
                status_code=400,
                detail=f"Value {request.value} does not cross threshold {trigger_config['threshold']} {trigger_config['unit']}. Disruption not severe enough."
            )
    
    # Create trigger
    new_trigger = Trigger(
        type=trigger_type,
        category=trigger_config["category"],
        severity=trigger_config["severity"],
        value=request.value,
        threshold=trigger_config["threshold"],
        unit=trigger_config["unit"],
        affected_zone=request.zone,
        affected_pincode=request.pincode,
        duration_hours=request.duration_hours,
        source_api="simulation",
        verified=True,
        started_at=datetime.now(),
        ended_at=datetime.now() + timedelta(hours=request.duration_hours),
    )
    
    db.add(new_trigger)
    db.commit()
    db.refresh(new_trigger)
    
    # Find all workers in affected zone with active policies
    affected_workers = db.query(Worker).filter(
        Worker.pincode == request.pincode,
        Worker.is_active == True
    ).all()
    
    claims_created = []
    claims_rejected = []
    
    for worker in affected_workers:
        # Check if worker has active policy
        active_policy = db.query(Policy).filter(
            Policy.worker_id == worker.id,
            Policy.status == "active"
        ).first()
        
        if not active_policy:
            claims_rejected.append({
                "worker_name": worker.name,
                "worker_token": worker.token_id,
                "reason": "No active policy"
            })
            continue
        
        # Check for duplicate claim
        existing_claim = db.query(Claim).filter(
            Claim.worker_id == worker.id,
            Claim.trigger_id == new_trigger.id
        ).first()
        
        if existing_claim:
            claims_rejected.append({
                "worker_name": worker.name,
                "worker_token": worker.token_id,
                "reason": "Duplicate claim for same trigger"
            })
            continue
        
        # Run fraud detection
        fraud_score, decision, fraud_details = calculate_basic_fraud_score(worker, new_trigger, db)
        
        # Calculate payout
        payout_amount, payout_breakdown = calculate_payout(worker, active_policy, new_trigger, db)
        
        # Determine claim status based on fraud decision
        if decision == "auto_approved":
            claim_status = "auto_approved"
            payout_status = "processing"
        elif decision == "manual_review":
            claim_status = "manual_review"
            payout_status = "pending"
            payout_amount = round(payout_amount * 0.6, 2)  # 60% advance for yellow lane
        else:
            claim_status = "rejected"
            payout_status = "rejected"
            payout_amount = 0
        
        # Create claim
        claim_amount = round(new_trigger.duration_hours * worker.hourly_rate * (active_policy.coverage_percent / 100), 2)
        
        new_claim = Claim(
            worker_id=worker.id,
            policy_id=active_policy.id,
            trigger_id=new_trigger.id,
            claim_amount=claim_amount,
            disruption_hours=new_trigger.duration_hours,
            hourly_rate=worker.hourly_rate,
            coverage_percent=active_policy.coverage_percent,
            fraud_score=fraud_score,
            fraud_details=fraud_details,
            status=claim_status,
            payout_amount=payout_amount,
            payout_status=payout_status,
            payout_transaction_id=f"PAY-{secrets.token_hex(8).upper()}" if claim_status == "auto_approved" else None,
            priority_rank=PRIORITY_MAP.get(trigger_config["severity"], PRIORITY_MAP["medium"])["rank"],
            approved_at=datetime.now() if claim_status == "auto_approved" else None,
            paid_at=datetime.now() if claim_status == "auto_approved" else None,
        )
        
        db.add(new_claim)
        
        # If auto-approved, create payment and update policy
        if claim_status == "auto_approved":
            payment = Payment(
                claim_id=None,  # Will update after commit
                worker_id=worker.id,
                payment_type="claim_payout",
                amount=payout_amount,
                upi_id=worker.upi_id,
                transaction_id=new_claim.payout_transaction_id,
                status="completed",
                gateway_response={"method": "UPI", "status": "success", "payout_time": "15 minutes"},
            )
            db.add(payment)
            active_policy.total_paid_out += payout_amount
        
        elif claim_status == "manual_review":
            # Create advance payment (60%)
            payment = Payment(
                worker_id=worker.id,
                payment_type="advance_payout",
                amount=payout_amount,
                upi_id=worker.upi_id,
                transaction_id=f"ADV-{secrets.token_hex(8).upper()}",
                status="completed",
                gateway_response={"method": "UPI", "status": "success", "type": "60% advance"},
            )
            db.add(payment)
            active_policy.total_paid_out += payout_amount
        
        db.commit()
        db.refresh(new_claim)
        
        # Update payment with claim_id
        if claim_status in ["auto_approved", "manual_review"]:
            payment.claim_id = new_claim.id
            db.commit()
        
        claims_created.append({
            "claim_id": new_claim.id,
            "worker_name": worker.name,
            "worker_token": worker.token_id,
            "claim_amount": claim_amount,
            "payout_amount": payout_amount,
            "fraud_score": fraud_score,
            "status": claim_status,
            "payout_status": payout_status,
            "decision_reason": fraud_details.get("decision_reason", ""),
            "payout_breakdown": payout_breakdown,
        })
    
    return {
        "message": f"Disruption simulated: {trigger_type} in {request.zone}",
        "trigger": {
            "id": new_trigger.id,
            "type": trigger_type,
            "category": trigger_config["category"],
            "severity": trigger_config["severity"],
            "value": request.value,
            "threshold": trigger_config["threshold"],
            "unit": trigger_config["unit"],
            "zone": request.zone,
            "pincode": request.pincode,
            "duration_hours": request.duration_hours,
        },
        "impact": {
            "workers_in_zone": len(affected_workers),
            "claims_created": len(claims_created),
            "claims_rejected": len(claims_rejected),
            "total_payout": sum(c["payout_amount"] for c in claims_created),
        },
        "claims": claims_created,
        "rejected": claims_rejected,
    }


@app.post("/api/triggers/manual", tags=["Triggers & Disruptions"])
def create_manual_trigger(request: ManualTriggerRequest, db: Session = Depends(get_db)):
    """
    Create a manual trigger (Admin use — for curfew, bandh, etc.)
    Does NOT auto-create claims. Use /api/claims/process-trigger/{trigger_id} after.
    """
    trigger_type = request.trigger_type.upper()
    config = TRIGGER_THRESHOLDS.get(trigger_type, {"threshold": 1, "unit": "active", "category": "social", "severity": "high"})
    
    new_trigger = Trigger(
        type=trigger_type, category=config["category"], severity=config["severity"],
        value=1, threshold=config["threshold"], unit=config["unit"],
        affected_zone=request.zone, affected_pincode=request.pincode,
        duration_hours=request.duration_hours, source_api="manual_admin",
        verified=True, started_at=datetime.now(),
        ended_at=datetime.now() + timedelta(hours=request.duration_hours),
    )
    db.add(new_trigger); db.commit(); db.refresh(new_trigger)
    
    return {
        "message": f"Manual trigger created: {trigger_type}",
        "trigger_id": new_trigger.id,
        "description": request.description,
        "zone": request.zone,
        "next_step": f"Use POST /api/claims/process-trigger/{new_trigger.id} to auto-create claims"
    }


@app.get("/api/triggers", tags=["Triggers & Disruptions"])
def get_all_triggers(db: Session = Depends(get_db)):
    """Get all triggers (Admin endpoint)"""
    triggers = db.query(Trigger).order_by(Trigger.created_at.desc()).all()
    result = []
    for t in triggers:
        claims_count = db.query(Claim).filter(Claim.trigger_id == t.id).count()
        result.append({
            "id": t.id, "type": t.type, "category": t.category, "severity": t.severity,
            "value": t.value, "threshold": t.threshold, "unit": t.unit,
            "zone": t.affected_zone, "pincode": t.affected_pincode,
            "duration_hours": t.duration_hours, "source": t.source_api,
            "verified": t.verified, "claims_generated": claims_count,
            "started_at": t.started_at.strftime("%Y-%m-%d %H:%M") if t.started_at else None,
            "ended_at": t.ended_at.strftime("%Y-%m-%d %H:%M") if t.ended_at else None,
        })
    return {"total_triggers": len(result), "triggers": result}


@app.get("/api/triggers/types", tags=["Triggers & Disruptions"])
def get_trigger_types():
    """Get all supported trigger types and their thresholds"""
    return {
        "total_trigger_types": len(TRIGGER_THRESHOLDS),
        "triggers": TRIGGER_THRESHOLDS
    }


# ============================================
# CLAIMS ENDPOINTS (NEW!)
# ============================================

@app.get("/api/claims", tags=["Claims Management"])
def get_all_claims(db: Session = Depends(get_db)):
    """Get all claims (Admin endpoint)"""
    claims = db.query(Claim).order_by(Claim.created_at.desc()).all()
    result = []
    for c in claims:
        worker = db.query(Worker).filter(Worker.id == c.worker_id).first()
        trigger = db.query(Trigger).filter(Trigger.id == c.trigger_id).first()
        result.append({
            "id": c.id, "worker_name": worker.name if worker else "Unknown",
            "worker_token": worker.token_id if worker else "Unknown",
            "trigger_type": trigger.type if trigger else "Unknown",
            "trigger_severity": trigger.severity if trigger else "Unknown",
            "disruption_hours": c.disruption_hours, "claim_amount": c.claim_amount,
            "payout_amount": c.payout_amount, "fraud_score": c.fraud_score,
            "status": c.status, "payout_status": c.payout_status,
            "priority_rank": c.priority_rank,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else None,
        })
    total_payout = sum(c.payout_amount for c in claims if c.status in ["auto_approved", "approved"])
    pending = sum(1 for c in claims if c.status == "manual_review")
    return {"total_claims": len(result), "pending_review": pending,
            "total_payout": round(total_payout, 2), "claims": result}


@app.get("/api/claims/worker/{worker_id}", tags=["Claims Management"])
def get_worker_claims(worker_id: int, db: Session = Depends(get_db)):
    """Get all claims for a specific worker"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker: raise HTTPException(status_code=404, detail="Worker not found.")
    
    claims = db.query(Claim).filter(Claim.worker_id == worker_id).order_by(Claim.created_at.desc()).all()
    result = []
    for c in claims:
        trigger = db.query(Trigger).filter(Trigger.id == c.trigger_id).first()
        result.append({
            "id": c.id, "trigger_type": trigger.type if trigger else "Unknown",
            "trigger_zone": trigger.affected_zone if trigger else "Unknown",
            "disruption_hours": c.disruption_hours, "claim_amount": c.claim_amount,
            "payout_amount": c.payout_amount, "fraud_score": c.fraud_score,
            "status": c.status, "payout_status": c.payout_status,
            "transaction_id": c.payout_transaction_id,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else None,
        })
    
    total_earned = sum(c.payout_amount for c in claims if c.status in ["auto_approved", "approved"])
    return {"worker_id": worker_id, "worker_name": worker.name, "worker_token": worker.token_id,
            "total_claims": len(result), "total_earnings_protected": round(total_earned, 2), "claims": result}


@app.get("/api/claims/{claim_id}", tags=["Claims Management"])
def get_claim_details(claim_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific claim"""
    c = db.query(Claim).filter(Claim.id == claim_id).first()
    if not c: raise HTTPException(status_code=404, detail="Claim not found.")
    worker = db.query(Worker).filter(Worker.id == c.worker_id).first()
    trigger = db.query(Trigger).filter(Trigger.id == c.trigger_id).first()
    policy = db.query(Policy).filter(Policy.id == c.policy_id).first()
    
    return {
        "claim": {
            "id": c.id, "status": c.status, "priority_rank": c.priority_rank,
            "disruption_hours": c.disruption_hours, "claim_amount": c.claim_amount,
            "payout_amount": c.payout_amount, "fraud_score": c.fraud_score,
            "fraud_details": c.fraud_details, "payout_status": c.payout_status,
            "transaction_id": c.payout_transaction_id,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M") if c.created_at else None,
            "approved_at": c.approved_at.strftime("%Y-%m-%d %H:%M") if c.approved_at else None,
            "paid_at": c.paid_at.strftime("%Y-%m-%d %H:%M") if c.paid_at else None,
        },
        "worker": {"id": worker.id, "name": worker.name, "token": worker.token_id,
                    "phone": worker.phone, "zone": worker.zone} if worker else None,
        "trigger": {"id": trigger.id, "type": trigger.type, "severity": trigger.severity,
                     "value": trigger.value, "zone": trigger.affected_zone,
                     "duration": trigger.duration_hours} if trigger else None,
        "policy": {"id": policy.id, "plan_type": policy.plan_type,
                    "coverage_percent": policy.coverage_percent} if policy else None,
    }


@app.put("/api/claims/{claim_id}/approve", tags=["Claims Management"])
def approve_claim(claim_id: int, db: Session = Depends(get_db)):
    """Manually approve a claim (for manual_review claims)"""
    c = db.query(Claim).filter(Claim.id == claim_id).first()
    if not c: raise HTTPException(status_code=404, detail="Claim not found.")
    if c.status not in ["manual_review", "pending"]:
        raise HTTPException(status_code=400, detail=f"Claim is {c.status}. Only pending/review claims can be approved.")
    
    worker = db.query(Worker).filter(Worker.id == c.worker_id).first()
    policy = db.query(Policy).filter(Policy.id == c.policy_id).first()
    trigger = db.query(Trigger).filter(Trigger.id == c.trigger_id).first()
    
    # Calculate full payout
    full_payout, breakdown = calculate_payout(worker, policy, trigger, db)
    
    # If advance was already paid (60%), pay remaining 40%
    if c.status == "manual_review":
        advance_paid = c.payout_amount
        remaining = round(full_payout - advance_paid, 2)
        remaining = max(0, remaining)
        
        if remaining > 0:
            pay = Payment(worker_id=worker.id, payment_type="remaining_payout", amount=remaining,
                         upi_id=worker.upi_id, transaction_id=f"REM-{secrets.token_hex(8).upper()}",
                         status="completed", claim_id=c.id,
                         gateway_response={"method":"UPI","status":"success","type":"remaining 40%"})
            db.add(pay)
            policy.total_paid_out += remaining
        
        c.payout_amount = full_payout
    else:
        c.payout_amount = full_payout
        pay = Payment(worker_id=worker.id, payment_type="claim_payout", amount=full_payout,
                     upi_id=worker.upi_id, transaction_id=f"PAY-{secrets.token_hex(8).upper()}",
                     status="completed", claim_id=c.id,
                     gateway_response={"method":"UPI","status":"success"})
        db.add(pay)
        policy.total_paid_out += full_payout
    
    c.status = "approved"
    c.payout_status = "paid"
    c.approved_at = datetime.now()
    c.paid_at = datetime.now()
    c.payout_transaction_id = f"PAY-{secrets.token_hex(8).upper()}"
    
    # Increase trust score for approved claim
    worker.trust_score = min(100, worker.trust_score + 3)
    worker.trust_tier = get_trust_tier(worker.trust_score)
    
    db.commit()
    
    return {"message": "Claim approved and payout processed!", "claim_id": c.id,
            "final_payout": c.payout_amount, "worker_name": worker.name,
            "new_trust_score": worker.trust_score, "new_trust_tier": worker.trust_tier}


@app.put("/api/claims/{claim_id}/reject", tags=["Claims Management"])
def reject_claim(claim_id: int, db: Session = Depends(get_db)):
    """Manually reject a claim"""
    c = db.query(Claim).filter(Claim.id == claim_id).first()
    if not c: raise HTTPException(status_code=404, detail="Claim not found.")
    if c.status in ["auto_approved", "approved"]:
        raise HTTPException(status_code=400, detail="Cannot reject an already approved claim.")
    
    worker = db.query(Worker).filter(Worker.id == c.worker_id).first()
    
    c.status = "rejected"
    c.payout_status = "rejected"
    c.payout_amount = 0
    
    # Decrease trust score
    worker.trust_score = max(0, worker.trust_score - 10)
    worker.trust_tier = get_trust_tier(worker.trust_score)
    
    db.commit()
    
    return {"message": "Claim rejected.", "claim_id": c.id,
            "worker_name": worker.name, "new_trust_score": worker.trust_score,
            "note": "Worker can appeal via support if they believe this is an error."}


# ============================================
# DASHBOARD ENDPOINTS (NEW!)
# ============================================

@app.get("/api/dashboard/worker/{worker_id}", tags=["Dashboard"])
def worker_dashboard(worker_id: int, db: Session = Depends(get_db)):
    """Worker's personal dashboard"""
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker: raise HTTPException(status_code=404, detail="Worker not found.")
    
    active_policy = db.query(Policy).filter(Policy.worker_id == worker_id, Policy.status == "active").first()
    
    all_claims = db.query(Claim).filter(Claim.worker_id == worker_id).all()
    total_protected = sum(c.payout_amount for c in all_claims if c.status in ["auto_approved", "approved"])
    
    this_week = datetime.now() - timedelta(days=7)
    week_claims = db.query(Claim).filter(Claim.worker_id == worker_id, Claim.created_at >= this_week).all()
    
    return {
        "worker": {
            "name": worker.name, "token": worker.token_id,
            "trust_score": worker.trust_score, "trust_tier": worker.trust_tier,
            "zone": worker.zone, "platform": worker.platform,
        },
        "active_policy": {
            "plan_type": active_policy.plan_type if active_policy else None,
            "weekly_premium": active_policy.weekly_premium if active_policy else 0,
            "coverage_percent": active_policy.coverage_percent if active_policy else 0,
            "daily_max": active_policy.daily_max_payout if active_policy else 0,
            "days_remaining": max(0, (active_policy.end_date - datetime.now()).days) if active_policy else 0,
            "status": active_policy.status if active_policy else "none",
        },
        "stats": {
            "total_claims": len(all_claims),
            "total_earnings_protected": round(total_protected, 2),
            "this_week_claims": len(week_claims),
            "this_week_payout": round(sum(c.payout_amount for c in week_claims if c.status in ["auto_approved","approved"]), 2),
        },
        "recent_claims": [
            {"id": c.id, "type": db.query(Trigger).filter(Trigger.id == c.trigger_id).first().type if db.query(Trigger).filter(Trigger.id == c.trigger_id).first() else "Unknown",
             "hours": c.disruption_hours, "payout": c.payout_amount, "status": c.status,
             "date": c.created_at.strftime("%Y-%m-%d") if c.created_at else None}
            for c in sorted(all_claims, key=lambda x: x.created_at or datetime.min, reverse=True)[:5]
        ]
    }


@app.get("/api/dashboard/admin", tags=["Dashboard"])
def admin_dashboard(db: Session = Depends(get_db)):
    """Admin/Insurer dashboard with key metrics"""
    workers = db.query(Worker).all()
    policies = db.query(Policy).all()
    claims = db.query(Claim).all()
    triggers = db.query(Trigger).all()
    
    active_policies = [p for p in policies if p.status == "active"]
    approved_claims = [c for c in claims if c.status in ["auto_approved", "approved"]]
    pending_claims = [c for c in claims if c.status == "manual_review"]
    
    total_premium = sum(p.weekly_premium for p in active_policies)
    total_payout = sum(c.payout_amount for c in approved_claims)
    loss_ratio = round((total_payout / total_premium * 100), 1) if total_premium > 0 else 0
    
    return {
        "overview": {
            "total_workers": len(workers),
            "active_workers": sum(1 for w in workers if w.is_active),
            "total_policies": len(policies),
            "active_policies": len(active_policies),
            "total_claims": len(claims),
            "pending_review": len(pending_claims),
            "total_triggers": len(triggers),
        },
        "financials": {
            "weekly_premium_collection": round(total_premium, 2),
            "total_payouts": round(total_payout, 2),
            "loss_ratio": f"{loss_ratio}%",
            "loss_ratio_status": "Healthy" if loss_ratio < 70 else "Warning" if loss_ratio < 85 else "Critical",
        },
        "fraud_stats": {
            "auto_approved": sum(1 for c in claims if c.status == "auto_approved"),
            "manual_review": len(pending_claims),
            "rejected": sum(1 for c in claims if c.status == "rejected"),
            "avg_fraud_score": round(sum(c.fraud_score for c in claims) / len(claims), 1) if claims else 0,
        },
        "recent_triggers": [
            {"id": t.id, "type": t.type, "severity": t.severity, "zone": t.affected_zone,
             "date": t.created_at.strftime("%Y-%m-%d %H:%M") if t.created_at else None}
            for t in sorted(triggers, key=lambda x: x.created_at or datetime.min, reverse=True)[:5]
        ]
    }