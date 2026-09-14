# Harf, Sayı ve İkon Varlıkları

> Kullanıcının hazırladığı özgün (kırmızı-mercan tonu, düz vektör, şeffaf PNG) harf/sayı/ikon setinin envanteri ve entegrasyon kaydı. `PROMPTLAR.md`/`seslendirmeler.md` deseniyle aynı — kaynak, karar ve durum tek yerde.
>
> Oluşturulma: 2026-09-14.

## Kaynak

- **`public/harfler/`, `public/sayilar/`, `public/ikonlar/`** — kullanıcının `hardsayiikon` klasöründen işlenen 55 görsel (29 harf + 10 sayı + 16 ikon).
- **`public/ikonlar/nav_*.png`** — kullanıcının `diger` klasöründen işlenen 9 ek görsel (NavGrid ana sayfa kartları için).
- Tüm görseller `sharp` ile 888×888'e (`fit: contain`, şeffaf zemin korunarak) standardize edildi, `png` formatında, kayıpsız sıkıştırma.

---

## A) Harfler (29/29 — tam)

`src/store/gameData.ts`'teki `LETTER_IMAGES` zaten bu dosya adlarını bekliyordu (Faz 3.16 hazırlığı) — dosyalar eklenince kod tarafında hiçbir değişiklik gerekmedi, `ImageWithFallback` otomatik olarak gerçek görsele geçti.

| Harf | Dosya | Harf | Dosya | Harf | Dosya |
|---|---|---|---|---|---|
| A | `harf_a.png` | I | `harf_i_noktasiz.png` | S | `harf_s.png` |
| B | `harf_b.png` | İ | `harf_i.png` | Ş | `harf_s_noktali.png` |
| C | `harf_c.png` | J | `harf_j.png` | T | `harf_t.png` |
| Ç | `harf_c_cedil.png` | K | `harf_k.png` | U | `harf_u.png` |
| D | `harf_d.png` | L | `harf_l.png` | Ü | `harf_u_noktali.png` |
| E | `harf_e.png` | M | `harf_m.png` | V | `harf_v.png` |
| F | `harf_f.png` | N | `harf_n.png` | Y | `harf_y.png` |
| G | `harf_g.png` | O | `harf_o.png` | Z | `harf_z.png` |
| Ğ | `harf_g_breve.png` | Ö | `harf_o_noktali.png` | | |

**Kullanıldığı yerler:** Harf Avı (`GameBoard.tsx` — `DraggableToken`, `TargetFrame`), Gölge Eşleştirme (`visual-match/GameBoard.tsx`).

**Durum:** ✅ Tamamlandı, entegre. Faz 3.16 ("Harf Avı güçlendirilecek harfler" — roadmap) bu maddeyle **kapatıldı**; Harf Avı'nın harf kartları artık tamamen özgün.

**2026-09-14 bulgu + düzeltme:** Harf Avı'nın gerçek harf görseli kaynağı `gameData.ts`'teki `LETTER_IMAGES` sabiti **değil**, veritabanındaki `ContentSet.imageUrl` alanı (`src/actions/content.ts` → `getGameContent()`, `prisma/seedContent.ts` ile doldurulur — dosya başındaki uyarı yorumunda zaten "yalnızca seed kaynağı" diye belirtilmişti). 29 PNG kod tarafına eklendiğinde `seedContent.ts` yeniden çalıştırılmamıştı, bu yüzden Harf Avı'nda kartlar görsel yerine düz renkli metne (`ImageWithFallback`'in `fallback`'i) düşüyordu. `npx tsx prisma/seedContent.ts` çalıştırılıp (idempotent upsert, 29/29 harf + 71/71 kelime) veritabanı senkronize edildi — kod değişikliği gerekmedi, sadece veri taşıma adımı atlanmıştı.

---

## B) Sayılar (10/10 — public'te hazır, henüz kullanım yeri yok)

| Sayı | Dosya |
|---|---|
| 0-9 | `sayi_0.png` … `sayi_9.png` |

**Durum:** ⏳ Yalnızca `public/sayilar/`'a işlenip kondu. Projede şu an sayı/matematik temalı hiçbir oyun/bileşen yok (denetimde doğrulandı — "hesap makinesi tarzı" bir özellik henüz planlanmadı, kod tarafında yeni bir özellik AÇILMADI, bilinçli bir kapsam sınırı). Gelecekte bir sayı oyunu yazılınca doğrudan kullanılabilir.

---

## C) İkonlar (25 dosya toplam)

### C1. Orijinal 16 ikon — durum

| İkon | Dosya | Durum | Kullanım yeri |
|---|---|---|---|
| home | `home.png` | ✅ Entegre | `GameHud.tsx` (tüm oyunlar), `Header.tsx` (global navbar), `MemoryMatchGame.tsx` (mod seçim "Ana Sayfaya Dön") |
| kilit | `kilit.png` | ✅ Entegre | `NavGrid.tsx` ("yakında" rozeti — şu an hiçbir kart bu durumda değil ama kod hazır) |
| cop | `cop.png` | ✅ Entegre | `DrawingBoard.tsx` ("Temizle" butonu) |
| çarpı | `carpi.png` | ✅ Entegre | `GameIntroCard.tsx` (banner kapatma) |
| yıldız | `yildiz.png` | ✅ Entegre | `app/page.tsx` (ana sayfa avatar rozeti) |
| nota | `nota.png` | ✅ Entegre (2026-09-14) | `navAreas.ts` — Müzik Köşesi NavGrid kartı |
| yaz | `yaz.png` | ⏳ Bağlanmadı | `nav_writing_practice.png` (aşağıda) bu amaç için kullanıldı, bu orijinal dosya beklemede |
| play | `play.png` | ⏳ Bağlanmadı | Yalnızca ebeveyn panelinde (`FamilyMembersTab.tsx`) kullanılıyor — kapsam dışı (çocuk ekranı değil) |
| geri | `geri.png` | ⏳ Bağlanmadı | Net bir kullanım senaryosu bulunamadı (bkz. not aşağıda) |
| ayarlar | `ayarlar.png` | ⏳ Bağlanmadı | Kodda `Settings` ikonu hiç kullanılmıyor, karşılığı yok |
| arama | `arama.png` | ⏳ Bağlanmadı | Kodda `Search` ikonu hiç kullanılmıyor, karşılığı yok |
| kupa | `kupa.png` | ⏳ Bağlanmadı | Kodda `Trophy` hiç kullanılmıyor — gelecekteki bir "başarılar" ekranı adayı |
| madalya | `madalya.png` | ⏳ Bağlanmadı | Kodda `Award` hiç kullanılmıyor — gelecekteki bir "başarılar" ekranı adayı |
| kalp | `kalp.png` | ⏳ Bağlanmadı | Kodda `Heart` hiç kullanılmıyor — gelecekteki bir "favori/sevdiklerim" adayı |
| ses_a | `ses_a.png` | ✅ Entegre (2026-09-14) | `navAreas.ts` — Sihirli Kelimeler NavGrid kartı. Not: kavramsal olarak hoparlör (ses-çıkışı) ikonu, oyunun mikrofon (ses-girişi) temasıyla tam örtüşmüyor — kullanıcı onayıyla bilinçli olarak kullanıldı, daha uygun bir mikrofon görseli gelirse değiştirilebilir |
| ses_k | `ses_k.png` | ⏳ Bağlanmadı | ses_a'nın "sessiz" hali (aynı hoparlör, dalgasız) — henüz bir ses aç/kapat toggle'ı olmadığı için kullanım yeri yok |

**Not — `geri.png`:** GameHud'daki "Geri" butonu aslında "Ana Sayfa"ya dönüş anlamında (`home.png` ile eşleşti). `WritingPractice.tsx`'teki önceki/sonraki harf okları çift yönlü (sol+sağ) ama elimizde yalnızca tek yönlü (sol) bir ok var — tutarsız görünmesin diye o da bağlanmadı. Net bir "geri dön" senaryosu (örn. çok adımlı bir akışta bir önceki adıma dönme) ortaya çıkınca kullanılabilir.

### C2. NavGrid ana sayfa kartları — 9 yeni eşleşme (`diger` klasöründen)

Kullanıcının onayıyla, `diger` klasöründeki JPG'ler NavGrid'in (ana sayfa kart ızgarası) daha önce yalnızca lucide-react ikonlarıyla temsil edilen kartlarına eşleştirildi. **2026-09-14 güncellemesi:** kullanıcı aynı 9 görselin şeffaf zeminli PNG hallerini `diger` klasörüne ekledi (JPG'lerin beyaz/krem zemini kart arka planıyla çakışıyordu) — kaynak JPG yerine bu PNG'ler işlenip aynı dosya adlarının üzerine yazıldı, kod tarafında değişiklik gerekmedi. Aynı turda `NavGrid.tsx`'teki kart görseli sınıfı da `object-contain drop-shadow-lg` yerine `object-cover rounded-full shadow-lg` yapıldı (dairesel + yakınlaştırılmış görünüm).

| Kaynak dosya | Hedef dosya | Kart | Önceki (lucide) |
|---|---|---|---|
| `harf.jpg` (büyüteç+A) | `nav_letter_hunt.png` | Harf Avı | *(zaten `imageSrc` vardı, ölü CDN linkiydi — bu turda düzeltildi)* |
| `hafiza_kart.jpg` (beyin) | `nav_memory_match.png` | Hafıza Kartları | `LayoutGrid` |
| `sekiller.jpg` (kare/daire/üçgen) | `nav_visual_match.png` | Gölge Eşleştirme | `Puzzle` |
| `konusma.jpg` (2x2 sembol grid) | `nav_aac_board.png` | İletişim Tahtası | `MessageSquare` |
| `video.jpg` (TV+play) | `nav_cartoon.png` | Çizgi Filmim | `Clapperboard` |
| `aile.jpg` (fotoğraf çerçevesi) | `nav_family_album.png` | Aile Albümü | `Images` |
| `boyama.jpg` (ressam paleti) | `nav_drawing_board.png` | Çizim Tahtası | `Paintbrush` |
| `yaziyaz.jpg` (kalem+nokta harf) | `nav_writing_practice.png` | Yazı Alıştırması | `PenLine` |
| `kilitli.jpg` (anahtar+kişi) | `nav_parent_area.png` | Ebeveyn Alanı | `ShieldCheck` |

**Bağlanmayan (`magic-words`, `music-corner`):** Sihirli Kelimeler (mikrofon/ses tanıma oyunu) ve Müzik Köşesi için `diger` klasöründe uygun bir görsel yoktu — ikisi de hâlâ lucide-react ikonlarında (`Mic`, `Music`) kalıyor. `ImageWithFallback` deseni sayesinde kod karma yapıyı (bazı kartlar PNG, bazıları lucide) sorunsuz destekliyor — `src/config/navAreas.ts`'te `imageSrc` yoksa otomatik olarak `NavGrid.tsx`'in `ICONS` haritasındaki lucide component'ine düşüyor.

**Kullanılmayan JPG'ler (kullanıcının "havuzda kalsın" dediği fazlalıklar):** `abc.jpg`, `cizim.jpg` (boyama.jpg tercih edildi), `araclar.jpg`, `doga.jpg`, `esyalar.jpg`, `hayvanlar.jpg`, `meyveler.jpg`, `sayilar.jpg`, `sebzeler.jpg` — bunlar kategori/tema görselleri, `diger` klasöründe (işlenmeden) duruyor, gelecekte bir içerik kategorisi özelliği için değerlendirilebilir.

---

## Kapsam kararları (bu tur için)

Kullanıcı onayıyla belirlenen sınırlar:

1. **Sayılar** — yalnızca `public/`'e eklendi, yeni bir oyun/özellik kodlanmadı.
2. **İkonlar, kapsam:** yalnızca **çocuğun gördüğü oyun ekranları** (GameHud, oyun içi butonlar, ana sayfa) — ebeveyn paneli (ParentGate, tüm tab'lar: `MusicTab`, `FamilyMembersTab`, vb.) kasıtlı olarak **dokunulmadı**, lucide-react'te kalıyor (yetişkin/teknik arayüz, ayrı bir görsel dil taşıyabilir).
3. **Eşleşmeyen 6 ikon** (nota, yaz, play, geri, ayarlar, arama, kupa, madalya, kalp, ses_a, ses_k — 11 aslında) public'te hazır bekliyor, hiçbir yere bağlanmadı — yanlış/zorlama bir eşleştirme yapmaktansa boş bırakmak tercih edildi.

## Bu turda düzeltilen yan bulgular

- `src/config/navAreas.ts`'teki `letter-hunt` kartının `imageSrc`'i hâlâ ölü `static.fokusistatistik.com` CDN'ine bağlıydı (daha önceki bir denetimde bulunmuş ama bu alan gözden kaçmış) — `nav_letter_hunt.png`'ye düzeltildi.
- `TargetFrame.tsx`'te kullanılmayan bir `Lock` import'u vardı (yorum satırında "if needed" diyordu, hiç kullanılmamıştı) — temizlendi.
- `GameCard.tsx` component'i incelendi, projede **hiçbir yerde kullanılmadığı** doğrulandı (muhtemelen `NavGrid.tsx`'in eski öncülü) — dokunulmadı, ayrı bir temizlik kararı gerektirir.

## Sonraki adım önerileri

- `kupa`/`madalya`/`kalp` — bir "Başarılarım" ekranı (Faz 3.8 içgörü raporuyla ilişkilendirilebilir) tasarlanırsa doğrudan kullanılabilir.
- `arama` — bir içerik arama/filtre özelliği eklenirse kullanılabilir.
- Sayılar — bir sayı/matematik oyunu (kullanıcının "hesap makinesi tarzı" dediği) tasarlanınca `public/sayilar/` zaten hazır.
- `ses_a`/`ses_k` — genel bir "sesi aç/kapat" toggle'ı eklenirse (şu an projede böyle bir kontrol yok) kullanılabilir.
