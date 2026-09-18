from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Click(Base):
    __tablename__ = "clicks"

    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(Integer, ForeignKey("links.id"), nullable=False)

    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    referrer = Column(String, nullable=True)
    device_type = Column(String, default="Unknown")  # Mobile | Desktop | Tablet
    ip_hash = Column(String, nullable=True)

    link = relationship("Link", back_populates="clicks")