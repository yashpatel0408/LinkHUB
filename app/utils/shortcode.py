import secrets
import string

from sqlalchemy.orm import Session

from app.models.link import Link

ALPHABET = string.ascii_letters + string.digits


def generate_unique_shortcode(db: Session, length: int = 6, max_attempts: int = 10) -> str:
    """Random 6-character code banata hai, agar collision ho to retry karta hai."""
    for _ in range(max_attempts):
        code = "".join(secrets.choice(ALPHABET) for _ in range(length))
        exists = db.query(Link).filter(Link.short_code == code).first()
        if not exists:
            return code
    raise RuntimeError("Could not generate a unique shortcode, try again.")