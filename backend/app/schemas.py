from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Translatable fields as stored in the database / edited in the admin:
# {"en": "...", "fr": "..."} (or lists of strings per language).
I18nStr = dict[str, str]
I18nList = dict[str, list[str]]


# ---------- Auth ----------

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class EmailChange(BaseModel):
    password: str
    new_email: EmailStr


# ---------- Public (language-resolved) schemas ----------

class PublicSettings(BaseModel):
    full_name: str
    headline: str
    tagline: str
    hero_subtitle: str
    availability: str
    impacts: list[str]
    about_title: str
    about_paragraphs: list[str]
    principles: list[str]
    email: str
    phone: str
    linkedin_url: str
    github_url: str
    cv_url: str
    contact_lead: str


class PublicStackItem(BaseModel):
    id: int
    category: str
    name: str
    sort_order: int


class PublicProject(BaseModel):
    id: int
    slug: str
    visual: str
    title: str
    role: str
    summary: str
    highlights: list[str]
    context: str
    problem: str
    approach: str
    contributions: list[str]
    learnings: str
    tags: list[str]
    sort_order: int


class PublicExperience(BaseModel):
    id: int
    title: str
    organization: str
    period: str
    bullets: list[str]
    sort_order: int


class PublicValueProp(BaseModel):
    id: int
    title: str
    description: str
    sort_order: int


class PortfolioContent(BaseModel):
    settings: PublicSettings
    stack: list[PublicStackItem]
    projects: list[PublicProject]
    experiences: list[PublicExperience]
    values: list[PublicValueProp]


# ---------- Admin (raw i18n) schemas ----------

class SiteSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    full_name: str
    headline: I18nStr
    tagline: I18nStr
    hero_subtitle: I18nStr
    availability: I18nStr
    impacts: I18nList
    about_title: I18nStr
    about_paragraphs: I18nList
    principles: I18nList
    email: str
    phone: str
    linkedin_url: str
    github_url: str
    cv_url: I18nStr
    contact_lead: I18nStr


class SiteSettingsUpdate(BaseModel):
    full_name: str | None = None
    headline: I18nStr | None = None
    tagline: I18nStr | None = None
    hero_subtitle: I18nStr | None = None
    availability: I18nStr | None = None
    impacts: I18nList | None = None
    about_title: I18nStr | None = None
    about_paragraphs: I18nList | None = None
    principles: I18nList | None = None
    email: str | None = None
    phone: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    cv_url: I18nStr | None = None
    contact_lead: I18nStr | None = None


class StackItemBase(BaseModel):
    category: I18nStr
    name: str
    sort_order: int = 0


class StackItemOut(StackItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ProjectBase(BaseModel):
    slug: str
    visual: str = "dashboard"
    title: I18nStr
    role: I18nStr = {}
    summary: I18nStr = {}
    highlights: I18nList = {}
    context: I18nStr = {}
    problem: I18nStr = {}
    approach: I18nStr = {}
    contributions: I18nList = {}
    learnings: I18nStr = {}
    tags: list[str] = []
    featured: bool = True
    sort_order: int = 0


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ExperienceBase(BaseModel):
    title: I18nStr
    organization: I18nStr = {}
    period: I18nStr = {}
    bullets: I18nList = {}
    sort_order: int = 0


class ExperienceOut(ExperienceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ValuePropBase(BaseModel):
    title: I18nStr
    description: I18nStr = {}
    sort_order: int = 0


class ValuePropOut(ValuePropBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Admin dashboard ----------

class MessageStats(BaseModel):
    total: int
    unread: int
    french: int
    english: int


class ProjectStats(BaseModel):
    total: int
    visible: int


class TranslationGaps(BaseModel):
    settings: int
    projects: int
    experiences: int
    values: int
    stack: int

    @property
    def total(self) -> int:  # convenience for the API consumer
        return self.settings + self.projects + self.experiences + self.values + self.stack


class AdminStats(BaseModel):
    messages: MessageStats
    projects: ProjectStats
    experiences: int
    stack_items: int
    values: int
    translation_gaps: TranslationGaps
    latest_messages: list["ContactMessageOut"]


# ---------- Contact ----------

class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    subject: str = Field(default="", max_length=255)
    body: str = Field(min_length=10, max_length=5000)
    language: Literal["en", "fr"] = "en"
    challenge: str = ""      # signed time-trap token from /api/contact/challenge
    website: str = ""        # honeypot — humans never see this field


class ContactMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    subject: str
    body: str
    language: str
    created_at: datetime
    read: bool
