from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from auth import verify_auth
from models.speaker_models import IdentifyResponse
from services import speaker_service

router = APIRouter()


@router.post("/speaker/enroll")
async def enroll(
    family_member_id: str = Form(...),
    audio: UploadFile = File(...),
    authenticated: bool = Depends(verify_auth),
) -> dict:
    if not speaker_service.is_model_available():
        raise HTTPException(status_code=503, detail="Konuşmacı tanıma modeli kurulu değil.")

    audio_bytes = await audio.read()
    try:
        speaker_service.enroll(family_member_id, audio_bytes)
    except Exception:
        raise HTTPException(status_code=500, detail="Ses örneği işlenemedi — kayıt bozuk veya çok kısa olabilir.")

    return {"status": "ok"}


@router.post("/speaker/identify", response_model=IdentifyResponse)
async def identify(
    audio: UploadFile = File(...),
    authenticated: bool = Depends(verify_auth),
) -> IdentifyResponse:
    if not speaker_service.is_model_available():
        raise HTTPException(status_code=503, detail="Konuşmacı tanıma modeli kurulu değil.")

    audio_bytes = await audio.read()
    try:
        family_member_id, confidence = speaker_service.identify(audio_bytes)
    except Exception:
        raise HTTPException(status_code=500, detail="Ses işlenemedi — kayıt bozuk veya çok kısa olabilir.")

    return IdentifyResponse(familyMemberId=family_member_id, confidence=confidence)
