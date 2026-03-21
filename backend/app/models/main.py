from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import Base, engine

# Import all models so tables get created
from app.models.worker import Worker
from app.models.policy import Policy
from app.models.trigger import Trigger
from app.models.claim import Claim
from app.models.payment import Payment

# Create all tables in database
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="GigShield API",
    description="AI-Powered Parametric Insurance for India's Gig Economy",
    version="1.0.0"
)

# Allow frontend to talk to backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint - check if server is running
@app.get("/")
def root():
    return {
        "message": "GigShield API is running!",
        "version": "1.0.0",
        "status": "active"
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "service": "GigShield Insurance Platform"
    }