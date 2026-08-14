"""Layered, keyless anti-spam for the public contact form.

1. Honeypot   — hidden form field only bots fill in (handled in the router:
                the submission is silently discarded with a fake success).
2. Time trap  — the form fetches a signed challenge token when the page
                loads; submissions faster than MIN_FORM_SECONDS (bot-like)
                or with a missing/forged/expired token are rejected.
3. Rate limit — per-IP sliding window, backed by the database (see
                RateLimitHit) so the limit holds across multiple API
                instances/workers, not just within one process.
4. Content    — messages stuffed with links are rejected.
"""
import hashlib
import time
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

from .config import get_settings
from .models import RateLimitHit

MIN_FORM_SECONDS = 3          # a human cannot read + fill the form faster
MAX_FORM_SECONDS = 2 * 3600   # stale tokens die after 2 hours
RATE_LIMIT = 5                # messages per window per IP
RATE_WINDOW_SECONDS = 3600
MAX_LINKS = 3


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def issue_challenge() -> str:
    settings = get_settings()
    payload = {"purpose": "contact", "iat": int(time.time())}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def verify_challenge(token: str) -> None:
    settings = get_settings()
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.jwt_algorithm]
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid form session — please reload the page.")
    if payload.get("purpose") != "contact":
        raise HTTPException(status_code=400, detail="Invalid form session — please reload the page.")
    age = time.time() - int(payload.get("iat", 0))
    if age < MIN_FORM_SECONDS:
        raise HTTPException(status_code=400, detail="Submitted too quickly — please try again.")
    if age > MAX_FORM_SECONDS:
        raise HTTPException(status_code=400, detail="Form session expired — please reload the page.")


def _ip_hash(ip: str) -> str:
    salt = get_settings().secret_key
    return hashlib.sha256(f"{ip}|{salt}".encode()).hexdigest()[:32]


def enforce_rate_limit(db: Session, ip: str) -> None:
    ip_hash = _ip_hash(ip)
    window_start = datetime.now(timezone.utc) - timedelta(seconds=RATE_WINDOW_SECONDS)

    # Rows outside the window are of no use to anyone — drop them here so
    # the table never accumulates more than a window's worth of hits.
    db.query(RateLimitHit).filter(RateLimitHit.created_at < window_start).delete()

    count = (
        db.query(func.count(RateLimitHit.id))
        .filter(RateLimitHit.ip_hash == ip_hash, RateLimitHit.created_at >= window_start)
        .scalar()
        or 0
    )
    if count >= RATE_LIMIT:
        db.commit()
        raise HTTPException(status_code=429, detail="Too many messages — please try again later.")

    db.add(RateLimitHit(ip_hash=ip_hash))
    db.commit()


def looks_like_spam(body: str) -> bool:
    lowered = body.lower()
    return lowered.count("http://") + lowered.count("https://") > MAX_LINKS
