"""API smoke tests — run with: pytest

Uses an isolated on-disk SQLite database seeded before the tests run.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DATABASE_URL"] = "sqlite:///./test_portfolio.db"
os.environ["ADMIN_EMAIL"] = "admin@example.com"
os.environ["ADMIN_PASSWORD"] = "test-password"

import pytest
from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app
from app.seed import seed


@pytest.fixture(scope="session", autouse=True)
def prepared_database():
    Base.metadata.drop_all(bind=engine)
    seed()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def auth_headers(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "test-password"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_public_content_english_default(client):
    response = client.get("/api/content")
    assert response.status_code == 200
    data = response.json()
    assert data["settings"]["headline"] == "Senior Full Stack Developer"
    assert len(data["projects"]) == 5
    assert data["stack"], "stack should be seeded"
    assert data["settings"]["cv_url"] == "/assets/cv/CV_EN.pdf"


def test_public_content_french(client):
    response = client.get("/api/content?lang=fr")
    assert response.status_code == 200
    data = response.json()
    assert data["settings"]["headline"] == "Développeur Full Stack Senior"
    assert data["settings"]["cv_url"] == "/assets/cv/CV_FR.pdf"
    assert data["projects"][0]["title"] == "Plateforme de paiement d'entreprise"


def test_unknown_language_falls_back_to_english(client):
    response = client.get("/api/content?lang=de")
    assert response.status_code == 200
    assert response.json()["settings"]["headline"] == "Senior Full Stack Developer"


def test_project_detail_both_languages(client):
    en = client.get("/api/projects/enterprise-payment-platform")
    assert en.status_code == 200
    assert en.json()["title"] == "Enterprise Payment Platform"
    assert en.json()["problem"], "case study fields should be populated"

    fr = client.get("/api/projects/enterprise-payment-platform?lang=fr")
    assert fr.json()["title"] == "Plateforme de paiement d'entreprise"

    assert client.get("/api/projects/does-not-exist").status_code == 404


def test_login_rejects_bad_credentials(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "wrong"},
    )
    assert response.status_code == 401


def test_admin_requires_auth(client):
    assert client.get("/api/admin/projects").status_code == 401
    assert client.get("/api/admin/messages").status_code == 401


def test_contact_message_flow_stores_language(client, auth_headers):
    response = client.post(
        "/api/contact",
        json={
            "name": "A. Recruiter",
            "email": "recruiter@company.com",
            "subject": "Senior role",
            "body": "Bonjour, j'aimerais échanger au sujet d'une opportunité.",
            "language": "fr",
        },
    )
    assert response.status_code == 201

    inbox = client.get("/api/admin/messages", headers=auth_headers).json()
    assert inbox and inbox[0]["name"] == "A. Recruiter"
    assert inbox[0]["language"] == "fr"
    message_id = inbox[0]["id"]
    marked = client.patch(f"/api/admin/messages/{message_id}/read", headers=auth_headers)
    assert marked.status_code == 200 and marked.json()["read"] is True


def test_contact_validation(client):
    response = client.post(
        "/api/contact",
        json={"name": "X", "email": "not-an-email", "body": "hi"},
    )
    assert response.status_code == 422


def test_admin_project_crud(client, auth_headers):
    payload = {
        "slug": "test-project",
        "visual": "dashboard",
        "title": {"en": "Test Project", "fr": "Projet de test"},
        "role": {"en": "Developer", "fr": "Développeur"},
        "summary": {"en": "A test project.", "fr": "Un projet de test."},
        "highlights": {"en": ["Did a thing"], "fr": ["A fait une chose"]},
        "context": {"en": "Context.", "fr": "Contexte."},
        "problem": {"en": "Problem.", "fr": "Problème."},
        "approach": {"en": "Approach.", "fr": "Approche."},
        "contributions": {"en": ["Contributed"], "fr": ["Contribué"]},
        "learnings": {"en": "Learned.", "fr": "Appris."},
        "tags": ["Python"],
        "featured": False,
        "sort_order": 99,
    }
    created = client.post("/api/admin/projects", json=payload, headers=auth_headers)
    assert created.status_code == 201
    project_id = created.json()["id"]
    assert created.json()["title"] == {"en": "Test Project", "fr": "Projet de test"}

    # Duplicate slug is rejected
    assert client.post("/api/admin/projects", json=payload, headers=auth_headers).status_code == 409

    # Non-featured projects are hidden from the public API
    public_slugs = [p["slug"] for p in client.get("/api/content").json()["projects"]]
    assert "test-project" not in public_slugs

    payload["title"] = {"en": "Updated Test Project", "fr": "Projet de test mis à jour"}
    updated = client.put(f"/api/admin/projects/{project_id}", json=payload, headers=auth_headers)
    assert updated.status_code == 200
    assert updated.json()["title"]["en"] == "Updated Test Project"

    assert client.delete(f"/api/admin/projects/{project_id}", headers=auth_headers).status_code == 204


def test_settings_update_partial(client, auth_headers):
    response = client.put(
        "/api/admin/settings",
        json={"availability": {"en": "Testing availability", "fr": "Disponibilité de test"}},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["availability"]["fr"] == "Disponibilité de test"
    # Other fields untouched
    assert response.json()["headline"]["en"] == "Senior Full Stack Developer"
