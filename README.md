# GUIDEWIRED-DEVTRAILS_IT_WIZARDS


#  Complete README.md for GigShield

Below is the **full README.md** content — copy-paste it directly into your GitHub repository:

---

```markdown
# 🛡️ GigShield — AI-Powered Parametric Insurance for India's Gig Economy

> **"Your Earnings, Protected Every Week"**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)]()
[![Status](https://img.shields.io/badge/Status-In%20Development-orange)]()
[![Platform](https://img.shields.io/badge/Platform-Web%20PWA-green)]()

---

## Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Our Solution](#-our-solution---gigshield)
3. [Chosen Persona](#-chosen-persona)
4. [Key Features](#-key-features)
5. [Parametric Triggers](#-parametric-triggers---what-activates-a-claim)
6. [Unique Identity System — Aadhaar Token](#-unique-identity-system--aadhaar-based-token)
7. [Weekly Premium Model](#-weekly-premium-model)
8. [Payout Calculation System](#-payout-calculation-system)
9. [Risk Factor ML Model](#-risk-factor-ml-model--zone-based-risk-profiling)
10. [Fraud Detection System](#-intelligent-fraud-detection)
11. [Revenue Model](#-revenue-model--weekly-basis)
12. [System Architecture](#-system-architecture)
13. [Tech Stack](#-tech-stack)
14. [Application Workflow](#-application-workflow)
15. [User Personas & Scenarios](#-user-personas--scenarios)
16. [API Integrations](#-api-integrations)
17. [Database Schema](#-database-schema)
18. [Dashboard Design](#-dashboard-design)
19. [Development Roadmap](#-development-roadmap)
20. [How to Run](#-how-to-run)
21. [Team](#-team)

---

##  Problem Statement

India's **platform-based delivery partners** (Zomato, Swiggy, Zepto, Blinkit, Amazon, Dunzo) are the backbone of our digital economy. However, they face a **critical vulnerability**:

### The Core Problem:
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   External disruptions like extreme weather, pollution,      │
│   natural disasters, curfews, and platform outages cause     │
│   gig workers to lose 20-30% of their monthly earnings.     │
│                                                              │
│    No income protection exists                             │
│    No safety net for uncontrollable events                 │
│    Workers bear 100% financial loss                        │
│    No existing insurance product addresses this            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Real Impact:
| Scenario | Duration | Earning Loss |
|----------|----------|-------------|
| Heavy Rainfall in Mumbai | 6 hours | ₹400-600/day |
| Delhi AQI > 500 | Full day | ₹600-800/day |
| Curfew/Bandh | 1-2 days | ₹1,200-1,600 |
| Cyclone Warning | 2-3 days | ₹1,800-2,400 |
| App Server Crash | 3-4 hours | ₹200-400 |

> **A quick-commerce delivery partner earning ₹15,000-20,000/month can lose ₹3,000-6,000/month to these uncontrollable events.**

---

##  Our Solution - GigShield

**GigShield** is an **AI-powered parametric micro-insurance platform** that:

1.  **Monitors** real-time external disruptions (weather, AQI, curfews, app outages)
2.  **Automatically detects** when conditions make delivery work impossible
3. **Validates** claims using AI-driven fraud detection
4. **Instantly pays** lost wages — zero paperwork, zero waiting
5.  **Prices dynamically** on a weekly basis matching gig worker payout cycles

### What Makes It "Parametric"?
```
Traditional Insurance:          Parametric Insurance (GigShield):
─────────────────────          ──────────────────────────────────
Worker files claim              System detects disruption auto
Worker proves loss              Pre-defined trigger = auto claim  
Adjuster investigates           AI validates instantly
Wait 30-90 days                 Payout in 5-30 minutes
Manual process                  Fully automated
```

### What We Cover vs. What We DON'T:
```
   COVERED (Income Loss)           NOT COVERED
  ─────────────────────────         ──────────────────
  Lost wages due to weather         Health / Medical
  Lost income from curfew           Life Insurance
  Lost earnings from app crash      Accident coverage
  Lost work hours from pollution    Vehicle repair
  Lost deliveries from disasters    Personal reasons
  Lost income from road blocks      Phone damage
```

---

##  Chosen Persona

###  Quick-Commerce Delivery Partners (Zepto / Blinkit / Swiggy Instamart)

#### Why Quick-Commerce?

| Factor | Why It's the Best Persona |
|--------|--------------------------|
| **Time Sensitivity** | 10-min delivery windows → even 30 min rain = complete income loss |
| **Hyper-Local** | Operate in 2-3 km radius → micro-zone risk modeling is very feasible |
| **High Volume** | Many small orders → any disruption kills volume drastically |
| **Weather Dependency** | 100% outdoor work → most vulnerable to weather |
| **Digital Native** | Young, smartphone-savvy → mobile-first UX fits perfectly |
| **Growing Segment** | Fastest growing gig segment in India |

#### Persona Profile:
```
┌─────────────────────────────────────────┐
│          DELIVERY PARTNER PROFILE        │
│                                          │
│  👤 Name: Rahul Kumar                   │
│  📍 City: Mumbai (Andheri West)         │
│  🛵 Platform: Zepto                     │
│  ⏰ Working Hours: 10 hrs/day           │
│  📅 Working Days: 6 days/week           │
│  💰 Daily Earning: ₹700-900            │
│  💰 Weekly Earning: ₹4,200-5,400       │
│  💰 Monthly Earning: ₹18,000-22,000    │
│                                          │
│  RISK FACTORS:                          │
│  🌧️ Mumbai = High rainfall zone        │
│  🏭 Moderate AQI issues                │
│  🌊 Waterlogging prone areas           │
│  📱 Depends 100% on app + internet     │
└─────────────────────────────────────────┘
```

---

## ⭐ Key Features

### 1.  Unique Token Identity System (Aadhaar-Based)
- One worker = One Aadhaar = One unique token
- Prevents duplicate registrations & fraudulent multi-claims

### 2.  AI-Powered Dynamic Premium Calculation
- Weekly premium calculated using ML risk model
- Personalized based on zone, season, history

### 3.  Parametric Auto-Triggers
- Real-time monitoring of 6 disruption categories
- Zero-touch automatic claim initiation

### 4.  Intelligent Fraud Detection
- GPS validation, weather cross-check, behavioral analysis
- Anomaly detection using Isolation Forest algorithm

### 5.  Instant Payout System
- Auto-approved claims paid within 5-30 minutes
- UPI-based instant transfer

### 6.  Risk Factor ML Model
- Zone-based risk profiling using historical data
- Predictive forecasting for next week's disruptions

### 7.  Dual Dashboard
- Worker dashboard: Earnings protected, claims, coverage
- Admin dashboard: Loss ratios, fraud flags, analytics

---

##  Parametric Triggers - What Activates a Claim?

### Trigger Architecture:
```
                    ┌──────────────────┐
                    │  TRIGGER ENGINE   │
                    │  (Runs every 15m) │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                   │
    ┌─────▼──────┐   ┌──────▼───────┐   ┌──────▼───────┐
    │  WEATHER   │   │   SOCIAL     │   │  TECHNICAL   │
    │  TRIGGERS  │   │   TRIGGERS   │   │  TRIGGERS    │
    └─────┬──────┘   └──────┬───────┘   └──────┬───────┘
          │                  │                   │
    ┌─────▼──────────────────▼───────────────────▼──────┐
    │              TRIGGER VALIDATOR                      │
    │  • Is worker in affected zone?                     │
    │  • Does worker have active policy?                 │
    │  • Was worker scheduled to work?                   │
    │  • Fraud score check                               │
    └─────────────────────┬──────────────────────────────┘
                          │
                    ┌─────▼──────┐
                    │ AUTO-CLAIM │
                    │ + PAYOUT   │
                    └────────────┘
```

### Category 1: 🌧️ Weather & Environmental Triggers

| # | Trigger | Threshold | API Source | Severity |
|---|---------|-----------|------------|----------|
| 1 | **Heavy Rainfall** | > 15 mm/hr for 2+ hrs | OpenWeatherMap | 🔴 High |
| 2 | **Extreme Heat** | > 45°C for 3+ hrs | OpenWeatherMap | 🔴 High |
| 3 | **Severe AQI / Pollution** | AQI > 400 (Severe+) | AQICN API | 🔴 High |
| 4 | **Dense Fog** | Visibility < 50m for 3+ hrs | OpenWeatherMap | 🟡 Medium |
| 5 | **Dust Storm / Sandstorm** | Visibility < 100m + wind > 50km/hr | OpenWeatherMap | 🔴 High |
| 6 | **Cloudburst** | Rainfall > 50mm/hr (sudden) | OpenWeatherMap | 🔴 Critical |
| 7 | **Hailstorm** | Hail alert in zone | OpenWeatherMap | 🟡 Medium |
| 8 | **High Wind Speed** | Wind > 60 km/hr | OpenWeatherMap | 🟡 Medium |

### Category 2: 🌪️ Natural Disaster Triggers

| # | Trigger | Threshold | API Source | Severity |
|---|---------|-----------|------------|----------|
| 9 | **Flood / Waterlogging** | IMD Red/Orange alert | IMD API (Mock) | 🔴 Critical |
| 10 | **Cyclone** | IMD Cyclone Warning | IMD API (Mock) | 🔴 Critical |
| 11 | **Earthquake** | Magnitude > 4.0 in zone | USGS API | 🔴 Critical |
| 12 | **Landslide** | Landslide alert (hilly zones) | NDMA Mock API | 🔴 Critical |
| 13 | **Lightning Storm** | Severe thunderstorm alert | OpenWeatherMap | 🟡 Medium |
| 14 | **Cold Wave** | Temp < 4°C + cold wave alert | OpenWeatherMap | 🟡 Medium |

### Category 3: 🚫 Social & Administrative Triggers

| # | Trigger | Threshold | API Source | Severity |
|---|---------|-----------|------------|----------|
| 15 | **Curfew / Section 144** | Government notification | News API + Admin | 🔴 Critical |
| 16 | **Bandh / Strike** | Official bandh in city | News API + Admin | 🔴 High |
| 17 | **War / Border Conflict** | Military alert / restrictions | Admin Manual | 🔴 Critical |
| 18 | **Riot / Communal Tension** | Preventive restrictions | News API + Admin | 🔴 Critical |
| 19 | **VIP Movement** | Road closure > 3 hrs | Admin Manual | 🟡 Medium |
| 20 | **Religious Procession** | Major road block > 4 hrs | Event Calendar | 🟡 Medium |
| 21 | **Election Day** | Polling restrictions | Admin Manual | 🟡 Medium |

### Category 4: 📱 Platform & Technical Triggers

| # | Trigger | Threshold | API Source | Severity |
|---|---------|-----------|------------|----------|
| 22 | **App Server Down** | Platform down > 1 hour | Simulated Status API | 🔴 High |
| 23 | **Internet / Telecom Outage** | Network down > 2 hrs | DownDetector Mock | 🔴 High |
| 24 | **Payment System Failure** | UPI/Gateway down > 1 hr | Simulated | 🟡 Medium |
| 25 | **GPS System Malfunction** | GPS inaccurate in zone | Simulated | 🟡 Medium |
| 26 | **Govt Internet Shutdown** | Official internet ban | Admin Manual | 🔴 Critical |

### Trigger Decision Matrix:
```
DISRUPTION DETECTED
        │
        ▼
┌───────────────────┐     ┌──────────────┐
│ Duration > Min    │────▶│  REJECT      │
│ Threshold?   NO   │     │  (Too short) │
└───────────────────┘     └──────────────┘
        │ YES
        ▼
┌───────────────────┐     ┌──────────────┐
│ Worker in         │────▶│  REJECT      │
│ affected zone? NO │     │  (Wrong zone)│
└───────────────────┘     └──────────────┘
        │ YES
        ▼
┌───────────────────┐     ┌──────────────┐
│ Active policy?    │────▶│  REJECT      │
│              NO   │     │  (No policy) │
└───────────────────┘     └──────────────┘
        │ YES
        ▼
┌───────────────────┐     ┌──────────────┐
│ Was scheduled     │────▶│  REJECT      │
│ to work?    NO    │     │  (Off duty)  │
└───────────────────┘     └──────────────┘
        │ YES
        ▼
┌───────────────────┐
│  CLAIM APPROVED   │
│  → Process Payout │
└───────────────────┘
```

---

## 🔐 Unique Identity System — Aadhaar-Based Token

### Why Aadhaar?
```
┌───────────────────────────────────────────────────────┐
│                AADHAAR TOKEN SYSTEM                     │
│                                                         │
│  Problem: How to ensure ONE worker = ONE account?       │
│                                                         │
│  Solution: Aadhaar-based unique token generation        │
│                                                         │
│  ┌─────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Aadhaar │───▶│ Hash + Salt  │───▶│ Unique Token │  │
│  │ Number  │    │ (SHA-256)    │    │ GS-XXXXXX    │  │
│  └─────────┘    └──────────────┘    └──────────────┘  │
│                                                         │
│  Benefits:                                              │
│  ✅ One person cannot create multiple accounts          │
│  ✅ Prevents duplicate claim fraud                      │
│  ✅ KYC compliance built-in                             │
│  ✅ Privacy preserved (we store hash, not Aadhaar)      │
│  ✅ Links to bank account for instant UPI payout        │
│                                                         │
└───────────────────────────────────────────────────────┘
```

### Token Generation Flow:
```
Step 1: Worker enters Aadhaar number
            │
Step 2: OTP sent to Aadhaar-linked mobile
            │
Step 3: OTP verified → Aadhaar authenticated
            │
Step 4: System generates unique hash
        Token = SHA256(Aadhaar + Salt + Timestamp)
        Example: GS-7A3F9B2E
            │
Step 5: Token stored in DB (Aadhaar number is NOT stored)
            │
Step 6: Worker gets unique GigShield ID: GS-7A3F9B2E
            │
Step 7: All future policies & claims linked to this token
```

### Token Validation Rules:
```python
class AadhaarTokenSystem:
    def generate_token(self, aadhaar_number: str) -> str:
        """Generate unique token from Aadhaar"""
        # Check if Aadhaar already registered
        if self.is_duplicate(aadhaar_number):
            raise DuplicateRegistrationError("Aadhaar already registered")
        
        # Generate secure hash (we NEVER store raw Aadhaar)
        salt = generate_random_salt()
        token_hash = hashlib.sha256(
            f"{aadhaar_number}{salt}{timestamp}".encode()
        ).hexdigest()[:8].upper()
        
        unique_token = f"GS-{token_hash}"
        
        # Store only the hash, not Aadhaar
        db.store(token=unique_token, aadhaar_hash=hash(aadhaar_number))
        
        return unique_token
    
    def validate_token(self, token: str) -> bool:
        """Validate if token is legitimate"""
        return db.exists(token) and not db.is_blacklisted(token)
```

### Data Privacy:
```
┌─────────────────────────────────────────┐
│          WHAT WE STORE                   │
│                                          │
│  ✅ Unique Token (GS-XXXXXXXX)          │
│  ✅ Aadhaar Hash (irreversible)         │
│  ✅ Name (from Aadhaar verification)    │
│  ✅ Linked Phone Number                 │
│  ✅ Linked UPI ID for payouts           │
│                                          │
│          WHAT WE DON'T STORE             │
│                                          │
│   Raw Aadhaar Number                  │
│   Aadhaar biometrics                  │
│   Full address from Aadhaar           │
└─────────────────────────────────────────┘
```

---

## 💰 Weekly Premium Model

### Why Weekly?
```
Gig workers get paid weekly by platforms
    → Insurance premium should also be weekly
    → Lower ticket size = easier adoption
    → ₹35/week feels affordable vs ₹150/month
    → Matches cash flow cycle perfectly
```

### Premium Calculation Formula:

```
┌──────────────────────────────────────────────────────────────┐
│                WEEKLY PREMIUM FORMULA                          │
│                                                                │
│  Weekly Premium = Base Rate                                    │
│                   × Zone Risk Multiplier (ML Model)           │
│                   × Seasonal Factor                            │
│                   × Claims History Factor                      │
│                   × Working Hours Factor                       │
│                   + Platform Risk Surcharge                     │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ EXAMPLE CALCULATION:                                    │   │
│  │                                                         │   │
│  │ Base Rate:              ₹30                            │   │
│  │ Zone Risk (Mumbai):     × 1.3 (flood-prone)           │   │
│  │ Season (Monsoon Jul):   × 1.25                        │   │
│  │ Claims History (0):     × 0.9 (good behavior reward)  │   │
│  │ Hours (Full-time):      × 1.0                         │   │
│  │ Platform Surcharge:     + ₹2 (Zepto high-speed risk)  │   │
│  │                                                         │   │
│  │ Final: ₹30 × 1.3 × 1.25 × 0.9 × 1.0 + ₹2           │   │
│  │      = ₹43.88 ≈ ₹44/week                             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Premium Range: ₹25/week (minimum) to ₹60/week (maximum)    │
└──────────────────────────────────────────────────────────────┘
```

### Premium Factor Breakdown:

#### Factor 1: Zone Risk Multiplier (from ML Model)
```
Zone Risk Score (0.0 to 1.0) → Multiplier
─────────────────────────────────────────
0.0 - 0.2 (Low Risk)     → × 0.85
0.2 - 0.4 (Medium-Low)   → × 1.00
0.4 - 0.6 (Medium)       → × 1.15
0.6 - 0.8 (High)         → × 1.30
0.8 - 1.0 (Very High)    → × 1.50

Example:
  Mumbai Andheri (flood-prone): Risk Score 0.72 → × 1.30
  Bangalore Koramangala:        Risk Score 0.35 → × 1.00
  Delhi Connaught Place:        Risk Score 0.55 → × 1.15
```

#### Factor 2: Seasonal Multiplier
```
Month           Season          Multiplier
──────────────────────────────────────────
Jan-Feb         Winter/Fog      × 1.10
Mar-May         Summer/Heat     × 1.15
Jun-Sep         Monsoon         × 1.25 - 1.40
Oct-Nov         Post-Monsoon    × 1.05
Dec             Winter          × 1.10
```

#### Factor 3: Claims History Factor
```
Claims in Last 4 Weeks    Multiplier      Meaning
────────────────────────────────────────────────────
0 claims                  × 0.85          Loyalty reward
1 claim                   × 1.00          Normal
2 claims                  × 1.10          Slight increase
3+ claims                 × 1.25          Higher risk
Fraud flagged             × 1.50          Penalty
```

#### Factor 4: Working Hours Factor
```
Avg Weekly Hours    Category      Multiplier
──────────────────────────────────────────────
< 20 hrs           Part-time     × 0.70
20-40 hrs          Regular       × 1.00
40-60 hrs          Full-time     × 1.10
> 60 hrs           Overtime      × 1.20
```

### Premium Plan Tiers:

| Plan | Weekly Cost | Hourly Payout | Daily Max | Weekly Max | Best For |
|------|------------|---------------|-----------|------------|----------|
| 🥉 **Basic** | ₹25-35 | ₹40/hr | ₹300 | ₹1,500 | Part-time workers |
| 🥈 **Standard** | ₹35-48 | ₹55/hr | ₹450 | ₹2,250 | Regular workers |
| 🥇 **Pro** | ₹48-60 | ₹75/hr | ₹600 | ₹3,000 | Full-time workers |

### Dynamic Pricing Code Logic:
```python
def calculate_weekly_premium(worker: Worker) -> PremiumResult:
    """
    AI-driven weekly premium calculation
    """
    # Base rate
    base_rate = 30.0
    
    # Factor 1: Zone Risk (from ML model)
    zone_risk_score = ml_model.predict_zone_risk(worker.pincode)
    zone_multiplier = get_zone_multiplier(zone_risk_score)
    
    # Factor 2: Seasonal
    seasonal_multiplier = get_seasonal_multiplier(current_month)
    
    # Factor 3: Claims History
    claims_count = get_claims_last_4_weeks(worker.token_id)
    claims_multiplier = get_claims_multiplier(claims_count)
    
    # Factor 4: Working Hours
    avg_hours = get_avg_weekly_hours(worker.token_id)
    hours_multiplier = get_hours_multiplier(avg_hours)
    
    # Factor 5: Platform surcharge
    platform_surcharge = get_platform_surcharge(worker.platform)
    
    # Calculate final premium
    premium = (base_rate 
               * zone_multiplier 
               * seasonal_multiplier 
               * claims_multiplier 
               * hours_multiplier 
               + platform_surcharge)
    
    # Clamp to min-max range
    premium = max(25, min(60, round(premium)))
    
    return PremiumResult(
        weekly_premium=premium,
        breakdown={
            "base_rate": base_rate,
            "zone_risk": zone_multiplier,
            "seasonal": seasonal_multiplier,
            "claims_history": claims_multiplier,
            "working_hours": hours_multiplier,
            "platform_surcharge": platform_surcharge
        }
    )
```

---

## 💸 Payout Calculation System

### Income Calculation: Weekly → Daily → Hourly

```
┌────────────────────────────────────────────────────────────┐
│              INCOME BREAKDOWN CALCULATION                    │
│                                                              │
│   Worker's Weekly Earning Data (from onboarding):           │
│   ┌──────────────────────────────────────────────────────┐  │
│   │  Monthly Earning (Self-reported): ₹20,000            │  │
│   │  Working Days/Week:               6 days             │  │
│   │  Working Hours/Day:               10 hours           │  │
│   │                                                       │  │
│   │  CALCULATIONS:                                        │  │
│   │  Weekly Earning  = ₹20,000 ÷ 4 = ₹5,000/week       │  │
│   │  Daily Earning   = ₹5,000 ÷ 6  = ₹833/day          │  │
│   │  Hourly Earning  = ₹833 ÷ 10   = ₹83/hour          │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
│   This hourly rate is the BASIS for payout calculation.     │
└────────────────────────────────────────────────────────────┘
```

### Payout Formula:
```
PAYOUT = Disruption Hours × Hourly Earning × Coverage Percentage

Where:
  Disruption Hours  = Duration of verified disruption
  Hourly Earning    = Worker's calculated hourly income
  Coverage %        = Based on plan tier (70% / 80% / 90%)
```

### Payout Examples:

```
┌──────────────────────────────────────────────────────────────┐
│  SCENARIO 1: Heavy Rain for 4 Hours                          │
│                                                               │
│  Worker: Rahul (Zepto, Mumbai)                               │
│  Hourly Earning: ₹83/hr                                     │
│  Plan: Standard (80% coverage)                               │
│  Disruption Duration: 4 hours                                │
│                                                               │
│  Payout = 4 hrs × ₹83 × 80%                                │
│         = ₹265.60 ≈ ₹266                                    │
│                                                               │
│  ⚡ Paid to UPI in ~15 minutes                               │
├──────────────────────────────────────────────────────────────┤
│  SCENARIO 2: Full Day Curfew                                 │
│                                                               │
│  Worker: Priya (Blinkit, Delhi)                              │
│  Hourly Earning: ₹75/hr                                     │
│  Plan: Pro (90% coverage)                                    │
│  Disruption Duration: 10 hours (full shift)                  │
│                                                               │
│  Payout = 10 hrs × ₹75 × 90%                               │
│         = ₹675                                               │
│                                                               │
│  ⚡ Paid to UPI in ~10 minutes                               │
├──────────────────────────────────────────────────────────────┤
│  SCENARIO 3: App Down for 2 Hours                            │
│                                                               │
│  Worker: Amit (Zepto, Bangalore)                             │
│  Hourly Earning: ₹90/hr                                     │
│  Plan: Basic (70% coverage)                                  │
│  Disruption Duration: 2 hours                                │
│                                                               │
│  Payout = 2 hrs × ₹90 × 70%                                │
│         = ₹126                                               │
│                                                               │
│  ⚡ Paid to UPI in ~20 minutes                               │
└──────────────────────────────────────────────────────────────┘
```

### Payout Ranking System:
```
┌─────────────────────────────────────────────────────────────┐
│              CLAIM PRIORITY RANKING                          │
│                                                              │
│  Claims are processed in priority order:                     │
│                                                              │
│  RANK 1 🔴 CRITICAL (Processed First)                       │
│  ├── Natural Disasters (Flood, Cyclone, Earthquake)         │
│  ├── War / Military Conflict                                │
│  └── Full-day Curfew                                        │
│  → Payout: Within 5 minutes                                │
│  → Coverage: Up to 100% of daily max                        │
│                                                              │
│  RANK 2 🟠 HIGH (Processed Second)                          │
│  ├── Heavy Rainfall (> 15mm/hr for 3+ hrs)                 │
│  ├── Severe AQI (> 400)                                    │
│  ├── Govt Internet Shutdown                                 │
│  └── Bandh / Major Strike                                   │
│  → Payout: Within 15 minutes                               │
│  → Coverage: Up to 90% of daily max                         │
│                                                              │
│  RANK 3 🟡 MEDIUM (Processed Third)                         │
│  ├── Moderate Rain (> 15mm/hr for 2 hrs)                   │
│  ├── App Server Down (> 1 hr)                              │
│  ├── Road Blockage / Procession                            │
│  └── Dust Storm / Fog                                       │
│  → Payout: Within 30 minutes                               │
│  → Coverage: Up to 80% of daily max                         │
│                                                              │
│  RANK 4 🟢 LOW (Processed Last)                             │
│  ├── Hailstorm (short duration)                             │
│  ├── Payment Gateway Down                                   │
│  └── GPS Malfunction                                        │
│  → Payout: Within 1 hour                                   │
│  → Coverage: Up to 70% of daily max                         │
└─────────────────────────────────────────────────────────────┘
```

### Weekly Payout Cap:
```
┌────────────────────────────────────────┐
│  Plan       │ Daily Max │ Weekly Max  │
├─────────────┼───────────┼─────────────┤
│  Basic      │  ₹300     │  ₹1,500    │
│  Standard   │  ₹450     │  ₹2,250    │
│  Pro        │  ₹600     │  ₹3,000    │
└────────────────────────────────────────┘

Note: Once weekly max is reached, no more 
payouts until next week's policy renewal.
```

---

## 🧠 Risk Factor ML Model — Zone-Based Risk Profiling

### Model Overview:
```
┌─────────────────────────────────────────────────────────────┐
│                 ZONE RISK ML MODEL                           │
│                                                              │
│  Purpose: Predict risk score (0.0 - 1.0) for each          │
│           pincode/zone to determine premium pricing          │
│                                                              │
│  Algorithm: XGBoost Gradient Boosting                        │
│  Training Data: 2+ years of historical weather,             │
│                 flood records, AQI data, event data          │
│                                                              │
│  Output: Risk Score per Zone per Week                        │
│          0.0 = Very Safe Zone                                │
│          1.0 = Extremely Risky Zone                          │
└─────────────────────────────────────────────────────────────┘
```

### Input Features (What the Model Learns From):
```
FEATURE CATEGORIES:
│
├── 🌦️ WEATHER FEATURES
│   ├── Historical avg rainfall (monthly, by pincode)
│   ├── Max recorded rainfall events
│   ├── Average temperature patterns
│   ├── Fog frequency (winter months)
│   ├── Storm/cyclone frequency
│   └── Humidity patterns
│
├── 🏭 ENVIRONMENTAL FEATURES
│   ├── Historical AQI data (daily averages)
│   ├── Pollution source proximity
│   ├── Industrial area proximity
│   └── Green cover percentage
│
├── 🌊 GEOGRAPHIC FEATURES
│   ├── Elevation / sea level data
│   ├── Flood-prone zone classification
│   ├── Waterlogging history
│   ├── River/lake proximity
│   ├── Drainage infrastructure quality
│   └── Coastal proximity (cyclone risk)
│
├── 🏛️ SOCIAL FEATURES
│   ├── Historical bandh/strike frequency
│   ├── Protest-prone area score
│   ├── Festival density calendar
│   ├── Election schedule impact
│   └── VIP movement corridor
│
├── 📱 INFRASTRUCTURE FEATURES
│   ├── Internet reliability score
│   ├── Power grid stability
│   ├── Road quality index
│   └── Mobile network coverage
│
└── 📊 TEMPORAL FEATURES
    ├── Month of year
    ├── Week of month
    ├── Day of week patterns
    └── Season classification
```

### Model Architecture:
```
                ┌─────────────────┐
                │  Raw Data from  │
                │  Multiple APIs  │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │  Feature        │
                │  Engineering    │
                │  Pipeline       │
                └────────┬────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
   ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
   │  Weather   │  │  Social   │  │  Infra    │
   │  Features  │  │  Features │  │  Features │
   │  (15)      │  │  (8)      │  │  (6)      │
   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                ┌────────▼────────┐
                │  XGBoost Model  │
                │  (Gradient      │
                │   Boosting)     │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │  Risk Score     │
                │  0.0 ──── 1.0  │
                │  Safe    Risky  │
                └────────┬────────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
        ┌─────▼────┐ ┌──▼───┐ ┌───▼──────┐
        │ Premium  │ │ Risk │ │ Predictive│
        │ Pricing  │ │ Map  │ │ Alerts    │
        └──────────┘ └──────┘ └───────────┘
```

### Zone Risk Examples:
```
┌──────────────────────────────────────────────────────────┐
│              ZONE RISK SCORES (Examples)                   │
│                                                            │
│  MUMBAI:                                                   │
│  ├── Andheri West:    0.72 🔴 (flood-prone, heavy rain)  │
│  ├── Bandra:          0.65 🟠 (waterlogging)             │
│  ├── Powai:           0.45 🟡 (moderate risk)            │
│  └── Navi Mumbai:     0.38 🟢 (better drainage)         │
│                                                            │
│  DELHI:                                                    │
│  ├── Connaught Place: 0.60 🟠 (AQI + protest-prone)     │
│  ├── Dwarka:          0.50 🟡 (moderate)                 │
│  ├── Noida Sec-62:    0.42 🟢 (relatively stable)       │
│  └── Gurugram:        0.68 🔴 (waterlogging + AQI)      │
│                                                            │
│  BANGALORE:                                                │
│  ├── Whitefield:      0.55 🟡 (traffic + rain)          │
│  ├── Koramangala:     0.40 🟢 (moderate)                 │
│  └── Electronic City: 0.48 🟡 (flooding near lake)      │
└──────────────────────────────────────────────────────────┘
```

### Model Training Pipeline:
```python
class ZoneRiskModel:
    def __init__(self):
        self.model = XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            objective='reg:squarederror'
        )
    
    def prepare_features(self, pincode: str) -> pd.DataFrame:
        """Gather all features for a pincode"""
        features = {
            # Weather features
            'avg_monthly_rainfall': weather_api.get_avg_rainfall(pincode),
            'max_rainfall_events': weather_api.get_max_events(pincode),
            'avg_temperature': weather_api.get_avg_temp(pincode),
            'fog_frequency': weather_api.get_fog_freq(pincode),
            
            # AQI features
            'avg_aqi': aqi_api.get_avg_aqi(pincode),
            'days_above_400': aqi_api.get_severe_days(pincode),
            
            # Geographic features
            'elevation': geo_api.get_elevation(pincode),
            'flood_zone': geo_api.is_flood_zone(pincode),
            'river_proximity': geo_api.get_river_distance(pincode),
            
            # Social features
            'bandh_frequency': social_data.get_bandh_freq(pincode),
            'protest_score': social_data.get_protest_score(pincode),
            
            # Temporal features
            'month': current_month,
            'season': get_season(current_month),
            'week_of_month': get_week_of_month()
        }
        return pd.DataFrame([features])
    
    def predict_risk(self, pincode: str) -> float:
        """Predict risk score for a pincode"""
        features = self.prepare_features(pincode)
        risk_score = self.model.predict(features)[0]
        return max(0.0, min(1.0, risk_score))  # Clamp to 0-1
    
    def get_risk_heatmap(self, city: str) -> dict:
        """Generate risk heatmap for all zones in a city"""
        zones = get_all_pincodes(city)
        heatmap = {}
        for pincode in zones:
            heatmap[pincode] = {
                'risk_score': self.predict_risk(pincode),
                'risk_level': self.classify_risk(self.predict_risk(pincode)),
                'top_risks': self.get_top_risk_factors(pincode)
            }
        return heatmap
```

### Predictive Forecasting (Next Week):
```
┌─────────────────────────────────────────────────┐
│         NEXT WEEK RISK FORECAST                  │
│         Mumbai - Week of March 24                │
│                                                   │
│  📊 Predicted Disruption Probability:            │
│                                                   │
│  Heavy Rain:    ████████░░ 78%  ← Pre-monsoon   │
│  High AQI:      ██░░░░░░░░ 15%                  │
│  Flooding:      █████░░░░░ 45%                   │
│  Curfew/Bandh:  █░░░░░░░░░ 8%                   │
│  App Outage:    ██░░░░░░░░ 12%                   │
│                                                   │
│  💡 Recommendation for Insurer:                  │
│  "Set aside ₹2.8L reserve for Mumbai claims      │
│   Expected claim volume: ~340 workers"            │
│                                                   │
│  💡 Alert for Workers:                           │
│  "Rain likely Thu-Fri. Your coverage is active!" │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Intelligent Fraud Detection

### Multi-Layer Fraud Detection:
```
CLAIM SUBMITTED
      │
      ▼
┌──────────────────────────────────────────┐
│  LAYER 1: RULE-BASED CHECKS             │
│  ├── Is Aadhaar token valid?             │
│  ├── Is policy active and paid?          │
│  ├── Is within weekly claim limit?       │
│  ├── Is this a duplicate claim?          │
│  └── Is disruption duration reasonable?  │
└─────────────────┬────────────────────────┘
                  │ PASS
                  ▼
┌──────────────────────────────────────────┐
│  LAYER 2: LOCATION VALIDATION            │
│  ├── GPS location matches claimed zone?  │
│  ├── GPS movement pattern is natural?    │
│  ├── No GPS spoofing detected?           │
│  └── Worker actually in disrupted area?  │
└─────────────────┬────────────────────────┘
                  │ PASS
                  ▼
┌──────────────────────────────────────────┐
│  LAYER 3: WEATHER CROSS-VERIFICATION     │
│  ├── Weather API confirms disruption?    │
│  ├── AQI data matches claimed pollution? │
│  ├── Multiple data sources agree?        │
│  └── Historical pattern consistent?      │
└─────────────────┬────────────────────────┘
                  │ PASS
                  ▼
┌──────────────────────────────────────────┐
│  LAYER 4: AI ANOMALY DETECTION           │
│  ├── Isolation Forest anomaly score      │
│  ├── Claim frequency pattern analysis    │
│  ├── Network analysis (group fraud)      │
│  └── Behavioral deviation score          │
└─────────────────┬────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│  FINAL FRAUD SCORE: 0-100                │
│                                           │
│  0-30:   ✅ AUTO APPROVE → Instant Pay   │
│  31-70:  ⚠️ MANUAL REVIEW → Admin Queue │
│  71-100: ❌ REJECT → Notify Worker       │
└──────────────────────────────────────────┘
```

### Fraud Scenarios Detected:

| Fraud Type | How We Detect | Example |
|------------|--------------|---------|
| **GPS Spoofing** | Location jump analysis + device sensors | Worker claims to be in flood zone but GPS shows impossible movement |
| **Fake Weather Claim** | Cross-verify with 3+ weather APIs | Worker claims heavy rain but all APIs show clear weather |
| **Duplicate Claims** | Aadhaar token + event deduplication | Same worker, same event, multiple claim attempts |
| **Claim Frequency Abuse** | Statistical pattern analysis | Worker claims every single week — anomaly flagged |
| **Collusion / Group Fraud** | Network graph analysis | 5 workers from same location claiming simultaneously with identical patterns |
| **Identity Fraud** | Aadhaar token uniqueness check | One person creates multiple accounts |
| **Timing Manipulation** | Platform login time verification | Worker claims disruption but wasn't logged in during that time |

### Fraud Detection ML Model:
```python
class FraudDetectionEngine:
    def __init__(self):
        self.isolation_forest = IsolationForest(
            contamination=0.05,  # Expect 5% fraud rate
            random_state=42
        )
        self.rules_engine = RulesEngine()
    
    def calculate_fraud_score(self, claim: Claim) -> FraudResult:
        """Multi-layer fraud scoring"""
        scores = []
        
        # Layer 1: Rule-based
        rule_score = self.rules_engine.check(claim)
        scores.append(rule_score)
        
        # Layer 2: GPS Validation
        gps_score = self.validate_gps(
            claimed_location=claim.location,
            actual_gps_trail=claim.worker.gps_history,
            disruption_zone=claim.trigger.affected_zone
        )
        scores.append(gps_score)
        
        # Layer 3: Weather Cross-Check
        weather_score = self.cross_verify_weather(
            claimed_weather=claim.trigger.weather_condition,
            location=claim.location,
            timestamp=claim.timestamp
        )
        scores.append(weather_score)
        
        # Layer 4: ML Anomaly Detection
        features = self.extract_fraud_features(claim)
        anomaly_score = self.isolation_forest.decision_function([features])[0]
        ml_score = self.normalize_anomaly_score(anomaly_score)
        scores.append(ml_score)
        
        # Weighted final score
        final_score = (
            rule_score * 0.25 +
            gps_score * 0.30 +
            weather_score * 0.25 +
            ml_score * 0.20
        )
        
        return FraudResult(
            score=final_score,
            decision=self.get_decision(final_score),
            breakdown=scores
        )
```

---

## 📈 Revenue Model — Weekly Basis

### Revenue Streams:
```
┌──────────────────────────────────────────────────────────┐
│                 REVENUE MODEL                             │
│                                                           │
│  PRIMARY REVENUE: Weekly Premium Collection               │
│  ──────────────────────────────────────────               │
│  • Workers pay ₹25-60/week for coverage                  │
│  • Auto-deducted every Monday                            │
│  • Revenue scales with active worker count               │
│                                                           │
│  SECONDARY REVENUE (Future Scope):                       │
│  ──────────────────────────────────                      │
│  • Platform partnerships (Zepto/Swiggy subsidize premium)│
│  • Data insights sold to city planners                   │
│  • White-label for other gig platforms                   │
│  • Micro top-up sales (₹10 single-day coverage)         │
│                                                           │
│  COST STRUCTURE:                                         │
│  ──────────────                                          │
│  • Claims payouts (~60-65% of premium collected)         │
│  • Technology infrastructure (~10%)                      │
│  • API costs (~5%)                                       │
│  • Operations (~8%)                                      │
│  • Fraud losses (~2%)                                    │
│  • Profit margin: ~10-15%                               │
└──────────────────────────────────────────────────────────┘
```

### Unit Economics (Per City):
```
┌──────────────────────────────────────────────────────────┐
│        UNIT ECONOMICS — MUMBAI (Example)                  │
│                                                           │
│  Target quick-commerce workers in city:   50,000          │
│  Realistic conversion (Year 1):          15% = 7,500     │
│  Average weekly premium:                 ₹40             │
│                                                           │
│  ── WEEKLY ──                                            │
│  Premium Revenue:    7,500 × ₹40 = ₹3,00,000           │
│  Claims Payout:      ~62% = ₹1,86,000                  │
│  Operating Cost:     ~18% = ₹54,000                     │
│  Weekly Profit:      ₹60,000                            │
│                                                           │
│  ── MONTHLY ──                                           │
│  Revenue:            ₹12,00,000                         │
│  Claims:             ₹7,44,000                          │
│  Costs:              ₹2,16,000                          │
│  Monthly Profit:     ₹2,40,000                          │
│                                                           │
│  ── ANNUAL ──                                            │
│  Revenue:            ₹1.44 Crore                        │
│  Profit:             ₹28.8 Lakh                         │
│  Loss Ratio:         62% (healthy)                      │
│                                                           │
│  ── SCALE (10 Cities) ──                                 │
│  Annual Revenue:     ₹14.4 Crore                        │
│  Annual Profit:      ₹2.88 Crore                        │
└──────────────────────────────────────────────────────────┘
```

### Premium Collection Flow:
```
Every Monday 6:00 AM:
┌──────────────┐    ┌───────────────────┐    ┌─────────────┐
│ Worker's UPI │───▶│ Auto-Debit ₹40   │───▶│ Policy      │
│ / Wallet     │    │ (Razorpay/UPI)    │    │ Renewed for │
│              │    │                    │    │ this week   │
└──────────────┘    └───────────────────┘    └─────────────┘
                             │
                    ┌────────▼────────┐
                    │  Payment Failed? │
                    │  → 24hr grace    │
                    │  → SMS reminder  │
                    │  → Policy paused │
                    └─────────────────┘
```

---

## 🏗️ System Architecture

### High-Level Architecture:
```
┌──────────────────────────────────────────────────────────────────────┐
│                        GIGSHIELD PLATFORM                             │
│                                                                       │
│  ┌───────────┐                    ┌──────────────────────────────┐   │
│  │           │                    │      API GATEWAY             │   │
│  │  Worker   │◄──── HTTPS ──────▶│      (Express.js/FastAPI)    │   │
│  │  PWA /    │                    │      • Rate Limiting         │   │
│  │  Mobile   │                    │      • JWT Auth              │   │
│  │           │                    │      • Request Routing       │   │
│  └───────────┘                    └──────────┬───────────────────┘   │
│                                              │                       │
│  ┌───────────┐                    ┌──────────▼───────────────────┐   │
│  │           │                    │      MICROSERVICES            │   │
│  │  Admin    │◄──── HTTPS ──────▶│                               │   │
│  │  Dashboard│                    │  ┌─────────────────────────┐ │   │
│  │           │                    │  │  Auth Service           │ │   │
│  └───────────┘                    │  │  • Aadhaar OTP          │ │   │
│                                   │  │  • Token Generation     │ │   │
│                                   │  │  • JWT Management       │ │   │
│                                   │  └─────────────────────────┘ │   │
│                                   │                               │   │
│                                   │  ┌─────────────────────────┐ │   │
│                                   │  │  Policy Service         │ │   │
│                                   │  │  • Plan Management      │ │   │
│                                   │  │  • Premium Calculation  │ │   │
│                                   │  │  • Auto-Renewal         │ │   │
│                                   │  └─────────────────────────┘ │   │
│                                   │                               │   │
│                                   │  ┌─────────────────────────┐ │   │
│                                   │  │  Claims Engine          │ │   │
│                                   │  │  • Trigger Detection    │ │   │
│                                   │  │  • Auto-Claim Creation  │ │   │
│                                   │  │  • Fraud Scoring        │ │   │
│                                   │  │  • Payout Processing    │ │   │
│                                   │  └─────────────────────────┘ │   │
│                                   │                               │   │
│                                   │  ┌─────────────────────────┐ │   │
│                                   │  │  ML Service             │ │   │
│                                   │  │  • Risk Score Model     │ │   │
│                                   │  │  • Premium Model        │ │   │
│                                   │  │  • Fraud Model          │ │   │
│                                   │  │  • Forecasting Model    │ │   │
│                                   │  └─────────────────────────┘ │   │
│                                   │                               │   │
│                                   │  ┌─────────────────────────┐ │   │
│                                   │  │  Notification Service   │ │   │
│                                   │  │  • SMS Alerts           │ │   │
│                                   │  │  • Push Notifications   │ │   │
│                                   │  │  • WhatsApp (Optional)  │ │   │
│                                   │  └─────────────────────────┘ │   │
│                                   └──────────────────────────────┘   │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    DATA LAYER                                   │  │
│  │  ┌──────────────┐  ┌──────────┐  ┌──────────────────────────┐ │  │
│  │  │ PostgreSQL   │  │  Redis   │  │  ML Model Store          │ │  │
│  │  │ (Primary DB) │  │  (Cache) │  │  (Pickle/ONNX files)     │ │  │
│  │  └──────────────┘  └──────────┘  └──────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                 EXTERNAL INTEGRATIONS                           │  │
│  │  ┌────────────┐ ┌──────────┐ ┌────────┐ ┌──────────────────┐ │  │
│  │  │ Weather    │ │ AQI      │ │ News   │ │ Payment Gateway  │ │  │
│  │  │ API        │ │ API      │ │ API    │ │ (Razorpay Test)  │ │  │
│  │  │(OpenWeather│ │(AQICN)   │ │(NewsAPI│ │                  │ │  │
│  │  │ Map)       │ │          │ │/GNews) │ │                  │ │  │
│  │  └────────────┘ └──────────┘ └────────┘ └──────────────────┘ │  │
│  │  ┌────────────┐ ┌──────────┐ ┌────────────────────────────┐  │  │
│  │  │ Platform   │ │ Map      │ │ Aadhaar Verification       │  │  │
│  │  │ Simulator  │ │ Service  │ │ (Mock/Sandbox)             │  │  │
│  │  │ (Mock)     │ │(Leaflet) │ │                            │  │  │
│  │  └────────────┘ └──────────┘ └────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                 BACKGROUND JOBS                                 │  │
│  │  ┌────────────────┐ ┌──────────────┐ ┌──────────────────────┐ │  │
│  │  │ Trigger Monitor│ │ Premium Auto │ │ Weekly Batch         │ │  │
│  │  │ (Every 15 min) │ │ Renewal (Mon)│ │ Analytics Generator  │ │  │
│  │  └────────────────┘ └──────────────┘ └──────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram:
```
┌──────────┐     ┌────────────┐     ┌──────────────┐     ┌───────────┐
│ External │────▶│  Trigger   │────▶│  Claims      │────▶│  Payout   │
│ APIs     │     │  Monitor   │     │  Engine      │     │  Service  │
│(Weather, │     │  Service   │     │              │     │           │
│ AQI,News)│     │            │     │  ┌────────┐  │     │  ┌─────┐  │
└──────────┘     │ Checks:    │     │  │ Fraud  │  │     │  │ UPI │  │
                 │ • Threshold│     │  │ Check  │  │     │  │ Pay │  │
                 │ • Zone     │     │  └────────┘  │     │  └─────┘  │
                 │ • Duration │     └──────────────┘     └───────────┘
                 └────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why Chosen |
|-------|-----------|------------|
| **Frontend** | React.js + Tailwind CSS (PWA) | Fast, responsive, works on any phone as PWA |
| **Backend** | Python FastAPI | Fastest Python framework, perfect for ML integration |
| **Database** | PostgreSQL | Reliable, ACID-compliant, great for financial data |
| **Cache** | Redis | Fast trigger state caching, session management |
| **ML/AI** | scikit-learn, XGBoost, Pandas | Industry-standard ML libraries, proven & reliable |
| **Weather API** | OpenWeatherMap (Free Tier) | Reliable, good free tier, global coverage |
| **AQI API** | AQICN.org API | Best free AQI data for India |
| **News API** | NewsAPI / GNews | Detect bandh/curfew/strike news |
| **Maps** | Leaflet.js + OpenStreetMap | Free, open-source mapping solution |
| **Payment** | Razorpay Test Mode | Best Indian payment gateway, good sandbox |
| **Auth** | JWT + OTP (Mock Aadhaar) | Secure, stateless authentication |
| **Hosting** | Vercel (FE) + Railway (BE) | Free tier, easy deployment |
| **Charts** | Recharts / Chart.js | Clean analytics dashboards |
| **Notifications** | Firebase Cloud Messaging | Free push notification service |
| **Version Control** | Git + GitHub | Standard, required by competition |

### Folder Structure:
```
gigshield/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── onboarding/
│   │   │   │   ├── AadhaarVerification.jsx
│   │   │   │   ├── PlatformSelection.jsx
│   │   │   │   ├── ZoneSelection.jsx
│   │   │   │   └── PlanSelection.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── WorkerDashboard.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ClaimsHistory.jsx
│   │   │   │   └── RiskHeatmap.jsx
│   │   │   ├── policy/
│   │   │   │   ├── PolicyView.jsx
│   │   │   │   ├── PremiumBreakdown.jsx
│   │   │   │   └── RenewalManager.jsx
│   │   │   ├── claims/
│   │   │   │   ├── ActiveClaims.jsx
│   │   │   │   ├── ClaimDetails.jsx
│   │   │   │   └── PayoutStatus.jsx
│   │   │   └── common/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Footer.jsx
│   │   │       └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── context/
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── worker.py
│   │   │   ├── policy.py
│   │   │   ├── claim.py
│   │   │   └── trigger.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── policy.py
│   │   │   ├── claims.py
│   │   │   ├── premium.py
│   │   │   └── dashboard.py
│   │   ├── services/
│   │   │   ├── aadhaar_service.py
│   │   │   ├── premium_calculator.py
│   │   │   ├── trigger_monitor.py
│   │   │   ├── claims_engine.py
│   │   │   ├── fraud_detector.py
│   │   │   ├── payout_service.py
│   │   │   └── notification_service.py
│   │   ├── ml/
│   │   │   ├── risk_model.py
│   │   │   ├── premium_model.py
│   │   │   ├── fraud_model.py
│   │   │   ├── forecasting_model.py
│   │   │   └── trained_models/
│   │   │       ├── zone_risk_xgb.pkl
│   │   │       ├── fraud_isolation_forest.pkl
│   │   │       └── premium_predictor.pkl
│   │   ├── external_apis/
│   │   │   ├── weather_api.py
│   │   │   ├── aqi_api.py
│   │   │   ├── news_api.py
│   │   │   └── payment_gateway.py
│   │   └── database/
│   │       ├── connection.py
│   │       ├── migrations/
│   │       └── seeds/
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml_notebooks/
│   ├── 01_data_exploration.ipynb
│   ├── 02_risk_model_training.ipynb
│   ├── 03_fraud_model_training.ipynb
│   └── 04_premium_model_training.ipynb
│
├── docs/
│   ├── architecture.md
│   ├── api_documentation.md
│   └── pitch_deck.pdf
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md          ← YOU ARE HERE
```

---

## 🔄 Application Workflow

### Complete User Journey:
```
                    GIGSHIELD - COMPLETE WORKFLOW
                    ══════════════════════════════

  ╔══════════════════════════════════════════════════════════╗
  ║                  PHASE 1: ONBOARDING                     ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  [1] Worker opens GigShield PWA                         ║
  ║       │                                                  ║
  ║  [2] Enters Aadhaar Number                              ║
  ║       │                                                  ║
  ║  [3] OTP sent to Aadhaar-linked mobile                  ║
  ║       │                                                  ║
  ║  [4] OTP Verified → Unique Token Generated (GS-XXXX)   ║
  ║       │                                                  ║
  ║  [5] Select Delivery Platform (Zepto/Blinkit/etc)       ║
  ║       │                                                  ║
  ║  [6] Enter Operating Zone (Pincode / Area)              ║
  ║       │                                                  ║
  ║  [7] Enter Monthly Earning & Working Hours              ║
  ║       │                                                  ║
  ║  [8] AI calculates:                                     ║
  ║       ├── Hourly earning rate                           ║
  ║       ├── Zone risk score                               ║
  ║       └── Personalized weekly premium                   ║
  ║       │                                                  ║
  ║  [9] Worker selects plan (Basic/Standard/Pro)           ║
  ║       │                                                  ║
  ║ [10] Pays first week premium via UPI                    ║
  ║       │                                                  ║
  ║ [11] ✅ Policy Active! Coverage starts immediately      ║
  ║                                                          ║
  ╠══════════════════════════════════════════════════════════╣
  ║                  PHASE 2: MONITORING                     ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  [BACKGROUND - Runs Every 15 Minutes]                   ║
  ║       │                                                  ║
  ║  [12] Trigger Monitor checks:                           ║
  ║       ├── OpenWeatherMap → Rain/Heat/Storm?             ║
  ║       ├── AQICN → AQI > 400?                           ║
  ║       ├── NewsAPI → Curfew/Bandh/Strike?                ║
  ║       ├── Platform Status → App Down?                   ║
  ║       └── NDMA Alerts → Disaster?                       ║
  ║       │                                                  ║
  ║  [13] If disruption detected:                           ║
  ║       ├── Identify affected zone/pincode                ║
  ║       ├── Determine severity level                      ║
  ║       └── Calculate disruption duration                 ║
  ║                                                          ║
  ╠══════════════════════════════════════════════════════════╣
  ║                  PHASE 3: AUTO-CLAIM                     ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  [14] System finds all workers in affected zone         ║
  ║       │                                                  ║
  ║  [15] For each worker:                                  ║
  ║       ├── Active policy? ✅                             ║
  ║       ├── In affected zone? ✅                          ║
  ║       ├── Scheduled to work? ✅                         ║
  ║       └── → Auto-claim created                          ║
  ║       │                                                  ║
  ║  [16] Fraud Detection Engine runs:                      ║
  ║       ├── GPS validation                                ║
  ║       ├── Weather cross-verification                    ║
  ║       ├── Behavioral analysis                           ║
  ║       └── Anomaly detection score                       ║
  ║       │                                                  ║
  ║  [17] Fraud Score calculated (0-100)                    ║
  ║       ├── < 30:  AUTO APPROVE ✅                        ║
  ║       ├── 30-70: MANUAL REVIEW ⚠️                      ║
  ║       └── > 70:  REJECT ❌                              ║
  ║                                                          ║
  ╠══════════════════════════════════════════════════════════╣
  ║                  PHASE 4: PAYOUT                         ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  [18] Payout Calculated:                                ║
  ║       Payout = Lost Hours × Hourly Rate × Coverage%    ║
  ║       │                                                  ║
  ║  [19] Payment initiated via Razorpay/UPI               ║
  ║       │                                                  ║
  ║  [20] Worker receives notification:                     ║
  ║       "₹266 paid to your UPI for 4hrs rain disruption" ║
  ║       │                                                  ║
  ║  [21] Amount credited to worker's bank in 5-30 min     ║
  ║                                                          ║
  ╠══════════════════════════════════════════════════════════╣
  ║                  PHASE 5: RENEWAL                        ║
  ╠══════════════════════════════════════════════════════════╣
  ║                                                          ║
  ║  [Every Monday 6 AM]                                    ║
  ║       │                                                  ║
  ║  [22] AI recalculates premium for new week             ║
  ║       ├── Updated zone risk score                       ║
  ║       ├── Updated claims history                        ║
  ║       └── Updated seasonal factors                      ║
  ║       │                                                  ║
  ║  [23] Auto-debit from worker's UPI                     ║
  ║       │                                                  ║
  ║  [24] New weekly policy activated                       ║
  ║       │                                                  ║
  ║  [25] Worker notified: "Coverage renewed for ₹42"      ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
```

---

## 👥 User Personas & Scenarios

### Persona 1: Rahul — Full-time Zepto Rider (Mumbai)
```
┌──────────────────────────────────────────────────┐
│  👤 RAHUL KUMAR                                   │
│  📍 Mumbai, Andheri West                         │
│  🛵 Platform: Zepto                              │
│  ⏰ Works: 10 hrs/day, 6 days/week              │
│  💰 Monthly: ₹20,000                            │
│  💰 Hourly: ₹83                                 │
│  📋 Plan: Standard (₹42/week)                   │
│                                                   │
│  SCENARIO: Monsoon Heavy Rain                    │
│  ──────────────────────────                      │
│  🌧️ July 15: Heavy rain 2-8 PM (6 hours)       │
│  🤖 System detects: Rain 35mm/hr in Andheri     │
│  📋 Auto-claim: 6 hrs × ₹83 × 80% = ₹398      │
│  🔍 Fraud Score: 12 (AUTO APPROVE)              │
│  💸 Payout: ₹398 via UPI in 12 minutes         │
│  📱 SMS: "₹398 credited for rain disruption"    │
└──────────────────────────────────────────────────┘
```

### Persona 2: Priya — Part-time Blinkit Rider (Delhi)
```
┌──────────────────────────────────────────────────┐
│  👤 PRIYA SHARMA                                  │
│  📍 Delhi, Dwarka                                │
│  🛵 Platform: Blinkit                            │
│  ⏰ Works: 5 hrs/day, 5 days/week               │
│  💰 Monthly: ₹10,000                            │
│  💰 Hourly: ₹100                                │
│  📋 Plan: Basic (₹28/week)                      │
│                                                   │
│  SCENARIO: Severe AQI + GRAP-4                   │
│  ──────────────────────────                      │
│  🏭 Nov 8: AQI crosses 500 in Dwarka            │
│  🤖 System detects: AQI 523, GRAP-4 activated   │
│  📋 Auto-claim: 5 hrs × ₹100 × 70% = ₹350     │
│  🔍 Fraud Score: 8 (AUTO APPROVE)               │
│  💸 Payout: ₹300 (Basic plan daily max)         │
│  📱 SMS: "₹300 credited for AQI disruption"     │
└──────────────────────────────────────────────────┘
```

### Persona 3: Amit — Full-time Swiggy Instamart (Bangalore)
```
┌──────────────────────────────────────────────────┐
│  👤 AMIT REDDY                                    │
│  📍 Bangalore, Whitefield                        │
│  🛵 Platform: Swiggy Instamart                   │
│  ⏰ Works: 8 hrs/day, 6 days/week               │
│  💰 Monthly: ₹18,000                            │
│  💰 Hourly: ₹94                                 │
│  📋 Plan: Pro (₹52/week)                        │
│                                                   │
│  SCENARIO: App Server Down + Flooding            │
│  ──────────────────────────────                  │
│  🌊 Sep 20: Whitefield waterlogged              │
│  📱 Sep 20: Swiggy app down 3 hours             │
│  🤖 System detects BOTH triggers                │
│  📋 Auto-claim: 8 hrs × ₹94 × 90% = ₹676     │
│  🔍 Fraud Score: 15 (AUTO APPROVE)              │
│  💸 Payout: ₹600 (Pro plan daily max)           │
│  📱 SMS: "₹600 credited for flooding+outage"    │
└──────────────────────────────────────────────────┘
```

---

## 🔌 API Integrations

### External APIs Used:

| API | Purpose | Endpoint | Free Tier |
|-----|---------|----------|-----------|
| **OpenWeatherMap** | Weather data (rain, temp, wind, fog) | `api.openweathermap.org/data/2.5/weather` | 1000 calls/day |
| **AQICN** | Air Quality Index | `api.waqi.info/feed/:city` | Unlimited |
| **NewsAPI** | Detect curfew/bandh/strike news | `newsapi.org/v2/everything` | 100 calls/day |
| **GNews** | Backup news source | `gnews.io/api/v4/search` | 100 calls/day |
| **Razorpay** | Payment processing (Test Mode) | `api.razorpay.com` | Sandbox free |
| **USGS Earthquake** | Earthquake detection | `earthquake.usgs.gov/fdsnws` | Free |
| **Leaflet/OSM** | Maps & geolocation | `tile.openstreetmap.org` | Free |

### API Integration Code Example:
```python
# Weather Trigger Check
class WeatherTriggerService:
    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"
    
    async def check_weather_triggers(self, pincode: str) -> List[Trigger]:
        """Check all weather-based triggers for a pincode"""
        coords = get_coordinates(pincode)
        
        response = await httpx.get(
            self.base_url,
            params={
                "lat": coords.lat,
                "lon": coords.lon,
                "appid": self.api_key,
                "units": "metric"
            }
        )
        data = response.json()
        
        triggers = []
        
        # Check Heavy Rain
        if 'rain' in data and data['rain'].get('1h', 0) > 15:
            triggers.append(Trigger(
                type="HEAVY_RAIN",
                severity="HIGH",
                value=data['rain']['1h'],
                threshold=15,
                unit="mm/hr"
            ))
        
        # Check Extreme Heat
        if data['main']['temp'] > 45:
            triggers.append(Trigger(
                type="EXTREME_HEAT",
                severity="HIGH",
                value=data['main']['temp'],
                threshold=45,
                unit="°C"
            ))
        
        # Check High Wind
        if data['wind']['speed'] > 60:
            triggers.append(Trigger(
                type="HIGH_WIND",
                severity="MEDIUM",
                value=data['wind']['speed'],
                threshold=60,
                unit="km/hr"
            ))
        
        return triggers
```

---

## 🗄️ Database Schema

### ER Diagram:
```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│     WORKERS       │     │    POLICIES       │     │     CLAIMS        │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK)          │     │ id (PK)          │     │ id (PK)          │
│ token_id (UNIQUE)│──┐  │ worker_id (FK)   │──┐  │ policy_id (FK)   │
│ aadhaar_hash     │  │  │ plan_type        │  │  │ worker_id (FK)   │
│ name             │  │  │ weekly_premium   │  │  │ trigger_id (FK)  │
│ phone            │  ├──│ start_date       │  ├──│ claim_amount     │
│ platform         │  │  │ end_date         │  │  │ disruption_hours │
│ pincode          │  │  │ status           │  │  │ fraud_score      │
│ zone             │  │  │ auto_renew       │  │  │ status           │
│ monthly_earning  │  │  │ coverage_percent │  │  │ payout_amount    │
│ working_hours    │  │  │ daily_max_payout │  │  │ payout_status    │
│ working_days     │  │  │ weekly_max_payout│  │  │ payout_time      │
│ hourly_rate      │  │  │ created_at       │  │  │ created_at       │
│ upi_id           │  │  └──────────────────┘  │  │ approved_at      │
│ risk_score       │  │                         │  │ paid_at          │
│ created_at       │  │                         │  └──────────────────┘
└──────────────────┘  │                         │
                      │  ┌──────────────────┐   │  ┌──────────────────┐
                      │  │    TRIGGERS       │   │  │  FRAUD_LOGS       │
                      │  ├──────────────────┤   │  ├──────────────────┤
                      │  │ id (PK)          │   │  │ id (PK)          │
                      │  │ type             │   │  │ claim_id (FK)    │
                      │  │ severity         │   │  │ check_type       │
                      │  │ value            │   │  │ score            │
                      │  │ threshold        │   │  │ details          │
                      │  │ affected_zone    │   │  │ result           │
                      │  │ duration_hours   │   │  │ created_at       │
                      │  │ source_api       │   │  └──────────────────┘
                      │  │ verified         │   │
                      │  │ created_at       │   │  ┌──────────────────┐
                      │  │ ended_at         │   │  │  PAYMENTS         │
                      │  └──────────────────┘   │  ├──────────────────┤
                      │                         │  │ id (PK)          │
                      │  ┌──────────────────┐   └──│ claim_id (FK)    │
                      │  │  ZONE_RISKS      │      │ worker_id (FK)   │
                      │  ├──────────────────┤      │ amount           │
                      └──│ id (PK)          │      │ upi_id           │
                         │ pincode          │      │ transaction_id   │
                         │ risk_score       │      │ status           │
                         │ risk_factors     │      │ gateway_response │
                         │ week_start       │      │ created_at       │
                         │ predicted_claims │      └──────────────────┘
                         │ last_updated     │
                         └──────────────────┘

                      ┌──────────────────┐
                      │  PREMIUM_HISTORY  │
                      ├──────────────────┤
                      │ id (PK)          │
                      │ worker_id (FK)   │
                      │ week_start       │
                      │ base_rate        │
                      │ zone_multiplier  │
                      │ season_multiplier│
                      │ claims_multiplier│
                      │ hours_multiplier │
                      │ final_premium    │
                      │ paid             │
                      │ created_at       │
                      └──────────────────┘
```

---

## 📊 Dashboard Design

### Worker Dashboard:
```
┌─────────────────────────────────────────────────────────────┐
│  🛡️ GigShield                              [Rahul ▼] [🔔] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Welcome Back, Rahul! 👋          Token: GS-7A3F9B2E       │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ 📋 Active  │ │ 💰 Weekly  │ │ 🛡️ Total   │ │ ⚡ Avg   │ │
│  │   Policy   │ │  Premium   │ │  Protected │ │  Payout  │ │
│  │ ────────── │ │ ────────── │ │ ────────── │ │ ──────── │ │
│  │ Standard   │ │  ₹42/week  │ │ ₹2,850     │ │ 12 min   │ │
│  │            │ │            │ │ this month │ │          │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│                                                              │
│  ── Active Coverage ──────────────────────────────────────  │
│  │ Plan: Standard | Coverage: 80% | Daily Max: ₹450       │ │
│  │ Renews: Monday, March 24 | Auto-Renew: ✅ ON           │ │
│  └──────────────────────────────────────────────────────── │ │
│                                                              │
│  ── This Week's Claims ───────────────────────────────────  │
│  │ Mar 18 │ 🌧️ Heavy Rain  │ 4 hrs │ ₹266  │ ✅ Paid    │ │
│  │ Mar 20 │ 📱 App Down    │ 2 hrs │ ₹132  │ ✅ Paid    │ │
│  └──────────────────────────────────────────────────────── │ │
│                                                              │
│  ── Risk Forecast (Next Week) ────────────────────────────  │
│  │ 🌧️ Rain Risk: ████████░░ 75% (Monsoon approaching)     │ │
│  │ 🏭 AQI Risk:  ██░░░░░░░░ 15%                           │ │
│  │ 💡 Tip: Your coverage is active. Stay protected!        │ │
│  └──────────────────────────────────────────────────────── │ │
│                                                              │
│  [📋 View Policy] [📊 Claims History] [💳 Payment History] │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Admin / Insurer Dashboard:
```
┌─────────────────────────────────────────────────────────────┐
│  🛡️ GigShield Admin Portal              [Admin ▼] [🔔 23] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │ 👥 Active  │ │ 💰 Weekly  │ │ 💸 Weekly  │ │ 📊 Loss  │ │
│  │  Workers   │ │  Revenue   │ │  Claims    │ │  Ratio   │ │
│  │ ────────── │ │ ────────── │ │ ────────── │ │ ──────── │ │
│  │  12,450    │ │  ₹4.98L    │ │  ₹3.12L   │ │  62.7%   │ │
│  │  (+340)    │ │  (+12%)    │ │  (+8%)     │ │  (Good)  │ │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│                                                              │
│  ── Weekly Revenue vs Claims Chart ───────────────────────  │
│  │                                                         │ │
│  │  Revenue  ████████████████████████  ₹4.98L             │ │
│  │  Claims   ██████████████░░░░░░░░░  ₹3.12L             │ │
│  │  Profit   ████████░░░░░░░░░░░░░░░  ₹1.86L             │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────── │ │
│                                                              │
│  ── Risk Heatmap ─────────────────────────────────────────  │
│  │  🗺️ [Interactive Map showing zone-wise risk scores]     │ │
│  │  🔴 High Risk Zones: Andheri, Dwarka, Whitefield       │ │
│  │  🟡 Medium Risk: Koramangala, Powai, Noida             │ │
│  │  🟢 Low Risk: Navi Mumbai, HSR Layout                  │ │
│  └──────────────────────────────────────────────────────── │ │
│                                                              │
│  ── Fraud Detection ──────────────────────────────────────  │
│  │ 🚨 Flagged Claims: 23 (this week)                      │ │
│  │ ⚠️ Pending Review: 12                                  │ │
│  │ ❌ Rejected: 8                                          │ │
│  │ 🔍 Fraud Rate: 1.8% (industry avg: 3-5%)              │ │
│  └──────────────────────────────────────────────────────── │ │
│                                                              │
│  ── Next Week Prediction ─────────────────────────────────  │
│  │ 📈 Expected Claims: 847 workers                        │ │
│  │ 💰 Expected Payout: ₹3.4L                             │ │
│  │ 🌧️ Major Risk: Heavy rain predicted Thu-Sat            │ │
│  │ 💡 Reserve Recommendation: ₹4.0L                       │ │
│  └──────────────────────────────────────────────────────── │ │
│                                                              │
│  [📊 Analytics] [🔍 Fraud Queue] [👥 Workers] [⚙️ Settings]│
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Team

| Name | Role | Responsibilities |
|------|------|-----------------|
| [Name 1] | Full Stack Lead | Architecture, Backend APIs, Integration |
| [Name 2] | ML/AI Engineer | Risk Model, Fraud Detection, Premium Model |
| [Name 3] | Frontend Developer | PWA, Dashboards, UX Design |
| [Name 4] | Product & Data | Business Model, Research, Documentation |

---

## 📄 License

This project is built for the **Guidewire DEVTrails 2026 Hackathon**.

---

## 🔗 Links

- **Demo Video (Phase 1):** [Link to 2-min video]
- **Demo Video (Phase 2):** [Link to 2-min demo]
- **Final Demo (Phase 3):** [Link to 5-min demo]
- **Pitch Deck:** [Link to PDF]
- **Live Demo:** [Link to deployed app]

---

> **Built with ❤️ for India's Gig Workers**
> **GigShield — Because every delivery partner deserves a safety net.**
```

---


