"""Authenticated CRUD endpoints used by the admin dashboard."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..models import (
    ContactMessage,
    Experience,
    PageView,
    Project,
    StackItem,
    ValueProp,
)
from ..security import get_current_admin
from .public import get_site_settings

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],
)


# ---------- Site settings ----------

@router.get("/settings", response_model=schemas.SiteSettingsOut)
def read_settings(db: Session = Depends(get_db)):
    return get_site_settings(db)


@router.put("/settings", response_model=schemas.SiteSettingsOut)
def update_settings(payload: schemas.SiteSettingsUpdate, db: Session = Depends(get_db)):
    settings = get_site_settings(db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings


# ---------- Generic CRUD helpers ----------

def _get_or_404(db: Session, model, item_id: int):
    item = db.get(model, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return item


def _create(db: Session, model, payload):
    item = model(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def _update(db: Session, model, item_id: int, payload):
    item = _get_or_404(db, model, item_id)
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


def _delete(db: Session, model, item_id: int):
    item = _get_or_404(db, model, item_id)
    db.delete(item)
    db.commit()


# ---------- Projects ----------

@router.get("/projects", response_model=list[schemas.ProjectOut])
def admin_list_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.sort_order).all()


@router.post("/projects", response_model=schemas.ProjectOut, status_code=status.HTTP_201_CREATED)
def admin_create_project(payload: schemas.ProjectBase, db: Session = Depends(get_db)):
    if db.query(Project).filter(Project.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="A project with this slug already exists")
    return _create(db, Project, payload)


@router.put("/projects/{item_id}", response_model=schemas.ProjectOut)
def admin_update_project(item_id: int, payload: schemas.ProjectBase, db: Session = Depends(get_db)):
    existing = db.query(Project).filter(Project.slug == payload.slug, Project.id != item_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="A project with this slug already exists")
    return _update(db, Project, item_id, payload)


@router.delete("/projects/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_project(item_id: int, db: Session = Depends(get_db)):
    _delete(db, Project, item_id)


# ---------- Stack ----------

@router.get("/stack", response_model=list[schemas.StackItemOut])
def admin_list_stack(db: Session = Depends(get_db)):
    return db.query(StackItem).order_by(StackItem.sort_order).all()


@router.post("/stack", response_model=schemas.StackItemOut, status_code=status.HTTP_201_CREATED)
def admin_create_stack(payload: schemas.StackItemBase, db: Session = Depends(get_db)):
    return _create(db, StackItem, payload)


@router.put("/stack/{item_id}", response_model=schemas.StackItemOut)
def admin_update_stack(item_id: int, payload: schemas.StackItemBase, db: Session = Depends(get_db)):
    return _update(db, StackItem, item_id, payload)


@router.delete("/stack/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_stack(item_id: int, db: Session = Depends(get_db)):
    _delete(db, StackItem, item_id)


# ---------- Experiences ----------

@router.get("/experiences", response_model=list[schemas.ExperienceOut])
def admin_list_experiences(db: Session = Depends(get_db)):
    return db.query(Experience).order_by(Experience.sort_order).all()


@router.post("/experiences", response_model=schemas.ExperienceOut, status_code=status.HTTP_201_CREATED)
def admin_create_experience(payload: schemas.ExperienceBase, db: Session = Depends(get_db)):
    return _create(db, Experience, payload)


@router.put("/experiences/{item_id}", response_model=schemas.ExperienceOut)
def admin_update_experience(item_id: int, payload: schemas.ExperienceBase, db: Session = Depends(get_db)):
    return _update(db, Experience, item_id, payload)


@router.delete("/experiences/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_experience(item_id: int, db: Session = Depends(get_db)):
    _delete(db, Experience, item_id)


# ---------- Value props ----------

@router.get("/values", response_model=list[schemas.ValuePropOut])
def admin_list_values(db: Session = Depends(get_db)):
    return db.query(ValueProp).order_by(ValueProp.sort_order).all()


@router.post("/values", response_model=schemas.ValuePropOut, status_code=status.HTTP_201_CREATED)
def admin_create_value(payload: schemas.ValuePropBase, db: Session = Depends(get_db)):
    return _create(db, ValueProp, payload)


@router.put("/values/{item_id}", response_model=schemas.ValuePropOut)
def admin_update_value(item_id: int, payload: schemas.ValuePropBase, db: Session = Depends(get_db)):
    return _update(db, ValueProp, item_id, payload)


@router.delete("/values/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_value(item_id: int, db: Session = Depends(get_db)):
    _delete(db, ValueProp, item_id)


# ---------- Contact messages inbox ----------

@router.get("/messages", response_model=list[schemas.ContactMessageOut])
def admin_list_messages(db: Session = Depends(get_db)):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()


@router.patch("/messages/{item_id}/read", response_model=schemas.ContactMessageOut)
def admin_mark_read(item_id: int, db: Session = Depends(get_db)):
    message = _get_or_404(db, ContactMessage, item_id)
    message.read = True
    db.commit()
    db.refresh(message)
    return message


@router.delete("/messages/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_message(item_id: int, db: Session = Depends(get_db)):
    _delete(db, ContactMessage, item_id)


# ---------- Dashboard stats ----------

def _count_missing_fr(values: list) -> int:
    """Count i18n dicts (or lists) with content in English but none in French."""
    missing = 0
    for value in values:
        if not isinstance(value, dict):
            continue
        en, fr = value.get("en"), value.get("fr")
        if en and not fr:
            missing += 1
    return missing


def _visit_stats(db: Session) -> schemas.VisitStats:
    from datetime import datetime, timedelta, timezone

    from sqlalchemy import func

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=6)
    month_start = today_start - timedelta(days=29)

    # One query for the whole 7-day window (today/week/daily breakdown are
    # all derived from it in Python below) instead of a separate count query
    # per day/window — SQLite and Postgres both avoid a portable day-bucket
    # SQL expression this way, at the cost of a bit of Python bucketing.
    # SQLite hands back naive datetimes regardless of column type, so they're
    # normalized to aware UTC here to compare against today_start/week_start.
    week_rows = [
        (created_at if created_at.tzinfo else created_at.replace(tzinfo=timezone.utc), visitor)
        for created_at, visitor in db.query(PageView.created_at, PageView.visitor)
        .filter(PageView.created_at >= week_start)
        .all()
    ]

    def stats_for(rows) -> tuple[int, int]:
        return len(rows), len({visitor for _, visitor in rows})

    today_rows = [r for r in week_rows if r[0] >= today_start]
    today_views, today_visitors = stats_for(today_rows)
    week_views, week_visitors = stats_for(week_rows)
    total_views = db.query(func.count(PageView.id)).scalar() or 0

    daily = []
    for offset in range(6, -1, -1):
        day_start = today_start - timedelta(days=offset)
        day_end = day_start + timedelta(days=1)
        day_rows = [r for r in week_rows if day_start <= r[0] < day_end]
        day_views, day_visitors = stats_for(day_rows)
        daily.append(
            schemas.VisitDay(date=day_start.strftime("%Y-%m-%d"), views=day_views, visitors=day_visitors)
        )

    top = (
        db.query(PageView.path, func.count(PageView.id).label("views"))
        .filter(PageView.created_at >= month_start)
        .group_by(PageView.path)
        .order_by(func.count(PageView.id).desc())
        .limit(5)
        .all()
    )

    return schemas.VisitStats(
        today_views=today_views,
        today_visitors=today_visitors,
        week_views=week_views,
        week_visitors=week_visitors,
        total_views=total_views,
        daily=daily,
        top_pages=[schemas.TopPage(path=path, views=views) for path, views in top],
    )


@router.get("/stats", response_model=schemas.AdminStats)
def admin_stats(db: Session = Depends(get_db)):
    from .public import get_site_settings

    messages = db.query(ContactMessage).all()
    projects = db.query(Project).all()
    experiences = db.query(Experience).all()
    values = db.query(ValueProp).all()
    stack = db.query(StackItem).all()
    site = get_site_settings(db)

    settings_fields = [
        site.headline, site.tagline, site.hero_subtitle, site.availability,
        site.impacts, site.about_title, site.about_paragraphs, site.principles,
        site.cv_url, site.contact_lead,
    ]
    project_fields = [
        field
        for p in projects
        for field in (p.title, p.role, p.summary, p.highlights,
                      p.context, p.problem, p.approach, p.contributions, p.learnings)
    ]
    experience_fields = [
        field for e in experiences for field in (e.title, e.organization, e.period, e.bullets)
    ]
    value_fields = [field for v in values for field in (v.title, v.description)]
    stack_fields = [i.category for i in stack]

    return schemas.AdminStats(
        messages=schemas.MessageStats(
            total=len(messages),
            unread=sum(1 for m in messages if not m.read),
            french=sum(1 for m in messages if m.language == "fr"),
            english=sum(1 for m in messages if m.language == "en"),
        ),
        projects=schemas.ProjectStats(
            total=len(projects),
            visible=sum(1 for p in projects if p.featured),
        ),
        experiences=len(experiences),
        stack_items=len(stack),
        values=len(values),
        translation_gaps=schemas.TranslationGaps(
            settings=_count_missing_fr(settings_fields),
            projects=_count_missing_fr(project_fields),
            experiences=_count_missing_fr(experience_fields),
            values=_count_missing_fr(value_fields),
            stack=_count_missing_fr(stack_fields),
        ),
        latest_messages=[
            schemas.ContactMessageOut.model_validate(m)
            for m in sorted(messages, key=lambda m: m.created_at, reverse=True)[:3]
        ],
        visits=_visit_stats(db),
    )


# ---------- Visitor details ----------

@router.get("/visits", response_model=schemas.VisitsPage)
def admin_list_visits(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    limit = max(1, min(limit, 200))
    query = db.query(PageView).order_by(PageView.created_at.desc())
    total = query.count()
    items = query.offset(max(0, offset)).limit(limit).all()
    return schemas.VisitsPage(
        items=[schemas.VisitOut.model_validate(v) for v in items],
        total=total,
    )


def _label_counts(db: Session, column, start, top: int = 12) -> list:
    rows = (
        db.query(
            column,
            func.count(PageView.id).label("views"),
            func.count(func.distinct(PageView.visitor)).label("visitors"),
        )
        .filter(PageView.created_at >= start, column != "")
        .group_by(column)
        .order_by(func.count(PageView.id).desc())
        .limit(top)
        .all()
    )
    return [
        schemas.LabelCount(label=row[0], views=row[1], visitors=row[2]) for row in rows
    ]


@router.get("/visits/summary", response_model=schemas.VisitsSummary)
def admin_visits_summary(db: Session = Depends(get_db)):
    """Aggregated visitor details over the last 30 days."""
    start = datetime.now(timezone.utc) - timedelta(days=30)
    views = db.query(func.count(PageView.id)).filter(PageView.created_at >= start).scalar() or 0
    visitors = (
        db.query(func.count(func.distinct(PageView.visitor)))
        .filter(PageView.created_at >= start)
        .scalar()
        or 0
    )
    return schemas.VisitsSummary(
        views=views,
        visitors=visitors,
        countries=_label_counts(db, PageView.country, start),
        browsers=_label_counts(db, PageView.browser, start),
        devices=_label_counts(db, PageView.device, start),
        referrers=_label_counts(db, PageView.referrer, start),
        languages=_label_counts(db, PageView.language, start),
    )
