import re
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .config import assert_production_secrets, get_settings
from .routers import admin, auth, public

settings = get_settings()
assert_production_secrets(settings)

app = FastAPI(
    title=settings.app_name,
    description="Backend API powering yeoyedjande.com — Angular + FastAPI + PostgreSQL.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(auth.router)
app.include_router(admin.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}


# Single-container deployments (e.g. Railway): when the built Angular bundle
# is baked into the image at app/static, serve it with an SPA fallback so
# deep links like /projects/<slug> resolve to index.html.
STATIC_DIR = Path(__file__).resolve().parent / "static"

# Angular fingerprints its bundles (e.g. main-ABC12345.js) — those are safe
# to cache forever. Everything else (index.html, i18n JSON, favicons) must
# revalidate so a redeploy never leaves browsers on stale chunks.
_HASHED_ASSET = re.compile(r"-[A-Z0-9]{8}\.(js|css|mjs)$")

if STATIC_DIR.is_dir():

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404)
        candidate = (STATIC_DIR / full_path).resolve()
        if full_path and candidate.is_file() and candidate.is_relative_to(STATIC_DIR):
            if _HASHED_ASSET.search(candidate.name):
                headers = {"Cache-Control": "public, max-age=31536000, immutable"}
            else:
                headers = {"Cache-Control": "no-cache"}
            return FileResponse(candidate, headers=headers)
        return FileResponse(STATIC_DIR / "index.html", headers={"Cache-Control": "no-cache"})
