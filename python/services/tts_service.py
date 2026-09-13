"""Faz 3.5 — Piper TTS sarmalayıcısı.

Bilerek izole: motor (Piper) burada tek bir yerde. İleride başka bir TTS
motoruna geçilirse yalnızca bu dosya değişir, routers/tts.py ve çağıran
Next.js kodu aynı kalır (bkz. GENEL PRENSİP — genişletilebilirlik).
"""
import hashlib
import io
import os
import wave
from functools import lru_cache
from pathlib import Path

from piper import PiperVoice

MODEL_PATH = Path(__file__).parent.parent / "tts_models" / "tr_TR-dfki-medium.onnx"
CACHE_DIR = Path(__file__).parent.parent / "cache" / "tts"


@lru_cache(maxsize=1)
def _get_voice() -> PiperVoice:
    """Model yalnızca bir kez yüklenir (süreç ömrü boyunca) — her istekte
    yeniden yükleme gecikme/CPU israfı olurdu."""
    return PiperVoice.load(str(MODEL_PATH))


def _cache_path(text: str) -> Path:
    text_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return CACHE_DIR / f"{text_hash}.wav"


def synthesize(text: str) -> bytes:
    """Verilen metni WAV byte'larına çevirir. Aynı metin daha önce üretildiyse
    diskteki önbellekten okunur (yeniden sentezlenmez)."""
    cache_file = _cache_path(text)
    if cache_file.exists():
        return cache_file.read_bytes()

    voice = _get_voice()
    chunks = list(voice.synthesize(text))

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(chunks[0].sample_channels)
        wf.setsampwidth(chunks[0].sample_width)
        wf.setframerate(chunks[0].sample_rate)
        for chunk in chunks:
            wf.writeframes(chunk.audio_int16_bytes)

    audio_bytes = buffer.getvalue()

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file.write_bytes(audio_bytes)

    return audio_bytes


def is_model_available() -> bool:
    return MODEL_PATH.exists()
