from fastapi import FastAPI
from fastapi.responses import JSONResponse

from apps.flags_service.api.flags import router as flags_router
from apps.flags_service.exceptions.flag_exceptions import (
    FlagAlreadyExistsError,
    FlagNotFoundError,
    InvalidQualityThresholdError,
)

app = FastAPI(
    title="AI Feature Flag Platform",
    version="0.1.0",
    description="Backend service for AI Feature Flag Platform",
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