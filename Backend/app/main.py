from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from datetime import datetime, timezone
import asyncio

from .core.database import connect_to_mongo, close_mongo_connection
from .core.config import settings
from .core.cloudinary_config import initialize_cloudinary
from .routers import advertisement, auth, borrowers, cards, loans, notifications, payments, risk_analysis, support, users
from .routers import lenders
from .utils.scheduled_tasks import start_background_tasks

app = FastAPI(
    title=settings.APP_NAME,
    description="API for loan management system",
    version="1.0.0"
)

# Update CORS middleware to be more permissive
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - allow all origins 
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    initialize_cloudinary()

@app.on_event("startup")
async def start_scheduler():
    # Start the background tasks
    asyncio.create_task(start_background_tasks())

@app.on_event("startup")
async def log_timezone_info():
    # Log timezone information for debugging
    print(f"Server timezone info: {datetime.now().astimezone().tzinfo}")
    print(f"UTC now: {datetime.now(timezone.utc)}")
    print(f"Local now: {datetime.now()}")
    print(f"TZ Environment Variable: {os.environ.get('TZ', 'Not set')}")

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include routers
app.include_router(auth.router)
app.include_router(borrowers.router)
app.include_router(loans.router)
app.include_router(advertisement.router)
app.include_router(payments.router)
app.include_router(cards.router)
app.include_router(notifications.router)
app.include_router(support.router)
app.include_router(users.router)
app.include_router(risk_analysis.router)
app.include_router(lenders.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Loan Management API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
