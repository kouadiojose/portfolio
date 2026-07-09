from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..models import (
    ContactMessage,
    Experience,
    ExpertiseItem,
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


@router.get("/content", response_model=schemas.PortfolioContent)
def get_content(db: Session = Depends(get_db)):
    """Aggregated payload used by the public site: one request, all content."""
    return schemas.PortfolioContent(
        settings=get_site_settings(db),
        expertise=db.query(ExpertiseItem).order_by(ExpertiseItem.sort_order).all(),
        stack=db.query(StackItem).order_by(StackItem.sort_order).all(),
        projects=(
            db.query(Project)
            .filter(Project.featured.is_(True))
            .order_by(Project.sort_order)
            .all()
        ),
        experiences=db.query(Experience).order_by(Experience.sort_order).all(),
        values=db.query(ValueProp).order_by(ValueProp.sort_order).all(),
    )


@router.get("/projects", response_model=list[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return (
        db.query(Project)
        .filter(Project.featured.is_(True))
        .order_by(Project.sort_order)
        .all()
    )


@router.get("/projects/{slug}", response_model=schemas.ProjectOut)
def get_project(slug: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.slug == slug, Project.featured.is_(True)).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/contact", status_code=status.HTTP_201_CREATED)
def send_message(payload: schemas.ContactCreate, db: Session = Depends(get_db)):
    message = ContactMessage(
        name=payload.name.strip(),
        email=payload.email,
        subject=payload.subject.strip(),
        body=payload.body.strip(),
    )
    db.add(message)
    db.commit()
    return {"detail": "Message received. Thank you — I will get back to you shortly."}
