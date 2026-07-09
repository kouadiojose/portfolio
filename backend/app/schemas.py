from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


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


# ---------- Site settings ----------

class Fact(BaseModel):
    label: str
    value: str


class SiteSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    full_name: str
    headline: str
    hero_eyebrow: str
    hero_subtitle: str
    availability: str
    about_title: str
    about_paragraphs: list[str]
    facts: list[Fact]
    email: str
    linkedin_url: str
    github_url: str
    cv_url: str
    contact_lead: str


class SiteSettingsUpdate(BaseModel):
    full_name: str | None = None
    headline: str | None = None
    hero_eyebrow: str | None = None
    hero_subtitle: str | None = None
    availability: str | None = None
    about_title: str | None = None
    about_paragraphs: list[str] | None = None
    facts: list[Fact] | None = None
    email: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    cv_url: str | None = None
    contact_lead: str | None = None


# ---------- Content entities ----------

class ExpertiseBase(BaseModel):
    title: str
    description: str = ""
    icon: str = "app"
    sort_order: int = 0


class ExpertiseOut(ExpertiseBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class StackItemBase(BaseModel):
    category: str
    name: str
    sort_order: int = 0


class StackItemOut(StackItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ProjectBase(BaseModel):
    slug: str
    title: str
    role: str = ""
    summary: str = ""
    context: str = ""
    highlights: list[str] = []
    tags: list[str] = []
    featured: bool = True
    sort_order: int = 0


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ExperienceBase(BaseModel):
    title: str
    organization: str = ""
    period: str = ""
    bullets: list[str] = []
    sort_order: int = 0


class ExperienceOut(ExperienceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ValuePropBase(BaseModel):
    title: str
    description: str = ""
    sort_order: int = 0


class ValuePropOut(ValuePropBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


# ---------- Contact ----------

class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    subject: str = Field(default="", max_length=255)
    body: str = Field(min_length=10, max_length=5000)


class ContactMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    subject: str
    body: str
    created_at: datetime
    read: bool


# ---------- Aggregated public payload ----------

class PortfolioContent(BaseModel):
    settings: SiteSettingsOut
    expertise: list[ExpertiseOut]
    stack: list[StackItemOut]
    projects: list[ProjectOut]
    experiences: list[ExperienceOut]
    values: list[ValuePropOut]
