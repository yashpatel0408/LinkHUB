from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Link(Base):
    __tablename__ = "links"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    short_code = Column(String, unique=True, index=True, nullable=False)
    destination_url = Column(String, nullable=False)
    is_custom_slug = Column(String, default=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="links")
    clicks = relationship("Click", back_populates="link", cascade="all, delete-orphan")


class SocialLink(Base):
    """Bio page pe dikhne wale social buttons (Instagram, Twitter, etc.)"""
    __tablename__ = "social_links"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    label = Column(String, nullable=False)   # e.g. "Instagram"
    url = Column(String, nullable=False)
    position = Column(Integer, default=0)    # display order

    owner = relationship("User", back_populates="social_links")