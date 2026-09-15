# Seslendirmeler — ElevenLabs'a Geçiş Envanteri

> Bu dosya, projedeki TÜM seslendirme (TTS) noktalarının envanteri ve ElevenLabs ile kademeli olarak gerçek insan-kalitesinde sese geçiş planıdır. `PROMPTLAR.md`'nin (görsel üretim) sesteki karşılığı — kopyala-yapıştır hazır olmayı hedefler ama ElevenLabs bir prompt değil, ses+metin çifti gerektirdiği için format ona göre uyarlandı.
>
> Oluşturulma: 2026-09-14.

## Şu anki mimari (değişmeden kalacak kısım)

Projede **iki katmanlı bir TTS zinciri** var, `src/hooks/useTurkishSpeech.ts` üzerinden:

1. **Piper TTS (birincil)** — kendi barındırılan Python servisi (`python/services/tts_service.py`), model `tr_TR-dfki-medium.onnx` (tek konuşmacılı, DFKI Türkçe veri seti). `/api/tts` route'u üzerinden proxy'lenir, sonuç disk üzerinde SHA-256 hash'li dosya adıyla önbelleklenir (`python/cache/tts/*.wav`).
2. **Tarayıcı `speechSynthesis` (fallback)** — Piper başarısız olursa sessizce buna düşülür, ses seçimi kontrolsüz (yalnızca `lang=tr-TR`, cihaza bağlı).

**ElevenLabs bu zincirin NERESİNE girecek?** Öneri: Piper'ın **önüne** üçüncü bir katman olarak — sabit/önceden bilinen metinler (bu dosyadaki C ve E bölümleri) için ElevenLabs'ta üretilmiş gerçek ses dosyaları statik olarak `public/sounds/tts/` altında tutulur, oynatılırken önce oraya bakılır; yalnızca dinamik/bilinmeyen metin (nesne adları gibi, B bölümü) hâlâ Piper'a düşer. Böylece hem doğal ses kalitesi (sabit, sık duyulan cümlelerde) hem de esneklik (her yeni kelime için API çağrısı gerekmez) korunur. **Bu mimari karar henüz uygulanmadı — bu dosya yalnızca envanter ve ses/metin ataması, kod değişikliği ayrı bir tur.**

---

## Ses karakteri ataması

İki sabit karakter sesi tanımlandı — otizmli bir çocuk için ses tutarlılığı önemli olduğundan, her karakterin ElevenLabs'ta **tek bir sabit ses ID'sine** sabitlenmesi ve bir daha değiştirilmemesi gerekir.

| Karakter | Cinsiyet | Rol | Kullanıldığı senaryolar |
|---|---|---|---|
| **Papatya (Anlatıcı)** | Kadın | Sakin, sıcak, yönlendirici — sorular sorar, yönlendirir | Harf sorma (B1), AAC kelimeleri (E), "Bu kim?" (C-16) |
| **Coşkun (Kutlama Sesi)** | Erkek | Enerjik, sıcak, motive edici — kutlar, teşvik eder | Kutlama/başarı (C4-9), Teşvik/tekrar (C10-12) |

**ElevenLabs ses seçim kriterleri (her iki karakter için):**
- Türkçe doğal telaffuz (ElevenLabs'ın multilingual v2 modeli veya Türkçe-native bir ses)
- Sakin, ağır olmayan, tiz/keskin olmayan ton — ani perde değişimleri yok (otizmli çocuklarda duyusal hassasiyet)
- Çocuk dostu ama çocuksu/yapay değil — gerçek, sıcak bir yetişkin sesi
- Stabilite ayarı yüksek tutulmalı (ElevenLabs "Stability" slider'ı) — cümle-cümle ton tutarlılığı için

---

## A) Kadın Ses — "Papatya" — Metin Listesi

### A1. Harf sorma şablonları (B1 — `{{harf}}` interpolasyonlu, harf her okunuşta değişir)

Bu 3 cümle şablon olduğu için ElevenLabs'ta **harf ismi olmadan tam cümle** üretilemez — 29 harfin her biri × 3 şablon = 87 varyasyon gerekir (bkz. not aşağıda). Alternatif: yalnızca taşıyıcı cümleyi üretip harf adını ayrı bir kısa ses klibi olarak birleştirmek (audio splicing) — bu kod tarafında ayrı bir iş.

```
1. Hadi {{harf}} harfini bulalım!
2. {{harf}} harfi nerede?
3. Bakalım, {{harf}} harfini bulabilecek misin?
```

**Not (önemli, ElevenLabs'a geçmeden önce karar gerektirir):** Bu 3 şablon × 29 harf = 87 ayrı ses dosyası üretmek gerekir (pratik ama çok sayıda dosya) YA DA harf isimlerini (`A`, `Be`, `Ce`... 29 tanesi) ayrı üretip kod tarafında cümleye "yapıştırmak" gerekir (daha az dosya, ama gerçek zamanlı ses birleştirme/crossfade işi). Bu dosya yalnızca envanteri veriyor — hangi yolun seçileceği ayrı bir teknik karar.

**Harf isimleri (Türk alfabesi, 29 harf — ayrı üretilecekse):**
```
A, Be, Ce, Çe, De, E, Fe, Ge, Yumuşak Ge, He, I, İ, Je, Ke, Le, Me, Ne, O, Ö, Pe, Re, Se, Şe, Te, U, Ü, Ve, Ye, Ze
```

### A2. Aile Albümü sabit metni

```
16. Bu kim?
```

### A4. Aile Albümü — yakınlık derecesi kelimeleri (2026-09-15 eklendi)

Oyun artık özel ad değil yakınlık derecesi soruyor/gösteriyor (`src/config/familyRelations.ts`, 21 sabit seçenek — "Diğer" hariç, o serbest metin). Bu liste SABİT olduğu için (proje-geneli, ebeveyn ekleyip çıkaramaz) dinamik değil, ElevenLabs'a UYGUN — D bölümündeki "gerçek dinamik içerik" (DB'den gelen nesne/kelime adları) kategorisine girmiyor. İki kullanım noktası var: (1) doğru cevap toast'ı `"Bu senin {{yakınlık}}!"`, (2) sesli ipucu butonu `"Bu senin {{yakınlık}}"`. Taşıyıcı cümle sabit, yalnızca `{{yakınlık}}` değişiyor — A1'deki harf şablonlarıyla aynı desen (87-dosya vs. ses-birleştirme kararı burada da geçerli, ama yalnızca 21 kelime × 1 taşıyıcı cümle = çok daha az varyasyon, muhtemelen tam-cümle üretimi pratik).

**Taşıyıcı cümle şablonu:**
```
17. Bu senin {{yakınlık}}!
```

**21 yakınlık kelimesi (`familyRelations.ts` ile birebir aynı sırada):**
```
Anne
Baba
Abla
Ağabey
Kız Kardeş
Erkek Kardeş
Anneanne
Babaanne
Dede (anne tarafı)
Dede (baba tarafı)
Teyze
Hala
Dayı
Amca
Kuzen
Yenge
Enişte
Arkadaş
Öğretmen
Bakıcı
Komşu
```

**Not:** "Diğer" ile serbest metin girilen kayıtlar (örn. "Aile dostu") bu sabit listede yer almaz — bunlar her zaman dinamik kalır, Piper'a düşer (D bölümündeki mantıkla aynı).

**Kod entegrasyonu (henüz uygulanmadı, ayrı bir iş):** `FamilyAlbumGame.tsx`'teki `speak(\`Bu senin ${target.relation.toLocaleLowerCase('tr-TR')}\`)` çağrısı şu an Piper/tarayıcı zincirinden geçiyor (`useAudio().speak`) — ElevenLabs statik dosyaları hazır olduğunda, `target.relation` bu 21 sabit kelimeden biriyse yerel dosya çalınır, "Diğer" ile serbest girilmişse Piper'a düşülür (üstteki mimari önerideki aynı örüntü).

### A3. AAC Tahtası — 18 kelime (`src/store/aacData.ts`, her biri tek başına okunuyor, interpolasyon yok)

**İhtiyaçlar (6):**
```
İstiyorum
Su
Tuvalet
Yardım
Açım
Susadım
```

**Duygular (6):**
```
Mutluyum
Üzgünüm
Yorgunum
Kızgınım
Hastayım
Sakinim
```

**Günlük Yaşam (6):**
```
Dur
Evet
Hayır
Lütfen
Oynamak
Uyumak
```

**Toplam Kadın Ses üretimi: 3 şablon (+ 29 harf ismi opsiyonel) + 1 sabit cümle + 18 AAC kelimesi + 21 yakınlık kelimesi (1 taşıyıcı cümleyle) = 43 zorunlu metin (+ 29 opsiyonel harf ismi).**

---

## B) Erkek Ses — "Coşkun" — Metin Listesi

### B1. Kutlama/başarı (6 — `celebrateSuccess()` ile rastgele biri okunur)

```
4. Harika!
5. Çok güzel!
6. Aferin!
7. Mükemmel!
8. Süpersin!
9. Bravo!
```

### B2. Teşvik/tekrar (3 — `encourageRetry()` ile rastgele biri okunur)

```
10. Tekrar deneyelim mi?
11. Bir daha bakalım
12. Birlikte bulalım
```

**Toplam Erkek Ses üretimi: 9 sabit metin.**

---

## C) Şu an kullanılmayan / gelecekte değerlendirilecek metinler

Bu metinler `src/locales/tr.json`'da tanımlı ama kod hiçbir yerde bunları bir TTS fonksiyonuna vermiyor (ölü içerik) — ElevenLabs'a geçerken ya kullanılmaya başlanır ya da temizlenir, şimdilik üretilmiyor:

```
13. Çok yaklaştın!
14. Devam et!
15. Sen yaparsın!
```

Ayrıca ekranda gösterilen ama hiç seslendirilmeyen metinler var (bilinçli bir ürün kararı olabilir, ElevenLabs'a geçerken tekrar değerlendirilmeli):
- `CalmingMode.tsx`: "Nefes al...", "Nefes ver..." — sakinleştirme modunda sesin OLMAMASI kasıtlı olabilir (sessizlik terapötik), dokunulmadan bırakılması önerilir.
- `DayComplete.tsx`: "Harfler Uyudu. Yarın Görüşürüz!", "Bugün harika bir iş çıkardın. Şimdi dinlenme zamanı." — gün sonu ekranı, seslendirilmesi iyi bir aday olabilir (Kadın ses, sakin ton).

---

## D) Dinamik metinler — ElevenLabs'a UYGUN DEĞİL, Piper'da kalmalı

Bu metinler çalışma zamanında değişen içerik (nesne/kelime adları, DB'den geliyor) — ElevenLabs'ta önceden üretilemez, Piper (ya da gelecekte ElevenLabs'ın gerçek-zamanlı API'si, ayrı bir maliyet/mimari karar) TTS zincirinde kalmalı:

- Harf Avı'nın ipucu kelimesi (`GameBoard.tsx` → `speak(randomObj.word)`) — `LETTER_OBJECTS`'teki ~240 kelime, DB'den geliyor, ebeveyn tarafından genişletilebilir.

---

## E) Kayıtlı ses efektleri (TTS DEĞİL — ayrı bir konu, bilgi amaçlı)

Bu dosyalar insan sesi değil, oyun efekti — ElevenLabs kapsamı dışında ama envanterin bütünlüğü için not edildi:

| Dosya | Kullanım | Olay |
|---|---|---|
| `public/sounds/win.mp3` | 3 oyun | Doğru cevap/eşleşme |
| `public/sounds/bonus.mp3` | Harf Avı | Round tamamlama |
| `public/sounds/error.wav` | 2 oyun | Yanlış cevap |
| `public/sounds/success.wav` | Gölge Eşleştirme | Doğru eşleşme (AUDIOS sabitinden ayrı, tutarsız kullanım — bkz. not) |
| `public/sounds/pop.wav` | Gölge Eşleştirme | Sürükleme başlangıcı |

**Bulunan tutarsızlık (kod borcu, bu dosyanın kapsamı dışı ama not edildi):** `visual-match/GameBoard.tsx` `success.wav`/`pop.wav`'ı `AUDIOS` sabiti üzerinden değil doğrudan path string ile çağırıyor — merkezi ses yönetimiyle tutarsız.

**Ayrıca:** `MemoryMatchGame.tsx`'teki kart çevirme sesi (`playFlip`) hâlâ harici `cdn.freesound.org` linkine bağlı — diğer freesound linkleri yerel dosyalarla değiştirilmişken bu biri atlanmış. Ayrı bir küçük düzeltme olarak not edildi.

---

## Uygulama sırası önerisi (kademeli geçiş)

1. **Faz 1 (en yüksek etki, en düşük risk):** B bölümündeki 9 erkek ses cümlesi + A2'deki "Bu kim?" — bunlar sabit, kısa, sık duyulan cümleler; ilk ElevenLabs üretimi burada yapılabilir.
2. **Faz 2:** A3'teki 18 AAC kelimesi — çocuğun "kendi sesi" gibi davranan, iletişim için kritik önemde metinler.
3. **Faz 2b (2026-09-15 eklendi):** A4'teki 21 yakınlık kelimesi (1 taşıyıcı cümleyle) — Aile Albümü'nün sesli ipucu butonu ve doğru-cevap toast'ı için, A3 ile benzer öncelikte (sık duyulan, sabit, kısa).
4. **Faz 3 (teknik karar gerektirir):** A1'deki harf sorma şablonları — 87-dosya mı yoksa ses-birleştirme mi kararı verilmeli, sonra üretilmeli.
5. **Kod entegrasyonu:** Her faz üretildikçe `useTurkishSpeech.ts`'e (veya yeni bir `useElevenLabsAudio.ts`'e) sabit-metin-eşleştirmeli bir önbellek katmanı eklenir — metin tanınırsa yerel dosya çalınır, tanınmazsa (dinamik kelimeler) Piper'a düşülür.

## Açık kalan kararlar

- ElevenLabs API maliyeti/kota yönetimi nasıl olacak? (Faz 3.10 "Token havuzu altyapısı" ile ilişkili olabilir.)
- Harf sorma şablonları için "87 dosya" mı "ses birleştirme" mi tercih edilecek?
- `DayComplete.tsx`'in seslendirilip seslendirilmeyeceği (şu an sessiz, bilinçli mi değil mi netleşmedi).
- Üretilen ses dosyalarının saklanacağı klasör yapısı (`public/sounds/tts/kadin/`, `public/sounds/tts/erkek/` gibi bir öneri, kesinleşmedi).
