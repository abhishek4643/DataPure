"""
main.py — FastAPI application entry point.

DataPure API:
- Configures CORS
- Includes all API routers
- Creates database tables during application startup
- Provides a health-check endpoint
"""

import sys
print("=== DATAPURE: ENTERING MAIN.PY ===", flush=True)

from contextlib import asynccontextmanager

try:
    print("=== DATAPURE: IMPORTING FASTAPI ===", flush=True)
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    print("=== DATAPURE: IMPORTING DATABASE ===", flush=True)
    from database import engine
    from models import Base
    
    print("=== DATAPURE: IMPORTING ROUTES ===", flush=True)
    from routes import entries, flagged, stats, scan
    print("=== DATAPURE: IMPORTS SUCCESSFUL ===", flush=True)
except Exception as e:
    print(f"=== DATAPURE FATAL IMPORT ERROR: {e} ===", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(3)

# ─────────────────────────────────────────────
# Application lifespan
# ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup/shutdown lifecycle.

    During startup, verify the database connection and
    create any missing SQLAlchemy tables.
    """

    print("========================================")
    print("DataPure: starting application...")
    print("DataPure: connecting to database...")
    print("========================================")

    try:
        # Create database tables if they don't already exist.
        Base.metadata.create_all(bind=engine)

        print("DataPure: database connection successful.")
        print("DataPure: database tables verified.")
        print("DataPure: application startup complete.")

    except Exception as exc:
        print("========================================")
        print("DataPure: DATABASE STARTUP ERROR")
        print(f"Error type: {type(exc).__name__}")
        print(f"Error: {exc}")
        print("========================================")

        # Re-raise the exception so the deployment system
        # correctly reports the startup failure.
        raise

    yield

    print("========================================")
    print("DataPure: application shutting down...")
    print("========================================")


# ─────────────────────────────────────────────
# FastAPI application
# ─────────────────────────────────────────────

app = FastAPI(
    title="DataPure API",
    description=(
        "Data Redundancy Removal System — "
        "Two-layer duplicate detection for cloud databases."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# API routers
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
    """
    Basic API health check.
    """
    return {
        "status": "ok",
        "service": "DataPure API",
        "version": "1.0.0",
    }