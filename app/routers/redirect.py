from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, get_db
from app.models.link import Link
from app.models.click import Click
from app.utils.request_meta import detect_device_type, hash_ip
from app.core.limiter import limiter

router = APIRouter(tags=["redirect"])


def _log_click(link_id: int, referrer: str | None, user_agent: str, ip: str):
    """Response bhejne ke BAAD chalta hai — user ka redirect isse slow nahi hota."""
    db = SessionLocal()
    try:
        click = Click(
            link_id=link_id,
            referrer=referrer,
            device_type=detect_device_type(user_agent),
            ip_hash=hash_ip(ip),
        )
        db.add(click)
        db.commit()
    finally:
        db.close()


@router.get("/r/{short_code}")
@limiter.limit("60/minute")
def redirect_to_destination(
    short_code: str,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        raise HTTPException(404, "Short link not found")

    background_tasks.add_task(
        _log_click,
        link_id=link.id,
        referrer=request.headers.get("referer"),
        user_agent=request.headers.get("user-agent", ""),
        ip=request.client.host if request.client else "unknown",
    )

    # 302 = temporary redirect, PDF ki spec yehi maangti hai
    return RedirectResponse(url=link.destination_url, status_code=302)