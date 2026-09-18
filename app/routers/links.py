from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.link import Link
from app.models.click import Click
from app.models.user import User
from app.schemas.link import LinkCreateRequest, LinkResponse
from app.utils.shortcode import generate_unique_shortcode
import io
import qrcode
from fastapi.responses import StreamingResponse
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from app.core.limiter import limiter

router = APIRouter(prefix="/links", tags=["links"])


def _to_response(link: Link, db: Session) -> LinkResponse:
    total_clicks = db.query(func.count(Click.id)).filter(Click.link_id == link.id).scalar() or 0
    return LinkResponse(
        id=link.id,
        short_code=link.short_code,
        short_url=f"{settings.BASE_URL}/r/{link.short_code}",
        destination_url=link.destination_url,
        created_at=link.created_at,
        total_clicks=total_clicks,
    )


@router.post("", response_model=LinkResponse, status_code=201)
@limiter.limit("20/minute")
def create_link(
    request:Request,
    payload: LinkCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.custom_slug:
        exists = db.query(Link).filter(Link.short_code == payload.custom_slug).first()
        if exists:
            raise HTTPException(400, "This custom slug is already taken")
        code = payload.custom_slug
    else:
        code = generate_unique_shortcode(db)

    link = Link(
        owner_id=current_user.id,
        short_code=code,
        destination_url=str(payload.destination_url),
        is_custom_slug=bool(payload.custom_slug),
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return _to_response(link, db)


@router.get("", response_model=list[LinkResponse])
def list_links(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Link).filter(Link.owner_id == current_user.id)
    if search:
        like = f"%{search}%"
        query = query.filter(Link.destination_url.ilike(like) | Link.short_code.ilike(like))

    links = (
        query.order_by(Link.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return [_to_response(link, db) for link in links]


@router.delete("/{link_id}", status_code=204)
def delete_link(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    link = db.query(Link).filter(Link.id == link_id, Link.owner_id == current_user.id).first()
    if not link:
        raise HTTPException(404, "Link not found")
    db.delete(link)
    db.commit()
    return None
@router.get("/{link_id}/qrcode")
def get_qrcode(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    link = db.query(Link).filter(Link.id == link_id, Link.owner_id == current_user.id).first()
    if not link:
        raise HTTPException(404, "Link not found")

    short_url = f"{settings.BASE_URL}/r/{link.short_code}"
    img = qrcode.make(short_url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")