# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import router as api_router
from core.database import create_db_and_tables

# Create database tables on startup
create_db_and_tables()

app = FastAPI(title="AI Interviewer Backend")

# CORS middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",  # For standard development
        "https://localhost:3001", # For HTTPS development (camera access)
    ],  # The origin of your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Interviewer API"}