from datetime import datetime, timedelta, timezone

import requests
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session
from app.core.security import (
    create_access_token,
    decode_access_token,
    generate_url_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    GoogleLoginRequest,
    LoginRequest,
    MessageResponse,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
    UserUpdateRequest,
    VerifyEmailResponse,
)
from app.services.email_service import (
    send_oauth_welcome_email,
    send_password_reset_email,
    send_verification_email,
)

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)

RESET_TOKEN_TTL = timedelta(hours=1)
GENERIC_FORGOT_MESSAGE = "If an account exists for that email, a reset link has been sent."


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def _normalize_email(email: str) -> str:
    return email.strip().lower()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    payload: SignupRequest,
    background: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> TokenResponse:
    email = _normalize_email(payload.email)

    existing = (await session.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with that email already exists.")

    verification_token = generate_url_token()
    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        email_verified=False,
        verification_token=verification_token,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    background.add_task(send_verification_email, email, verification_token)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    session: AsyncSession = Depends(get_session),
) -> TokenResponse:
    email = _normalize_email(payload.email)
    user = (await session.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> MessageResponse:
    email = _normalize_email(payload.email)
    user = (await session.execute(select(User).where(User.email == email))).scalar_one_or_none()

    if user is not None:
        reset_token = generate_url_token()
        user.reset_token = reset_token
        user.reset_token_expires = datetime.now(timezone.utc) + RESET_TOKEN_TTL
        await session.commit()
        background.add_task(send_password_reset_email, email, reset_token)

    return MessageResponse(message=GENERIC_FORGOT_MESSAGE)


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    session: AsyncSession = Depends(get_session),
) -> MessageResponse:
    user = (
        await session.execute(select(User).where(User.reset_token == payload.token))
    ).scalar_one_or_none()

    if user is None or user.reset_token_expires is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link.")

    expires = user.reset_token_expires
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link.")

    user.hashed_password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    await session.commit()

    return MessageResponse(message="Password updated. You can now log in.")


@router.get("/verify-email", response_model=VerifyEmailResponse)
async def verify_email(
    token: str = Query(..., min_length=10, max_length=255),
    session: AsyncSession = Depends(get_session),
) -> VerifyEmailResponse:
    # Idempotent: re-clicking the verification link (or React StrictMode
    # firing useEffect twice in dev) should still return success.
    user = (
        await session.execute(select(User).where(User.verification_token == token))
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification link.")

    already_verified = user.email_verified
    if not already_verified:
        user.email_verified = True
        await session.commit()

    return VerifyEmailResponse(
        message="Email already verified." if already_verified else "Email verified.",
        already_verified=already_verified,
    )


@router.post("/google", response_model=TokenResponse)
async def google_login(
    payload: GoogleLoginRequest,
    background: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> TokenResponse:
    """Exchange a Google OAuth access token for a PitchPal JWT.

    The frontend obtains the access token via the Google Identity Services
    popup. We verify it by hitting Google's own userinfo endpoint — that
    confirms the token is genuine and lets us extract the email + verified
    flag without storing the user's Google password.
    """
    try:
        resp = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {payload.access_token}"},
            timeout=10,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach Google to verify sign-in. Please try again.",
        ) from exc

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google sign-in could not be verified. Please try again.",
        )

    info = resp.json() or {}
    raw_email = info.get("email")
    if not raw_email or not info.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your Google account email is not verified.",
        )

    email = _normalize_email(raw_email)

    user = (await session.execute(select(User).where(User.email == email))).scalar_one_or_none()

    if user is None:
        # First time sign-in via Google — provision a new account. We store an
        # unusable random hash for the password column so password login can't
        # accidentally succeed; they can switch to password via "Forgot
        # password" later if they want both methods.
        user = User(
            email=email,
            hashed_password=hash_password(generate_url_token()),
            email_verified=True,  # Google has already verified the email
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        # First-time sign-up via Google → send a welcome email (no verify link
        # needed since Google already verified the address).
        background.add_task(send_oauth_welcome_email, email, "Google")
    elif not user.email_verified:
        # Existing PitchPal account that signed up with password but never
        # verified — Google's verification covers ours, so flip the flag.
        user.email_verified = True
        await session.commit()
        await session.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> UserResponse:
    """Partial profile update — only fields present in the payload are
    applied. Empty strings are treated as "clear this field"."""
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        # Normalise: empty string → None so the field reads as "unset" both
        # in the DB and in subsequent /me responses.
        if isinstance(value, str) and value.strip() == "":
            value = None
        setattr(current_user, field, value)
    await session.commit()
    await session.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/me/change-password", response_model=MessageResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> MessageResponse:
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    current_user.hashed_password = hash_password(payload.new_password)
    await session.commit()
    return MessageResponse(message="Password updated.")
