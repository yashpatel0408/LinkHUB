from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.link import SocialLink
from app.models.user import User
from app.schemas.bio import BioProfileUpdate, BioPublicResponse, SocialLinkIn, SocialLinkOut

router = APIRouter(tags=["bio"])


@router.put("/bio/me", response_model=BioPublicResponse)
def update_my_profile(
    payload: BioProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/bio/me/social-links", response_model=SocialLinkOut, status_code=201)
def add_social_link(
    payload: SocialLinkIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    social = SocialLink(owner_id=current_user.id, **payload.model_dump())
    db.add(social)
    db.commit()
    db.refresh(social)
    return social


@router.delete("/bio/me/social-links/{social_id}", status_code=204)
def delete_social_link(
    social_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    social = db.query(SocialLink).filter(
        SocialLink.id == social_id, SocialLink.owner_id == current_user.id
    ).first()
    if not social:
        raise HTTPException(404, "Social link not found")
    db.delete(social)
    db.commit()
    return None


@router.get("/bio/{username}", response_model=BioPublicResponse)
def get_public_bio(username: str, db: Session = Depends(get_db)):
    """Koi bhi dekh sakta hai, login zaroori nahi."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(404, "Profile not found")
    return user