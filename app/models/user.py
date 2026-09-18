from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # bio page ke liye — /bio/username
    username = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, default="")
    avatar_url = Column(String, default="")
    bio_text = Column(String, default="")
    theme = Column(String, default="minimal_light")  # minimal_light | dark_slate | gradient

    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)

    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    links = relationship("Link", back_populates="owner", cascade="all, delete-orphan")
    social_links = relationship("SocialLink", back_populates="owner", cascade="all, delete-orphan")