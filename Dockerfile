# Single-container image for platforms like Railway:
# builds the Angular bundle, then serves it from FastAPI alongside the API.
# (For multi-service deployment with nginx, use docker-compose.yml instead.)

# Stage 1 — build the Angular frontend
FROM node:22-alpine AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2 — Python runtime serving API + static SPA
FROM python:3.12-slim
WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY --from=frontend /fe/dist/frontend/browser ./app/static

USER app

EXPOSE 8000

# Railway injects PORT; the seed is idempotent (only fills missing data)
CMD ["sh", "-c", "python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
