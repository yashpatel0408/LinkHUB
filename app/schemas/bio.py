from pydantic import BaseModel, Field


class SocialLinkIn(BaseModel):
    label: str
    url: str
    position: int = 0


class SocialLinkOut(SocialLinkIn):
    id: int

    class Config:
        from_attributes = True


class BioProfileUpdate(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None
    bio_text: str | None = None
    theme: str | None = Field(default=None, pattern="^(minimal_light|dark_slate|gradient)$")


class BioPublicResponse(BaseModel):
    username: str
    display_name: str
    avatar_url: str
    bio_text: str
    theme: str
    social_links: list[SocialLinkOut]

    class Config:
        from_attributes = True