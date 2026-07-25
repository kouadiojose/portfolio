"""Helpers for first-party analytics."""
import hashlib
from datetime import datetime, timezone

from .config import get_settings


def visitor_hash(ip: str, user_agent: str) -> str:
    """Salted daily hash — counts unique daily visitors without storing PII.

    The salt rotates every day, so hashes cannot be correlated across days
    or reversed into an IP address.
    """
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    salt = get_settings().secret_key
    raw = f"{ip}|{user_agent}|{day}|{salt}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]
