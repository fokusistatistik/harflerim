from fastapi import APIRouter, Depends, HTTPException, Response

from auth import verify_auth
from models.tts_request import TtsRequest
from services import tts_service

router = APIRouter()


@router.post("/tts/generate")
async def generate(istek: TtsRequest, authenticated: bool = Depends(verify_auth)) -> Response:
    if not tts_service.is_model_available():
        raise HTTPException(status_code=503, detail="TTS modeli kurulu değil (bkz. README).")

    try:
        audio_bytes = tts_service.synthesize(istek.text)
    except Exception:
        raise HTTPException(status_code=500, detail="Ses üretimi başarısız oldu.")

    return Response(content=audio_bytes, media_type="audio/wav")
