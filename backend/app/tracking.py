"""Helpers for first-party analytics.

Privacy model: the raw IP and user agent are used in-memory at collection
time only — the IP becomes a country code (local GeoIP lookup, no external
service) plus a salted daily hash, the user agent is reduced to
browser/OS/device families. Nothing personally identifiable is stored.
"""
import hashlib
import os
import re
from datetime import datetime, timezone
from functools import lru_cache

from .config import get_settings

GEOIP_DB_PATH = os.environ.get(
    "GEOIP_DB_PATH",
    os.path.join(os.path.dirname(__file__), "data", "dbip-country.mmdb"),
)


def visitor_hash(ip: str, user_agent: str) -> str:
    """Salted daily hash — counts unique daily visitors without storing PII.

    The salt rotates every day, so hashes cannot be correlated across days
    or reversed into an IP address.
    """
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    salt = get_settings().secret_key
    raw = f"{ip}|{user_agent}|{day}|{salt}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


@lru_cache(maxsize=1)
def _geoip_reader():
    """Open the bundled DB-IP country database once (IP Geolocation by DB-IP,
    https://db-ip.com — CC BY 4.0). Returns None when the file is absent so
    tracking keeps working without geolocation."""
    try:
        import maxminddb

        return maxminddb.open_database(GEOIP_DB_PATH)
    except Exception:
        return None


def lookup_country(ip: str) -> str:
    """ISO 3166-1 alpha-2 country code for an IP, or "" when unknown."""
    reader = _geoip_reader()
    if reader is None or not ip:
        return ""
    try:
        record = reader.get(ip) or {}
        # ip-location-db mmdb files use a flat {"country_code": "US"} layout,
        # MaxMind-style files nest it under {"country": {"iso_code": "US"}}.
        return (
            record.get("country_code")
            or (record.get("country") or {}).get("iso_code")
            or ""
        )
    except Exception:
        return ""


# ---------- Tiny in-house user-agent parser (families only) ----------

_BOT_RE = re.compile(
    r"bot|crawler|spider|slurp|curl|wget|python-requests|httpx|scrapy|headless"
    r"|lighthouse|pingdom|uptime|monitor|preview|facebookexternalhit|whatsapp"
    r"|telegram|discord|embedly|scan",
    re.I,
)

_BROWSERS = [
    ("Edge", re.compile(r"Edg(?:e|A|iOS)?/", re.I)),
    ("Opera", re.compile(r"OPR/|Opera", re.I)),
    ("Samsung Internet", re.compile(r"SamsungBrowser/", re.I)),
    ("Chrome", re.compile(r"Chrome/|CriOS/", re.I)),
    ("Firefox", re.compile(r"Firefox/|FxiOS/", re.I)),
    ("Safari", re.compile(r"Safari/", re.I)),
]

_OSES = [
    ("Android", re.compile(r"Android", re.I)),
    ("iOS", re.compile(r"iPhone|iPad|iPod", re.I)),
    ("Windows", re.compile(r"Windows", re.I)),
    ("macOS", re.compile(r"Mac OS X|Macintosh", re.I)),
    ("Linux", re.compile(r"Linux|X11", re.I)),
]


def parse_user_agent(ua: str) -> tuple[str, str, str]:
    """Reduce a raw user agent to (browser, os, device) families.

    device is one of: desktop, mobile, tablet, bot, other.
    """
    ua = ua or ""
    if not ua.strip():
        return "", "", "other"
    if _BOT_RE.search(ua):
        return "Robot", "", "bot"

    browser = next((name for name, rx in _BROWSERS if rx.search(ua)), "Autre")
    os_name = next((name for name, rx in _OSES if rx.search(ua)), "Autre")

    if re.search(r"iPad|Tablet", ua, re.I) or (
        "Android" in ua and "Mobile" not in ua
    ):
        device = "tablet"
    elif re.search(r"Mobi|iPhone|iPod|Android", ua, re.I):
        device = "mobile"
    else:
        device = "desktop"
    return browser, os_name, device


def referrer_domain(referrer: str, own_hosts: set[str]) -> str:
    """Keep only the external referrer domain (e.g. "google.com"), "" otherwise."""
    from urllib.parse import urlparse

    if not referrer:
        return ""
    try:
        host = (urlparse(referrer).netloc or "").split(":")[0].lower()
    except Exception:
        return ""
    if not host or host in own_hosts or host.startswith(("localhost", "127.")):
        return ""
    return host.removeprefix("www.")[:200]
