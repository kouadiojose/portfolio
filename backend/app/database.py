from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import get_settings

settings = get_settings()

# Some platforms (Railway, Heroku) provide postgres:// URLs, which
# SQLAlchemy 2 no longer accepts — normalize to the psycopg2 dialect.
_database_url = settings.database_url
if _database_url.startswith("postgres://"):
    _database_url = _database_url.replace("postgres://", "postgresql+psycopg2://", 1)

engine = create_engine(
    _database_url,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if _database_url.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
