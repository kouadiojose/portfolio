"""Database models.

Translatable text fields are JSON columns holding {"en": ..., "fr": ...}
dicts (lists of strings for *_list fields) — see app/i18n.py.
"""
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))


class SiteSettings(Base):
    """Single-row table holding the editable global content of the site."""

    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120), default="")
    headline: Mapped[dict] = mapped_column(JSON, default=dict)        # i18n str
    tagline: Mapped[dict] = mapped_column(JSON, default=dict)         # i18n str — hero strong phrase
    hero_subtitle: Mapped[dict] = mapped_column(JSON, default=dict)   # i18n str
    availability: Mapped[dict] = mapped_column(JSON, default=dict)    # i18n str
    impacts: Mapped[dict] = mapped_column(JSON, default=dict)         # i18n list — impact strip
    about_title: Mapped[dict] = mapped_column(JSON, default=dict)     # i18n str
    about_paragraphs: Mapped[dict] = mapped_column(JSON, default=dict)  # i18n list
    principles: Mapped[dict] = mapped_column(JSON, default=dict)      # i18n list — "How I work"
    email: Mapped[str] = mapped_column(String(255), default="")
    phone: Mapped[str] = mapped_column(String(40), default="")
    linkedin_url: Mapped[str] = mapped_column(String(255), default="")
    github_url: Mapped[str] = mapped_column(String(255), default="")
    cv_url: Mapped[dict] = mapped_column(JSON, default=dict)          # i18n str — per-language CV file
    contact_lead: Mapped[dict] = mapped_column(JSON, default=dict)    # i18n str


class StackItem(Base):
    __tablename__ = "stack_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category: Mapped[dict] = mapped_column(JSON, default=dict)  # i18n str
    name: Mapped[str] = mapped_column(String(80))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    visual: Mapped[str] = mapped_column(String(40), default="dashboard")  # decorative visual key
    title: Mapped[dict] = mapped_column(JSON, default=dict)          # i18n str
    role: Mapped[dict] = mapped_column(JSON, default=dict)           # i18n str
    summary: Mapped[dict] = mapped_column(JSON, default=dict)        # i18n str — card description
    highlights: Mapped[dict] = mapped_column(JSON, default=dict)     # i18n list — card impacts (max 3)
    # Case study fields
    context: Mapped[dict] = mapped_column(JSON, default=dict)        # i18n str
    problem: Mapped[dict] = mapped_column(JSON, default=dict)        # i18n str
    approach: Mapped[dict] = mapped_column(JSON, default=dict)       # i18n str — technical approach
    contributions: Mapped[dict] = mapped_column(JSON, default=dict)  # i18n list — key contributions
    learnings: Mapped[dict] = mapped_column(JSON, default=dict)      # i18n str — learned / business value
    tags: Mapped[list] = mapped_column(JSON, default=list)           # plain list (tech names)
    featured: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[dict] = mapped_column(JSON, default=dict)      # i18n str
    organization: Mapped[dict] = mapped_column(JSON, default=dict)  # i18n str
    period: Mapped[dict] = mapped_column(JSON, default=dict)     # i18n str
    bullets: Mapped[dict] = mapped_column(JSON, default=dict)    # i18n list
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class ValueProp(Base):
    __tablename__ = "value_props"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[dict] = mapped_column(JSON, default=dict)        # i18n str
    description: Mapped[dict] = mapped_column(JSON, default=dict)  # i18n str
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class PageView(Base):
    """Privacy-friendly analytics: no raw IP or user agent is stored.

    `visitor` is a salted daily hash of ip+user-agent, so unique visitors can
    be counted per day without any personally identifiable data at rest.
    """

    __tablename__ = "page_views"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    path: Mapped[str] = mapped_column(String(300), index=True)
    language: Mapped[str] = mapped_column(String(5), default="en")
    visitor: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(255), default="")
    body: Mapped[str] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(5), default="en")  # visitor's preferred language
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
