"""Layered, keyless anti-spam for the public contact form.

1. Honeypot   — hidden form field only bots fill in (handled in the router:
                the submission is silently discarded with a fake success).
2. Time trap  — the form fetches a signed challenge token when the page
                loads; submissions faster than MIN_FORM_SECONDS (bot-like)
                or with a missing/forged/expired token are rejected.
3. Rate limit — per-IP sliding window, in-memory (single-instance deploy).
4. Content    — messages stuffed with links are rejected.
"""
import threading
import time
from collections import defaultdict, deque

import jwt
from fastapi import HTTPException, Request

from .config import get_settings

MIN_FORM_SECONDS = 3          # a human cannot read + fill the form faster
MAX_FORM_SECONDS = 2 * 3600   # stale tokens die after 2 hours
RATE_LIMIT = 5                # messages per window per IP
RATE_WINDOW_SECONDS = 3600
MAX_LINKS = 3

_lock = threading.Lock()
_hits: dict[str, deque] = defaultdict(deque)


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


def enforce_rate_limit(ip: str) -> None:
    now = time.time()
    with _lock:
        hits = _hits[ip]
        while hits and now - hits[0] > RATE_WINDOW_SECONDS:
            hits.popleft()
        if len(hits) >= RATE_LIMIT:
            raise HTTPException(status_code=429, detail="Too many messages — please try again later.")
        hits.append(now)


def looks_like_spam(body: str) -> bool:
    lowered = body.lower()
    return lowered.count("http://") + lowered.count("https://") > MAX_LINKS
