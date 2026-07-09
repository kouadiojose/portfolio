"""Drop ALL tables and re-seed the database.

Destructive — intended for schema changes before launch, or a clean restart.
Content edited in the admin will be lost.

Run with:  python -m app.reset
"""
from .database import Base, engine
from .seed import seed

if __name__ == "__main__":
    print("Dropping all tables…")
    Base.metadata.drop_all(bind=engine)
    seed()
    print("Reset completed.")
