from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..i18n import normalize_lang, resolve
from ..models import (
    ContactMessage,
    Experience,
    Project,
    SiteSettings,
    StackItem,
    ValueProp,
)

router = APIRouter(prefix="/api", tags=["public"])


def get_site_settings(db: Session) -> SiteSettings:
    settings = db.query(SiteSettings).first()
    if settings is None:
        raise HTTPException(status_code=503, detail="Site content not initialized")
    return settings


# ---------- Language resolution (i18n dict -> plain string/list) ----------

def _settings_public(s: SiteSettings, lang: str) -> schemas.PublicSettings:
    return schemas.PublicSettings(
        full_name=s.full_name,
        headline=resolve(s.headline, lang),
        tagline=resolve(s.tagline, lang),
        hero_subtitle=resolve(s.hero_subtitle, lang),
        availability=resolve(s.availability, lang),
        impacts=resolve(s.impacts, lang) or [],
        about_title=resolve(s.about_title, lang),
        about_paragraphs=resolve(s.about_paragraphs, lang) or [],
        principles=resolve(s.principles, lang) or [],
        email=s.email,
        linkedin_url=s.linkedin_url,
        github_url=s.github_url,
        cv_url=resolve(s.cv_url, lang),
        contact_lead=resolve(s.contact_lead, lang),
    )


def _project_public(p: Project, lang: str) -> schemas.PublicProject:
    return schemas.PublicProject(
        id=p.id,
        slug=p.slug,
        visual=p.visual,
        title=resolve(p.title, lang),
        role=resolve(p.role, lang),
        summary=resolve(p.summary, lang),
        highlights=resolve(p.highlights, lang) or [],
        context=resolve(p.context, lang),
        problem=resolve(p.problem, lang),
        approach=resolve(p.approach, lang),
        contributions=resolve(p.contributions, lang) or [],
        learnings=resolve(p.learnings, lang),
        tags=p.tags or [],
        sort_order=p.sort_order,
    )


def _experience_public(e: Experience, lang: str) -> schemas.PublicExperience:
    return schemas.PublicExperience(
        id=e.id,
        title=resolve(e.title, lang),
        organization=e.organization,
        period=resolve(e.period, lang),
        bullets=resolve(e.bullets, lang) or [],
        sort_order=e.sort_order,
    )


# ---------- Endpoints ----------

@router.get("/content", response_model=schemas.PortfolioContent)
def get_content(lang: str = Query("en"), db: Session = Depends(get_db)):
    """Aggregated payload used by the public site: one request, all content."""
    lang = normalize_lang(lang)
    return schemas.PortfolioContent(
        settings=_settings_public(get_site_settings(db), lang),
        stack=[
            schemas.PublicStackItem(
                id=i.id, category=resolve(i.category, lang), name=i.name, sort_order=i.sort_order
            )
            for i in db.query(StackItem).order_by(StackItem.sort_order).all()
        ],
        projects=[
            _project_public(p, lang)
            for p in db.query(Project)
            .filter(Project.featured.is_(True))
            .order_by(Project.sort_order)
            .all()
        ],
        experiences=[
            _experience_public(e, lang)
            for e in db.query(Experience).order_by(Experience.sort_order).all()
        ],
        values=[
            schemas.PublicValueProp(
                id=v.id,
                title=resolve(v.title, lang),
                description=resolve(v.description, lang),
                sort_order=v.sort_order,
            )
            for v in db.query(ValueProp).order_by(ValueProp.sort_order).all()
        ],
    )


@router.get("/projects/{slug}", response_model=schemas.PublicProject)
def get_project(slug: str, lang: str = Query("en"), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.slug == slug, Project.featured.is_(True)).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_public(project, normalize_lang(lang))


@router.post("/contact", status_code=status.HTTP_201_CREATED)
def send_message(payload: schemas.ContactCreate, db: Session = Depends(get_db)):
    message = ContactMessage(
        name=payload.name.strip(),
        email=payload.email,
        subject=payload.subject.strip(),
        body=payload.body.strip(),
        language=payload.language,
    )
    db.add(message)
    db.commit()
    return {"detail": "Message received."}
