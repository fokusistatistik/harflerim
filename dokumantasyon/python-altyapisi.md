# Papatya Python Servisi — Faz 3 Altyapısı

> Durum (2026-09-13): iskelet + 3.5 (Piper TTS) + 3.3 (konuşmacı tanıma)
> tamamlandı. 3.4 (kamera→karakter) tamamen istemci tarafında (MediaPipe
> WASM), bu servise hiç dokunmuyor. Desen, nöbetçim/dersplani projelerindeki
> aynı yapıdan salt-okunur incelenip kopyalandı (o projelere hiç dokunulmadı).

## Ne var

| | |
|---|---|
| Konum | `python/` (bu repo içinde) |
| Container adı | `papatya-python` |
| Port | `8030` |
| Başlatma | `npm run dev:papatya-python` (Docker) veya doğrudan `uvicorn main:app --port 8030` (venv) |
| Env değişkenleri | `PAPATYA_PYTHON_API_URL`, `PAPATYA_PYTHON_AUTH_KEY` |
| Next.js istemcisi | `src/lib/papatyaPythonClient.ts` |

## Uç noktalar

| Endpoint | Faz | Açıklama |
|---|---|---|
| `GET /health`, `GET /` | — | Auth'suz, healthcheck için |
| `POST /tts/generate` | 3.5 | `{text}` → WAV byte'ları (Piper, Türkçe `tr_TR-dfki-medium` sesi). Dosya-hash önbellekli. |
| `POST /speaker/enroll` | 3.3 | `family_member_id` (form) + `audio` (dosya) → embedding çıkarır, saklar. |
| `POST /speaker/identify` | 3.3 | `audio` (dosya) → `{familyMemberId, confidence}`. Eşik altındaysa `familyMemberId: null`. |

## Port seçimi

WSL'deki diğer projelerin Python servisleri: kamuhastaneleri(sigma-python)=8000,
sigma(sigma-ozel-python)=8010, nöbetçim(nobetcim-python)=8020,
dersplani/Çizelgecim(cizelgecim-python)=8050. 8030 boş olduğu için seçildi.

## Dev ortamı

```bash
npm run dev:papatya-python          # docker compose up -d --build papatya-python
curl http://localhost:8030/health   # {"status":"ok"} dönmeli
```

Docker olmadan yerel test:

```bash
cd python
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8030
```

**Not (2026-09-13):** Resemblyzer'ın bağımlılığı `webrtcvad` bir C extension
derliyor — hem yerel venv'de hem Docker'da `gcc` (`build-essential`) kurulu
olmalı. Docker imajı bunu build-time'da kurup pip install sonrası kaldırıyor
(runtime'da gerekmiyor); yerel venv testi için host'a `sudo apt install gcc`
gerekir.

## Piper TTS sesli külliyat önbelleği

Sabit külliyat (`src/locales/tr.json`'daki `game.findLetter`×21 harf +
`feedback.success`/`feedback.retry`) önceden üretilip önbelleğe alınabilir:

```bash
cd python && source venv/bin/activate
python scripts/pregenerate_tts_cache.py
```

Bu adım opsiyoneldir — çalıştırılmazsa ilk gerçek `speak()` çağrısında
`services/tts_service.py` metni sentezleyip diske yazar (yalnızca o metnin
İLK seferinde ~1-2sn gecikme, sonraki tüm çağrılar önbellekten anında döner).

## Konuşmacı tanıma (Faz 3.3) — eşik ve sınırlar

`services/speaker_service.py`'deki `IDENTIFY_THRESHOLD = 0.75` ampirik bir
başlangıç değeridir — gerçek aile ses kayıtlarıyla ayarlanması gerekebilir.
Eşik altındaki bir eşleşme HER ZAMAN `None` (tanınmadı) döner; sistem asla
belirsiz bir eşleşmeyi "tanıdı" gibi göstermez (roadmap ilkesi). Next.js
tarafında (`src/actions/speaker.ts`) her hata/istisna da aynı şekilde sessizce
`familyMember: null`'a düşer — çağıran taraf mutlaka dokunmatik bir alternatif
sunmalıdır.

Aile bireyi eklerken (Ebeveyn Alanı) ses örneği yüklenmişse `enrollFamilyMemberVoiceSample()`
otomatik tetiklenir (best-effort, aile bireyi ekleme akışını bloklamaz) —
bkz. `src/actions/familyMembers.ts`.

## Kamera → karakter (Faz 3.4) — bu servise hiç dokunmuyor

MediaPipe Pose Landmarker tamamen istemci tarafında (`@mediapipe/tasks-vision`,
WASM) çalışıyor — `src/components/character/CameraCharacter.tsx`. Kamera
karesi hiçbir zaman ağa/sunucuya gitmez. Kanıtlayıcı entegrasyon noktası:
`/games/camera-character` sayfası (gerçek kamera davranışı bu ortamda
otomatik test edilemedi — gerçek bir tarayıcıda denenmeli).

## Kimi besliyor

- 3.5 → `src/hooks/useTurkishSpeech.ts` (önce Piper dener, başarısızsa tarayıcı `speechSynthesis`'e düşer).
- 3.3 → `src/actions/speaker.ts`, `src/actions/familyMembers.ts` (otomatik enrollment).
- 3.2 (uyarlanabilir zorluk) bu servise dokunmuyor — bkz. `src/lib/adaptiveDifficulty.ts`.

Kalan Python gerektiren madde: 3.14 (içerik risk skoru) — ayrı bir loop'ta.

## Güvenlik

- `docs_url`/`redoc_url`/`openapi_url` kapalı — server-to-server bir servis,
  halka açık API değil.
- Container `127.0.0.1:8030:8030`'a sabit — dışa/internete hiç açılmaz.
- `X-Auth-Key` header'ı `PAPATYA_PYTHON_AUTH_KEY` ile karşılaştırılır
  (`python/auth.py`) — `/tts/generate`, `/speaker/enroll`, `/speaker/identify`
  hepsi korumalı; `/health` ve `/` kasıtlı olarak auth'suz.
- **Not:** `.env` bu repoda git'e track ediliyor (kullanıcı kararı: sunucuya
  kurulacak env'in birebir bir simülasyonu burada da dursun) — bu yüzden
  `PAPATYA_PYTHON_AUTH_KEY`'in buradaki değeri yalnızca bir **yerel dev
  değeri**dir, gerçek bir prod dağıtımından önce mutlaka yenilenmelidir.
- Piper TTS (`piper-tts`) GPL-3.0-or-later lisanslı — ayrı bir servis/süreç
  olarak HTTP üzerinden çağrıldığı için (statik link değil) bu genelde sorun
  teşkil etmez, ama ticari dağıtım öncesi bir hukuki gözden geçirme önerilir.
