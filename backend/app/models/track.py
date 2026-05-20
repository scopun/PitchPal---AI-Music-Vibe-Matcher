from datetime import datetime
from typing import Any, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Track(Base):
    __tablename__ = "tracks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    bpm: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    energy: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    detected_genre: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    detected_language: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    lyrics_extracted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    genre_tags: Mapped[Optional[list[str]]] = mapped_column(JSONB, nullable=True)
    # Full backend response JSON — matches array, summary, pitch_angle, market_fit
    match_data: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    pitches: Mapped[list["Pitch"]] = relationship(
        "Pitch",
        back_populates="track",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Pitch(Base):
    __tablename__ = "pitches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    track_id: Mapped[int] = mapped_column(
        ForeignKey("tracks.id", ondelete="CASCADE"), index=True, nullable=False
    )
    artist_name: Mapped[str] = mapped_column(String(255), nullable=False)
    artist_image: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    label: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    territory: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    final_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    confidence_level: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="Sent", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    track: Mapped[Track] = relationship("Track", back_populates="pitches")
