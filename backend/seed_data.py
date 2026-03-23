"""
GigShield - Seed Data Script (FIXED)
Run: python seed_data.py (from backend folder)
"""

import sys
import os
import random
import secrets
from datetime import datetime, timedelta

# Fix path
app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app")
if os.path.exists(os.path.join(app_path, "main.py")):
    sys.path.insert(0, app_path)
    print(f"✅ Found main.py at: {os.path.join(app_path, 'main.py')}")
else:
    print("❌ Cannot find main.py!")
    sys.exit(1)

from main import (
    engine, SessionLocal, Base,
    Worker, Policy, Trigger, Claim, Payment,
    PLAN_CONFIG, TRIGGER_THRESHOLDS, PRIORITY_MAP,
    generate_aadhaar_hash, generate_token_id,
    calculate_hourly_rate, calculate_risk_score,
    get_trust_tier
)

print("✅ All imports successful\n")


# ============================================
# USE ONE SINGLE SESSION FOR EVERYTHING
# ============================================
db = SessionLocal()


def clear_database():
    """Clear all existing data"""
    db.query(Payment).delete()
    db.query(Claim).delete()
    db.query(Trigger).delete()
    db.query(Policy).delete()
    db.query(Worker).delete()
    db.commit()
    print("✅ Database cleared")


def seed_workers():
    """Create 12 realistic demo workers"""

    workers_data = [
        # Mumbai Workers
        {
            "aadhaar": "111111111111", "name": "Rahul Kumar",
            "phone": "9876543210", "platform": "zepto",
            "pincode": "400053", "zone": "Andheri West",
            "monthly_earning": 20000, "hours": 10, "days": 6,
            "upi_id": "rahul@upi", "trust": 72
        },
        {
            "aadhaar": "222222222222", "name": "Vikram Singh",
            "phone": "9876543211", "platform": "blinkit",
            "pincode": "400053", "zone": "Andheri West",
            "monthly_earning": 18000, "hours": 8, "days": 6,
            "upi_id": "vikram@upi", "trust": 65
        },
        {
            "aadhaar": "333333333333", "name": "Deepak Sharma",
            "phone": "9876543212", "platform": "swiggy_instamart",
            "pincode": "400050", "zone": "Bandra",
            "monthly_earning": 22000, "hours": 10, "days": 6,
            "upi_id": "deepak@upi", "trust": 80
        },
        {
            "aadhaar": "444444444444", "name": "Suresh Patil",
            "phone": "9876543213", "platform": "zepto",
            "pincode": "400069", "zone": "Sion",
            "monthly_earning": 16000, "hours": 8, "days": 5,
            "upi_id": "suresh@upi", "trust": 55
        },
        # Delhi Workers
        {
            "aadhaar": "555555555555", "name": "Priya Sharma",
            "phone": "9876543214", "platform": "blinkit",
            "pincode": "110001", "zone": "Connaught Place",
            "monthly_earning": 15000, "hours": 6, "days": 5,
            "upi_id": "priya@upi", "trust": 68
        },
        {
            "aadhaar": "666666666666", "name": "Sanjay Verma",
            "phone": "9876543215", "platform": "zepto",
            "pincode": "110085", "zone": "Rohini",
            "monthly_earning": 19000, "hours": 9, "days": 6,
            "upi_id": "sanjay@upi", "trust": 45
        },
        {
            "aadhaar": "777777777777", "name": "Anita Gupta",
            "phone": "9876543216", "platform": "swiggy_instamart",
            "pincode": "110075", "zone": "Dwarka",
            "monthly_earning": 17000, "hours": 8, "days": 6,
            "upi_id": "anita@upi", "trust": 75
        },
        # Bangalore Workers
        {
            "aadhaar": "888888888888", "name": "Amit Reddy",
            "phone": "9876543217", "platform": "swiggy_instamart",
            "pincode": "560066", "zone": "Whitefield",
            "monthly_earning": 21000, "hours": 10, "days": 6,
            "upi_id": "amit@upi", "trust": 82
        },
        {
            "aadhaar": "999999999999", "name": "Kavya Nair",
            "phone": "9876543218", "platform": "zepto",
            "pincode": "560034", "zone": "Koramangala",
            "monthly_earning": 19000, "hours": 9, "days": 6,
            "upi_id": "kavya@upi", "trust": 60
        },
        # Gurugram Worker
        {
            "aadhaar": "101010101010", "name": "Ravi Yadav",
            "phone": "9876543219", "platform": "blinkit",
            "pincode": "122001", "zone": "Sector 29",
            "monthly_earning": 23000, "hours": 10, "days": 6,
            "upi_id": "ravi@upi", "trust": 70
        },
        # Chennai Worker
        {
            "aadhaar": "121212121212", "name": "Karthik Subramanian",
            "phone": "9876543220", "platform": "swiggy",
            "pincode": "600004", "zone": "Marina Beach",
            "monthly_earning": 18000, "hours": 9, "days": 6,
            "upi_id": "karthik@upi", "trust": 58
        },
        # Noida Worker
        {
            "aadhaar": "131313131313", "name": "Neha Agarwal",
            "phone": "9876543221", "platform": "blinkit",
            "pincode": "201301", "zone": "Sector 62",
            "monthly_earning": 16000, "hours": 7, "days": 5,
            "upi_id": "neha@upi", "trust": 50
        },
    ]

    worker_ids = []

    for w in workers_data:
        aadhaar_hash = generate_aadhaar_hash(w["aadhaar"])
        token_id = generate_token_id(aadhaar_hash)
        hourly_rate = calculate_hourly_rate(
            w["monthly_earning"], w["days"], w["hours"]
        )
        risk_score = calculate_risk_score(
            w["pincode"], w["zone"], w["platform"]
        )

        worker = Worker(
            token_id=token_id,
            aadhaar_hash=aadhaar_hash,
            name=w["name"],
            phone=w["phone"],
            platform=w["platform"],
            pincode=w["pincode"],
            zone=w["zone"],
            monthly_earning=w["monthly_earning"],
            working_hours_per_day=w["hours"],
            working_days_per_week=w["days"],
            hourly_rate=hourly_rate,
            upi_id=w["upi_id"],
            risk_score=risk_score,
            trust_score=w["trust"],
            trust_tier=get_trust_tier(w["trust"]),
            is_active=True,
        )
        db.add(worker)
        db.flush()  # Gets ID without closing session

        worker_ids.append(worker.id)
        print(
            f"  👤 {w['name']:30s} | {token_id} | "
            f"{w['zone']:20s} | Risk: {risk_score} | ₹{hourly_rate}/hr"
        )

    db.commit()
    print(f"\n✅ {len(worker_ids)} workers created")
    return worker_ids


def seed_policies(worker_ids):
    """Create active policies for all workers"""
    policy_ids = []

    plan_list = [
        "standard", "standard", "pro", "basic",
        "basic", "standard", "standard", "pro",
        "standard", "pro", "standard", "basic",
    ]

    for i, worker_id in enumerate(worker_ids):
        worker = db.query(Worker).filter(Worker.id == worker_id).first()
        if not worker:
            continue

        plan_type = plan_list[i] if i < len(plan_list) else "standard"
        plan = PLAN_CONFIG[plan_type]

        base_rates = {"basic": 25.0, "standard": 32.0, "pro": 40.0}
        base = base_rates[plan_type]
        premium = round(base * (1 + worker.risk_score * 0.5), 2)
        premium = max(25, min(60, premium))

        start = datetime.now() - timedelta(days=random.randint(0, 3))
        end = start + timedelta(days=7)

        policy = Policy(
            worker_id=worker.id,
            plan_type=plan_type,
            weekly_premium=premium,
            coverage_percent=plan["coverage_percent"],
            hourly_payout=plan["hourly_payout"],
            daily_max_payout=plan["daily_max_payout"],
            weekly_max_payout=plan["weekly_max_payout"],
            start_date=start,
            end_date=end,
            status="active",
            auto_renew=True,
            total_paid_out=0.0,
            premium_breakdown={
                "base_rate": base,
                "plan_type": plan_type,
                "risk_score": worker.risk_score,
            },
        )
        db.add(policy)
        db.flush()

        # Premium payment
        pay = Payment(
            worker_id=worker.id,
            payment_type="premium_collection",
            amount=premium,
            upi_id=worker.upi_id,
            transaction_id=f"SEED-PREM-{secrets.token_hex(6).upper()}",
            status="completed",
            gateway_response={"method": "UPI", "status": "success"},
            completed_at=start,
        )
        db.add(pay)
        db.flush()

        policy_ids.append(policy.id)
        print(
            f"  📋 {worker.name:30s} → {plan_type.upper():10s} | ₹{premium}/week"
        )

    db.commit()
    print(f"\n✅ {len(policy_ids)} policies created")
    return policy_ids


def seed_triggers_and_claims():
    """Create realistic historical triggers and claims"""

    events = [
        {
            "type": "HEAVY_RAIN", "category": "weather",
            "severity": "high", "value": 35, "threshold": 15,
            "unit": "mm_per_hr", "zone": "Andheri West",
            "pincode": "400053", "duration": 4, "days_ago": 5,
            "source": "openweathermap",
        },
        {
            "type": "SEVERE_AQI", "category": "weather",
            "severity": "high", "value": 520, "threshold": 400,
            "unit": "aqi", "zone": "Connaught Place",
            "pincode": "110001", "duration": 8, "days_ago": 3,
            "source": "aqicn",
        },
        {
            "type": "HEAVY_RAIN", "category": "weather",
            "severity": "high", "value": 28, "threshold": 15,
            "unit": "mm_per_hr", "zone": "Whitefield",
            "pincode": "560066", "duration": 3, "days_ago": 4,
            "source": "openweathermap",
        },
        {
            "type": "CURFEW", "category": "social",
            "severity": "critical", "value": 1, "threshold": 1,
            "unit": "active", "zone": "Rohini",
            "pincode": "110085", "duration": 10, "days_ago": 6,
            "source": "manual_admin",
        },
        {
            "type": "APP_DOWN", "category": "technical",
            "severity": "high", "value": 120, "threshold": 60,
            "unit": "minutes", "zone": "Bandra",
            "pincode": "400050", "duration": 2, "days_ago": 2,
            "source": "simulation",
        },
        {
            "type": "EXTREME_HEAT", "category": "weather",
            "severity": "high", "value": 47, "threshold": 45,
            "unit": "celsius", "zone": "Sector 29",
            "pincode": "122001", "duration": 5, "days_ago": 1,
            "source": "openweathermap",
        },
        {
            "type": "FLOOD", "category": "natural_disaster",
            "severity": "critical", "value": 1, "threshold": 1,
            "unit": "alert_level", "zone": "Marina Beach",
            "pincode": "600004", "duration": 12, "days_ago": 7,
            "source": "manual_admin",
        },
        {
            "type": "HEAVY_RAIN", "category": "weather",
            "severity": "high", "value": 42, "threshold": 15,
            "unit": "mm_per_hr", "zone": "Sion",
            "pincode": "400069", "duration": 5, "days_ago": 3,
            "source": "openweathermap",
        },
    ]

    total_claims = 0
    total_payout = 0

    for event in events:
        trigger_time = datetime.now() - timedelta(days=event["days_ago"])

        trigger = Trigger(
            type=event["type"],
            category=event["category"],
            severity=event["severity"],
            value=event["value"],
            threshold=event["threshold"],
            unit=event["unit"],
            affected_zone=event["zone"],
            affected_pincode=event["pincode"],
            duration_hours=event["duration"],
            source_api=event["source"],
            verified=True,
            started_at=trigger_time,
            ended_at=trigger_time + timedelta(hours=event["duration"]),
        )
        db.add(trigger)
        db.flush()

        print(
            f"\n  ⚡ {event['type']:15s} in {event['zone']:20s} "
            f"({event['days_ago']}d ago, {event['duration']}hrs)"
        )

        # Find affected workers
        affected_workers = db.query(Worker).filter(
            Worker.pincode == event["pincode"],
            Worker.is_active == True
        ).all()

        for worker in affected_workers:
            policy = db.query(Policy).filter(
                Policy.worker_id == worker.id,
                Policy.status == "active"
            ).first()

            if not policy:
                continue

            # Calculate payout
            hourly_payout = policy.hourly_payout
            coverage = policy.coverage_percent / 100
            duration = event["duration"]

            priority = PRIORITY_MAP.get(
                event["severity"], PRIORITY_MAP["medium"]
            )
            raw_payout = (
                hourly_payout * duration * coverage
                * priority["coverage_factor"]
            )
            payout = min(raw_payout, policy.daily_max_payout)
            payout = round(payout, 2)

            # Fraud score (low for genuine seed data)
            fraud_score = random.choice([5, 8, 12, 15, 18, 22, 25])

            # Status based on fraud score
            if fraud_score <= 30:
                status = "auto_approved"
                payout_status = "paid"
            elif fraud_score <= 70:
                status = "manual_review"
                payout_status = "pending"
                payout = round(payout * 0.6, 2)
            else:
                status = "rejected"
                payout_status = "rejected"
                payout = 0

            claim_amount = round(
                duration * worker.hourly_rate * coverage, 2
            )

            txn_id = (
                f"PAY-{secrets.token_hex(6).upper()}"
                if status == "auto_approved" else None
            )

            claim_time = trigger_time + timedelta(
                minutes=random.randint(1, 15)
            )
            approve_time = (
                trigger_time + timedelta(minutes=random.randint(5, 20))
                if status == "auto_approved" else None
            )
            pay_time = (
                trigger_time + timedelta(minutes=random.randint(10, 30))
                if status == "auto_approved" else None
            )

            claim = Claim(
                worker_id=worker.id,
                policy_id=policy.id,
                trigger_id=trigger.id,
                claim_amount=claim_amount,
                disruption_hours=duration,
                hourly_rate=worker.hourly_rate,
                coverage_percent=policy.coverage_percent,
                fraud_score=fraud_score,
                fraud_details={
                    "zone_match": "PASS",
                    "worker_active": "PASS",
                    "claim_frequency": "PASS",
                    "duplicate_claim": "PASS",
                    "trust_check": f"Trust {worker.trust_score}",
                    "trigger_verified": "PASS",
                    "final_score": fraud_score,
                    "decision": status,
                },
                status=status,
                payout_amount=payout,
                payout_status=payout_status,
                payout_transaction_id=txn_id,
                priority_rank=priority["rank"],
                created_at=claim_time,
                approved_at=approve_time,
                paid_at=pay_time,
            )
            db.add(claim)
            db.flush()

            # Payment for approved claims
            if status == "auto_approved":
                payment = Payment(
                    claim_id=claim.id,
                    worker_id=worker.id,
                    payment_type="claim_payout",
                    amount=payout,
                    upi_id=worker.upi_id,
                    transaction_id=txn_id,
                    status="completed",
                    gateway_response={
                        "method": "UPI",
                        "status": "success",
                        "payout_time": (
                            f"{priority['payout_minutes']} minutes"
                        )
                    },
                    created_at=pay_time,
                    completed_at=pay_time,
                )
                db.add(payment)
                policy.total_paid_out += payout

            total_claims += 1
            total_payout += payout

            icon = (
                "✅" if status == "auto_approved"
                else "⏳" if status == "manual_review"
                else "❌"
            )
            print(
                f"    {icon} {worker.name:25s} → ₹{payout:>8} "
                f"| Fraud: {fraud_score:>2} | {status}"
            )

    db.commit()
    print(
        f"\n✅ {total_claims} claims created | "
        f"Total payout: ₹{round(total_payout, 2)}"
    )


def seed_manual_review_claims():
    """Create 2 claims in manual_review for admin demo"""

    workers = db.query(Worker).filter(
        Worker.pincode == "400053"
    ).all()

    if len(workers) < 2:
        print("⚠️ Not enough workers for manual review")
        return

    trigger_time = datetime.now() - timedelta(hours=3)

    trigger = Trigger(
        type="HEAVY_RAIN",
        category="weather",
        severity="high",
        value=25,
        threshold=15,
        unit="mm_per_hr",
        affected_zone="Andheri West",
        affected_pincode="400053",
        duration_hours=3,
        source_api="openweathermap",
        verified=True,
        started_at=trigger_time,
        ended_at=trigger_time + timedelta(hours=3),
    )
    db.add(trigger)
    db.flush()

    count = 0
    for worker in workers[:2]:
        policy = db.query(Policy).filter(
            Policy.worker_id == worker.id,
            Policy.status == "active"
        ).first()

        if not policy:
            continue

        payout = round(
            policy.hourly_payout * 3
            * (policy.coverage_percent / 100) * 0.6, 2
        )

        fraud_score = random.choice([38, 42, 48, 55])

        claim = Claim(
            worker_id=worker.id,
            policy_id=policy.id,
            trigger_id=trigger.id,
            claim_amount=round(
                3 * worker.hourly_rate
                * (policy.coverage_percent / 100), 2
            ),
            disruption_hours=3,
            hourly_rate=worker.hourly_rate,
            coverage_percent=policy.coverage_percent,
            fraud_score=fraud_score,
            fraud_details={
                "zone_match": "PASS",
                "worker_active": "PASS",
                "claim_frequency": "FLAG - 2 claims this week",
                "duplicate_claim": "PASS",
                "trust_check": f"OK - Trust {worker.trust_score}",
                "trigger_verified": "PASS",
                "decision": "manual_review",
                "decision_reason": (
                    "Medium fraud risk - Needs manual review"
                ),
            },
            status="manual_review",
            payout_amount=payout,
            payout_status="pending",
            priority_rank="high",
            created_at=trigger_time + timedelta(minutes=5),
        )
        db.add(claim)
        db.flush()

        # 60% advance payment
        payment = Payment(
            claim_id=claim.id,
            worker_id=worker.id,
            payment_type="advance_payout",
            amount=payout,
            upi_id=worker.upi_id,
            transaction_id=f"ADV-{secrets.token_hex(6).upper()}",
            status="completed",
            gateway_response={
                "method": "UPI", "type": "60% advance"
            },
            created_at=trigger_time + timedelta(minutes=8),
        )
        db.add(payment)
        count += 1
        print(
            f"  ⏳ {worker.name:25s} → ₹{payout} "
            f"(60% advance, fraud: {fraud_score})"
        )

    db.commit()
    print(f"✅ {count} manual review claims created for admin demo")


def print_summary():
    """Print final summary"""
    workers = db.query(Worker).count()
    active_policies = db.query(Policy).filter(
        Policy.status == "active"
    ).count()
    triggers = db.query(Trigger).count()
    claims = db.query(Claim).count()
    pending = db.query(Claim).filter(
        Claim.status == "manual_review"
    ).count()
    auto_approved = db.query(Claim).filter(
        Claim.status == "auto_approved"
    ).count()

    approved_claims = db.query(Claim).filter(
        Claim.status.in_(["auto_approved", "approved"])
    ).all()
    total_payout = sum(c.payout_amount for c in approved_claims)

    policies = db.query(Policy).filter(
        Policy.status == "active"
    ).all()
    total_premium = sum(p.weekly_premium for p in policies)

    loss = (
        round((total_payout / total_premium * 100), 1)
        if total_premium > 0 else 0
    )

    print("\n" + "=" * 60)
    print("        🛡️  GIGSHIELD — SEED DATA SUMMARY")
    print("=" * 60)
    print(f"  👥 Workers Created:       {workers}")
    print(f"  📋 Active Policies:       {active_policies}")
    print(f"  ⚡ Triggers Created:      {triggers}")
    print(f"  📝 Total Claims:          {claims}")
    print(f"     ├── ✅ Auto Approved:  {auto_approved}")
    print(f"     └── ⏳ Pending Review: {pending}")
    print(f"  💰 Weekly Premium:        ₹{round(total_premium, 2)}")
    print(f"  💸 Total Payouts:         ₹{round(total_payout, 2)}")
    print(f"  📊 Loss Ratio:            {loss}%")
    status = (
        "✅ Healthy" if loss < 70
        else "⚠️ Warning" if loss < 85
        else "🔴 Critical"
    )
    print(f"  📈 Status:                {status}")
    print("=" * 60)
    print("  🚀 Database is ready for demo!")
    print("  🌐 Start backend:  uvicorn app.main:app --reload")
    print("  🖥️  Start frontend: npm start")
    print("=" * 60)


# ============================================
# RUN EVERYTHING
# ============================================
if __name__ == "__main__":
    print("🛡️  GigShield — Seed Data Generator")
    print("=" * 50)

    try:
        # Step 1
        print("\n📦 STEP 1: Clearing existing data...")
        clear_database()

        # Step 2
        print("\n👥 STEP 2: Creating 12 workers across India...")
        worker_ids = seed_workers()

        # Step 3
        print("\n📋 STEP 3: Creating insurance policies...")
        policy_ids = seed_policies(worker_ids)

        # Step 4
        print("\n⚡ STEP 4: Creating triggers & claims...")
        seed_triggers_and_claims()

        # Step 5
        print("\n⏳ STEP 5: Creating manual review claims...")
        seed_manual_review_claims()

        # Summary
        print_summary()

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()

    finally:
        db.close()
        print("\n🔒 Database session closed.")