from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers.calculator import router as calculator_router


def create_app() -> FastAPI:
    Base.metadata.create_all(bind=engine)

    app = FastAPI(
        title="Dental Treatment Financing Calculator API",
        version="1.0.0",
        description="Calculate insurance coverage and payment options for dental treatments.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://localhost:3000",
            "http://frontend:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(calculator_router)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
