from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import company, shareholder  # noqa: F401 – ensure models are registered
from app.routers import companies

app = FastAPI(
    title="Company Incorporation API",
    description="FastAPI backend for the multi-step company incorporation tool",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production to your frontend Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companies.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
