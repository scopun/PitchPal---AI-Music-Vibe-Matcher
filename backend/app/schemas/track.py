from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class TrackSummaryResponse(BaseModel):
    """Lightweight Track shape for list views (no match_data blob)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    bpm: Optional[int] = None
    energy: Optional[float] = None
    detected_genre: Optional[str] = None
    detected_language: Optional[str] = None
    lyrics_extracted: bool
    genre_tags: Optional[list[str]] = None
    matches_count: int = 0
    pitches_count: int = 0
    created_at: datetime


class TrackDetailResponse(BaseModel):
    """Full Track shape including the saved match_data JSON."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    bpm: Optional[int] = None
    energy: Optional[float] = None
    detected_genre: Optional[str] = None
    detected_language: Optional[str] = None
    lyrics_extracted: bool
    genre_tags: Optional[list[str]] = None
    match_data: Optional[dict[str, Any]] = None
    created_at: datetime


class PitchCreateRequest(BaseModel):
    track_id: int
    artist_name: str = Field(min_length=1, max_length=255)
    artist_image: Optional[str] = Field(default=None, max_length=512)
    label: Optional[str] = Field(default=None, max_length=255)
    territory: Optional[str] = Field(default=None, max_length=100)
    source: Optional[str] = Field(default=None, max_length=100)
    final_score: float = Field(ge=0.0, le=1.0)
    confidence_level: Optional[str] = Field(default=None, max_length=64)


class PitchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    track_id: int
    track_filename: Optional[str] = None
    artist_name: str
    artist_image: Optional[str] = None
    label: Optional[str] = None
    territory: Optional[str] = None
    source: Optional[str] = None
    final_score: float
    confidence_level: Optional[str] = None
    status: str
    created_at: datetime
