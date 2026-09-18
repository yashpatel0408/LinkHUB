from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.database import Base, engine
from app.core.limiter import limiter
from app import models
from app.routers import auth, links, redirect, analytics, bio

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LinkHub — Branded Short-Link & Bio-Link Hub")
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