from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.database import Base, engine
from app.core.limiter import limiter
from app import models  # noqa: F401 — registers models with Base before create_all
from app.routers import auth, links, redirect, analytics, bio

# Creates tables if they don't exist yet (fine for dev / SQLite; use Alembic for prod migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LinkHub — Branded Short-Link & Bio-Link Hub")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(auth.router)
app.include_router(links.router)
app.include_router(analytics.router)
app.include_router(bio.router)
app.include_router(redirect.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "linkhub"}