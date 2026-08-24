"""
main.py — FastAPI application entry point.
Sets up CORS, includes all routers, and creates DB tables on startup.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routes import entries, flagged, stats, scan


# ─────────────────────────────────────────────
# Lifespan: create DB tables on startup
# ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all tables in Supabase/PostgreSQL if they don't already exist."""
    Base.metadata.create_all(bind=engine)
    yield


# ─────────────────────────────────────────────
# App initialization
# ─────────────────────────────────────────────

app = FastAPI(
    title="DataPure API",
    description="Data Redundancy Removal System — Two-layer duplicate detection for cloud databases.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Vite dev server to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Fallback
        "*",                      # Allows all for demo (restrict in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Include routers
# ─────────────────────────────────────────────

app.include_router(entries.router)
app.include_router(flagged.router)
app.include_router(stats.router)
app.include_router(scan.router)


# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "DataPure API", "version": "1.0.0"}
