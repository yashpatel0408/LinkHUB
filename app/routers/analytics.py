from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.click import Click
from app.models.link import Link
from app.models.user import User
from app.schemas.link import LinkAnalyticsResponse, ClickMetric, DeviceMetric, ReferrerMetric

router = APIRouter(prefix="/links", tags=["analytics"])


@router.get("/{link_id}/analytics", response_model=LinkAnalyticsResponse)
def get_link_analytics(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    link = db.query(Link).filter(Link.id == link_id, Link.owner_id == current_user.id).first()
    if not link:
        raise HTTPException(404, "Link not found")

    total_clicks = db.query(func.count(Click.id)).filter(Click.link_id == link_id).scalar() or 0

    # Click date ke hisaab se group karo
    date_expr = func.date(Click.timestamp)
    clicks_over_time = (
        db.query(date_expr.label("date"), func.count(Click.id).label("count"))
        .filter(Click.link_id == link_id)
        .group_by(date_expr)
        .order_by(date_expr)
        .all()
    )

    device_breakdown = (
        db.query(Click.device_type, func.count(Click.id).label("count"))
        .filter(Click.link_id == link_id)
        .group_by(Click.device_type)
        .all()
    )

    top_referrers = (
        db.query(Click.referrer, func.count(Click.id).label("count"))
        .filter(Click.link_id == link_id)
        .group_by(Click.referrer)
        .order_by(func.count(Click.id).desc())
        .limit(5)
        .all()
    )

    return LinkAnalyticsResponse(
        total_clicks=total_clicks,
        clicks_over_time=[ClickMetric(date=str(d), count=c) for d, c in clicks_over_time],
        device_breakdown=[DeviceMetric(device_type=d or "Unknown", count=c) for d, c in device_breakdown],
        top_referrers=[ReferrerMetric(referrer=r or "Direct", count=c) for r, c in top_referrers],
    )