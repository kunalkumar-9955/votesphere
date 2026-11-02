from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.database import engine, Base
import app.models  # noqa: F401 - ensure all models are registered


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (use Alembic in production)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="VoteSphere API",
    description="All-in-One Smart Voting & Election Management Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from app.api.auth import router as auth_router
from app.api.organizations import router as org_router
from app.api.elections import router as election_router
from app.api.analytics import router as analytics_router
from app.api.biometric import router as biometric_router
from app.api.google_auth import router as google_auth_router

app.include_router(auth_router, prefix="/api")
app.include_router(google_auth_router, prefix="/api")
app.include_router(org_router, prefix="/api")
app.include_router(election_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(biometric_router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "VoteSphere API", "version": "1.0.0"}
