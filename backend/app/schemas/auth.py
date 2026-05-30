from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10, max_length=255)
    new_password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    email_verified: bool
    created_at: datetime

    # Profile fields — all optional. Frontend uses these to render the
    # avatar / display name and the editable Settings page.
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    role: Optional[str] = None
    website_url: Optional[str] = None
    soundcloud_url: Optional[str] = None
    spotify_url: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    """Partial update — only fields the user actually changes are sent."""
    display_name: Optional[str] = Field(default=None, max_length=120)
    bio: Optional[str] = Field(default=None, max_length=2000)
    avatar_url: Optional[str] = Field(default=None, max_length=1_500_000)  # ~1MB data URL ceiling
    location: Optional[str] = Field(default=None, max_length=120)
    role: Optional[str] = Field(default=None, max_length=80)
    website_url: Optional[str] = Field(default=None, max_length=255)
    soundcloud_url: Optional[str] = Field(default=None, max_length=255)
    spotify_url: Optional[str] = Field(default=None, max_length=255)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    message: str


class VerifyEmailResponse(BaseModel):
    message: str
    already_verified: bool


class GoogleLoginRequest(BaseModel):
    # Google OAuth 2.0 access token obtained from the frontend after a
    # successful Google sign-in popup. Backend verifies it by hitting
    # Google's userinfo endpoint and trusts the email returned there.
    access_token: str = Field(min_length=10, max_length=4096)
