"""Faz 3.3 — konuşmacı tanıma (hafif embedding tabanlı).

Bilerek izole: motor (Resemblyzer) burada tek bir yerde. İleride başka bir
embedding modeline geçilirse yalnızca bu dosya + embedding'lerin yeniden
hesaplanması gerekir (bkz. GENEL PRENSİP — genişletilebilirlik). Embedding'ler
HAM SES değil, sayısal vektör olarak diske yazılır.
"""
import io
from functools import lru_cache
from pathlib import Path

import librosa
import numpy as np
from resemblyzer import VoiceEncoder, preprocess_wav

EMBEDDINGS_DIR = Path(__file__).parent.parent / "speaker_embeddings"

# Kozin similarity eşiği — bu ampirik bir başlangıç değeri, gerçek aile
# kayıtlarıyla ayarlanması gerekebilir. Eşik altı = "tanınmadı" (asla yanlış
# bir kişiyi güvenle "tanıdı" gibi göstermemeli).
IDENTIFY_THRESHOLD = 0.75


@lru_cache(maxsize=1)
def _get_encoder() -> VoiceEncoder:
    return VoiceEncoder()


def _embed_from_bytes(audio_bytes: bytes) -> np.ndarray:
    # preprocess_wav yalnızca bir dosya yolu ya da (numpy_array) alır — BytesIO
    # DEĞİL. librosa (soundfile üzerinden) dosya-benzeri nesneleri okuyabildiği
    # için önce onunla çözülüp source_sr açıkça geçiliyor.
    raw_wav, source_sr = librosa.load(io.BytesIO(audio_bytes), sr=None)
    wav = preprocess_wav(raw_wav, source_sr=source_sr)
    return _get_encoder().embed_utterance(wav)


def enroll(family_member_id: str, audio_bytes: bytes) -> None:
    """Bir aile bireyinin ses örneğinden embedding çıkarır, saklar."""
    embedding = _embed_from_bytes(audio_bytes)
    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
    np.save(EMBEDDINGS_DIR / f"{family_member_id}.npy", embedding)


def identify(audio_bytes: bytes) -> tuple[str | None, float]:
    """Gelen sesi tüm kayıtlı embedding'lerle karşılaştırır. Eşik altındaysa
    (None, confidence) döner — sistem asla tanımadığı bir sesi "tanıdı" gibi
    göstermez (bkz. YOL-HARITASI.md 3.3 ilkesi)."""
    if not EMBEDDINGS_DIR.exists():
        return None, 0.0

    query_embedding = _embed_from_bytes(audio_bytes)

    best_match: str | None = None
    best_score = 0.0
    for npy_file in EMBEDDINGS_DIR.glob("*.npy"):
        stored = np.load(npy_file)
        score = float(np.dot(query_embedding, stored))  # Resemblyzer embedding'leri zaten L2-normalize
        if score > best_score:
            best_score = score
            best_match = npy_file.stem

    if best_score < IDENTIFY_THRESHOLD:
        return None, best_score

    return best_match, best_score


def is_model_available() -> bool:
    try:
        _get_encoder()
        return True
    except Exception:
        return False
