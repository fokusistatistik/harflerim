from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from routers import speaker, tts  # noqa: E402  (load_dotenv önce çalışmalı)

app = FastAPI(
    title="Papatya Python Servisi",
    description="Papatya'nın Faz 3 (Zeka Katmanı) özelliklerini besleyen bağımsız Python servisi.",
    version="0.3.0",
    # Server-to-server servis, halka açık bir API değil — nöbetçim'in deseniyle
    # aynı gerekçeyle otomatik OpenAPI dokümantasyonu kapatıldı.
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.include_router(tts.router)
app.include_router(speaker.router)


@app.get("/")
async def root() -> dict:
    return {"message": "Papatya Python Servisi çalışıyor", "version": "0.1.0"}


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
