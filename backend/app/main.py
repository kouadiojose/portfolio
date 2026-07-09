from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import admin, auth, public

settings = get_settings()

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
