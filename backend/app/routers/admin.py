"""Authenticated CRUD endpoints used by the admin dashboard."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..models import (
    AdminUser,
    ContactMessage,
    Experience,
    ExpertiseItem,
    Project,
    SiteSettings,
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
    data = payload.model_dump(exclude_unset=True)
    if "facts" in data and data["facts"] is not None:
        data["facts"] = [dict(f) for f in data["facts"]]
    for key, value in data.items():
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


# ---------- Expertise ----------

@router.get("/expertise", response_model=list[schemas.ExpertiseOut])
def admin_list_expertise(db: Session = Depends(get_db)):
    return db.query(ExpertiseItem).order_by(ExpertiseItem.sort_order).all()


@router.post("/expertise", response_model=schemas.ExpertiseOut, status_code=status.HTTP_201_CREATED)
def admin_create_expertise(payload: schemas.ExpertiseBase, db: Session = Depends(get_db)):
    return _create(db, ExpertiseItem, payload)


@router.put("/expertise/{item_id}", response_model=schemas.ExpertiseOut)
def admin_update_expertise(item_id: int, payload: schemas.ExpertiseBase, db: Session = Depends(get_db)):
    return _update(db, ExpertiseItem, item_id, payload)


@router.delete("/expertise/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_expertise(item_id: int, db: Session = Depends(get_db)):
    _delete(db, ExpertiseItem, item_id)


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
