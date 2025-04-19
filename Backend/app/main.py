from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .core.database import connect_to_mongo, close_mongo_connection
from .core.config import settings
from .routers import advertisement, auth, borrowers, cards, loans, notifications, support
from .routers import payments, users

app = FastAPI(
    title=settings.APP_NAME,
    description="API for loan management system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

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

@app.get("/")
async def root():
    return {"message": "Welcome to the Loan Management API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
