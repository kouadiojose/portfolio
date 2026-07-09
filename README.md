# Yeo Yedjande — Portfolio

Professional portfolio for **Yeo Yedjande, Senior Full Stack Developer**, targeting international
recruitment (Canada, France, Belgium, Luxembourg, Switzerland, Germany).

Live site: [https://yeoyedjande.com](https://yeoyedjande.com)

**This portfolio is itself a demonstration of the stack it advertises**: an Angular SPA backed by a
FastAPI REST API and a PostgreSQL database, secured with JWT, shipped with Docker — the exact
technologies highlighted on the site.

## Architecture

```
frontend/          Angular 19 (standalone components, lazy-loaded routes, signals)
  src/app/core/      API services, auth service, JWT interceptor, route guard
  src/app/pages/     Home, Projects, Project detail, Contact, Admin (login + dashboard)
  src/app/shared/    Header, footer, icons, scroll-reveal directive
  nginx.conf         Production web server: static files + /api reverse proxy
backend/           FastAPI + SQLAlchemy 2
  app/models.py      Site settings, expertise, stack, projects, experiences, values, messages
  app/routers/       public.py (content, contact), auth.py (JWT), admin.py (CRUD)
  app/seed.py        Idempotent seed: schema + admin account + initial content
  tests/             API test suite (pytest)
docker-compose.yml PostgreSQL + API + nginx web, production-ready
.github/workflows/ CI: backend tests + frontend build on every push
```

The public site reads everything from the database through `GET /api/content`, so **all content is
editable from the admin dashboard** at `/admin` — no redeploy needed to update texts, projects,
experience or the tech stack. The contact form stores messages in the database; they appear in the
admin **Inbox** with reply/mark-read/delete actions.

## Run locally (development)

Backend (SQLite by default — no database server needed):

```bash
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python -m app.seed          # creates schema, admin account and content
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Frontend (dev server proxies /api to :8000):

```bash
cd frontend
npm install
npm start                              # http://localhost:4200
```

Default admin credentials in development: `kouadiojose@gmail.com` / `admin`
(override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars **before the first seed**;
the password can also be changed from the admin dashboard).

Backend tests:

```bash
cd backend
.venv/bin/pip install pytest httpx
.venv/bin/python -m pytest
```

## Run with Docker (production)

```bash
cp .env.example .env    # then set real values (POSTGRES_PASSWORD, SECRET_KEY, ADMIN_PASSWORD)
docker compose up -d --build
```

This starts PostgreSQL (persistent volume), the API (seeded automatically on first start) and
nginx serving the built Angular app on port 80 with `/api` proxied to the backend. Point the
`yeoyedjande.com` DNS at the server and put your TLS termination of choice in front (e.g.
Caddy, Traefik, or certbot + nginx).

## Admin dashboard

- `/admin` — JWT-protected; redirects to `/admin/login` when signed out.
- **Inbox**: messages from the contact form (lead capture from recruiters).
- **Site content**: hero, about, facts, contact links, CV URL — plus password change.
- **Projects / Experience / Expertise / Tech stack / Value props**: full CRUD with ordering;
  projects can be hidden without deleting them (`featured` flag).

## Things to complete

1. **CV file**: place your PDF at `frontend/public/assets/cv/Yeo-Yedjande-CV.pdf`
   (the "Download CV" button points there — the path is editable in the admin).
2. **LinkedIn URL**: verify the URL in the admin → Site content (seeded as
   `https://www.linkedin.com/in/yeo-yedjande`).
3. **Production secrets**: set strong `SECRET_KEY`, `ADMIN_PASSWORD` and `POSTGRES_PASSWORD`
   in `.env` before the first deployment.
