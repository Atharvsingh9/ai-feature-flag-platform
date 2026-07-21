from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from apps.flags_service.api.flags import router as flags_router
from apps.flags_service.api.dashboard import router as dashboard_router
from apps.demo_app.router import router as demo_router
from apps.flags_service.exceptions.flag_exceptions import (
    FlagAlreadyExistsError,
    FlagNotFoundError,
    InvalidQualityThresholdError,
)
from infrastructure.database.base import Base
from infrastructure.database.session import engine

app = FastAPI(
    title="AI Feature Flag Platform",
    version="0.1.0",
    description="Backend service for AI Feature Flag Platform",
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(FlagAlreadyExistsError)
async def flag_exists_handler(request, exc):
    return JSONResponse(
        status_code=409,
        content={
            "detail": str(exc),
        },
    )


@app.exception_handler(FlagNotFoundError)
async def flag_not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "detail": str(exc),
        },
    )


@app.exception_handler(InvalidQualityThresholdError)
async def invalid_threshold_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={
            "detail": str(exc),
        },
    )


@app.get("/")
def health():
    return {
        "service": "AI Feature Flag Platform",
        "status": "healthy",
    }


app.include_router(flags_router)
app.include_router(dashboard_router)
app.include_router(demo_router)
