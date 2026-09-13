"""Faz 3.5 — sabit külliyatı (game.findLetter x21 harf + feedback.success +
feedback.retry) baştan üretip diskteki TTS önbelleğine yazar. Çalıştırma:

    cd python && source venv/bin/activate && python scripts/pregenerate_tts_cache.py

Idempotent — services/tts_service.py zaten dosya-hash önbelleği kullanıyor,
tekrar çalıştırmak var olan dosyaları yeniden üretmez.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from services import tts_service  # noqa: E402

TR_JSON_PATH = Path(__file__).parent.parent.parent / "src" / "locales" / "tr.json"

# gameData.ts'teki ALPHABET_ORDER ile aynı 21 harf (bkz. src/components/games/visual-match/GameBoard.tsx LETTERS).
ALPHABET = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Y', 'Z']


def main() -> None:
    tr = json.loads(TR_JSON_PATH.read_text(encoding="utf-8"))

    phrases: list[str] = []
    for template in tr["game"]["findLetter"]:
        for letter in ALPHABET:
            phrases.append(template.replace("{{letter}}", letter))
    phrases.extend(tr["feedback"]["success"])
    phrases.extend(tr["feedback"]["retry"])

    print(f"Toplam {len(phrases)} cümle üretilecek/önbellekten okunacak...")
    for i, phrase in enumerate(phrases, 1):
        tts_service.synthesize(phrase)
        print(f"  [{i}/{len(phrases)}] {phrase!r}")

    print("Tamamlandı.")


if __name__ == "__main__":
    main()
