from datetime import datetime

from pydantic import BaseModel, HttpUrl, Field


class LinkCreateRequest(BaseModel):
    destination_url: HttpUrl
    custom_slug: str | None = Field(default=None, min_length=3, max_length=30)


class LinkResponse(BaseModel):
    id: int
    short_code: str
    short_url: str
    destination_url: str
    created_at: datetime
    total_clicks: int = 0

    class Config:
        from_attributes = True
class ClickMetric(BaseModel):
    date: str
    count: int


class DeviceMetric(BaseModel):
    device_type: str
    count: int


class ReferrerMetric(BaseModel):
    referrer: str
    count: int


class LinkAnalyticsResponse(BaseModel):
    total_clicks: int
    clicks_over_time: list[ClickMetric]
    device_breakdown: list[DeviceMetric]
    top_referrers: list[ReferrerMetric]