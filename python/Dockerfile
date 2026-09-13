FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
# build-essential — Faz 3.3'ün resemblyzer bağımlılığı (webrtcvad) bir C
# extension derliyor, python:3.12-slim'de ne derleyici ne de libc geliştirme
# başlıkları (stdlib.h vb.) kurulu — yalnızca `gcc` yetmedi, `Python.h`
# `stdlib.h`'ı bulamadı (2026-09-13'te gözlemlendi). pip install sonrası
# kaldırılır — yalnızca build-time ihtiyacı, runtime'da gerekmez.
#
# KÖK NEDEN NOTU (2026-09-13): Bu WSL kurulumunda Docker'ın bridge/NAT ağı
# büyük indirmelerde (torch ~189MB) rastgele noktalarda bağlantıyı
# kesiyordu — host'un kendi ağı tamamen sağlamdı (doğrudan curl sorunsuzdu),
# sorun özellikle konteyner NAT katmanındaydı. Gerçek çözüm docker-compose.yml
# içindeki `build.network: host` — bu Dockerfile'da ekstra bir şey
# GEREKMİYOR, NAT katmanı tamamen atlanıyor.
#
# torch'un varsayılan PyPI paketi CUDA/GPU destekli ve DEV BÜYÜK (~2GB) — bu
# servis CPU-only çalıştığından resmi CPU-only index kullanılıyor (~189MB).
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && pip install --no-cache-dir --default-timeout=180 torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir --default-timeout=180 -r requirements.txt \
    && apt-get purge -y build-essential && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY main.py auth.py ./
COPY routers/ ./routers/
COPY models/ ./models/
COPY services/ ./services/
COPY scripts/ ./scripts/

# Faz 3.5 — Piper Türkçe ses modeli (~63MB), build sırasında indirilir —
# git'e commit edilmez (bkz. .gitignore). curl kurulu değil (python:3.12-slim),
# healthcheck'teki gibi urllib kullanılıyor.
RUN mkdir -p tts_models && \
    python -c "import urllib.request; urllib.request.urlretrieve('https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx', 'tts_models/tr_TR-dfki-medium.onnx')" && \
    python -c "import urllib.request; urllib.request.urlretrieve('https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx.json', 'tts_models/tr_TR-dfki-medium.onnx.json')"

# NOT: scripts/pregenerate_tts_cache.py build image'ına PİŞİRİLMİYOR —
# src/locales/tr.json bu servisin build context'i (./python) DIŞINDA kalıyor.
# Sabit külliyat, `npm run dev:papatya-python` sonrası bir kerelik host'tan
# çalıştırılır (bkz. dokumantasyon/python-altyapisi.md) ya da ilk gerçek
# kullanımda synthesize()'ın kendi dosya-hash önbelleği devreye girer
# (yalnızca İLK seferinde ~1-2sn gecikme, sonraki tüm çağrılar anında).

RUN useradd --create-home --shell /usr/sbin/nologin papatyapy \
    && mkdir -p cache/tts speaker_embeddings \
    && chown -R papatyapy:papatyapy /app
USER papatyapy

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8030/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8030"]
