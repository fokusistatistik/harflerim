# Aile Albümü — "Bu Kim?" (`/games/family-album`)

> Faz 2.11 denetim çeklistinin dördüncü modülü — format `moduller/harfavi.md` / `moduller/hafizakartlari.md` / `moduller/gorseleslestirme.md`'yi birebir izler.
>
> Son güncelleme: 2026-09-15 (ikinci tur — ilk turda öneriye bırakılan büyük/mimari bulguların dördü kullanıcı onayıyla uygulandı: adaptif zorluk + günlük limit, sakinleştirme modu, rastgele hedef seçimi + ardışık koruma, yanlış-seçenek görsel vurgusu).

## Özet

Çoktan-seçmeli tanıma oyunu: ekranda ebeveynin yüklediği gerçek bir aile bireyi fotoğrafı belirir, çocuk "Bu kim?" sorusuna (2. turdan itibaren adaptif zorluğa göre 2-4 arası) isim seçeneği arasından doğru cevabı seçer (dokunarak ya da ismi söyleyerek — sözlü onay isteğe bağlı bir alternatif, dokunmatik yol her zaman birincil). Ölçtüğü beceri `sosyal-tanima` (SkillAttempt). Diğer dört oyundan farklı olarak içerik havuzu proje-geneli değil, tamamen ebeveynin kendi yüklediği aile fotoğraflarından (`FamilyMember` modeli) oluşuyor — bu yüzden oyunun oynanabilmesi için ebeveyn panelinden en az 2 aile bireyi kaydı gerekiyor.

**Ana dosyalar:** `src/components/game/FamilyAlbumGame.tsx` · `src/app/games/family-album/page.tsx` · `src/actions/familyMembers.ts` (`listFamilyMembers`, `createFamilyMember`, `updateFamilyMember`, `deleteFamilyMember`) · `src/actions/skills.ts` (`recordSkillAttempt`, `getAllSkillProgress`) · `src/hooks/useHintTimer.ts`, `useRewardMoment.ts`, `useVoiceConfirm.ts`, `useGameDayBudget.ts` (paylaşılan, "GameShell" altyapısı) · `src/lib/mediaStorage.ts` (fotoğraf/ses dosyası kaydı) · `src/components/ui/parentPanel/FamilyMembersTab.tsx` (ebeveyn tarafı: kayıt ekleme/düzenleme/silme).

**Diğer dört oyuna göre en belirgin fark (2. turda kapatıldı):** Bu modül ilk denetim turunda adaptif zorluk motoruna (`adaptiveDifficulty.ts`) hiç bağlı değildi — seçenek sayısı sabit 3 (`OPTIONS_PER_ROUND`), hedef seçimi rastgele değil sıralı bir döngü (`pool[index % pool.length]`). 2. turda `getAdaptiveFamilyAlbumConfig` eklenip diğer üç oyunla aynı `detectErrorStreak` desenine bağlandı, hedef seçimi rastgele + ardışık-aynı-hedef korumasına geçirildi — artık diğer oyunlarla aynı gelişim eğrisinde.

---

## Blok (a) — Klinik/pedagojik/gelişimsel uygunluk

**Durum: Temel işlevsellik sağlam, zorluk kademesi ve sakinleştirme modu 2. turda eklendi.**

- ✅ (2026-09-15, 2. tur) **Adaptif zorluk eklendi.** `getAdaptiveFamilyAlbumConfig` (`src/lib/adaptiveDifficulty.ts`) — Harf Avı/Hafıza Kartları/Gölge Eşleştirme ile aynı `detectErrorStreak` tabanlı desen, farklı beceri anahtarı (`sosyal-tanima`). Seçenek sayısı artık sabit 3 değil, başarı oranına göre 2-4 arası (`ardisikYanlisSayisi >= 3` → 2'ye düşer, `basari >= 0.8` → 4'e çıkar). `Math.min(optionCount, members.length)` ile mevcut aile bireyi sayısını aşmıyor.
- ✅ (2026-09-15, 2. tur) **Hedef seçimi rastgele + ardışık koruma.** Eski `pool[index % pool.length]` sıralı döngüsü kaldırıldı — Gölge Eşleştirme/Harf Avı'ndaki `previousTargetIdRef` desenine geçirildi: her round havuz karıştırılıp ilk eleman seçiliyor, önceki round'un hedefiyle aynıysa bir sıra kaydırılıyor.
- ✅ (2026-09-15, 2. tur) **Sakinleştirme modu bağlandı.** `useCalmingModeMonitor('sosyal-tanima')` eklendi, `handleSelect` içinde `checkCalmingMode(isMatch)` diğer dört oyunla aynı noktada çağrılıyor — artık beş oyunun hepsinde tutarlı.
- ✅ Rozet mekanizması aynı merkezi `recordSkillAttempt`/`Skill` katmanını kullanıyor, spam değil.
- ✅ Pekiştirme doğru cevapta `useRewardMoment` (ses + konfeti + toast) — diğer oyunlarla aynı, tutarlı.
- ✅ İpucu sistemi var: 6 saniye sonra doğru seçeneğin rengi hafifçe değişiyor (`bg-papatya-petal/40`), ismi vermiyor — makul bir ipucu şiddeti.

---

## Blok (b) — Ebeveyn deneyimi

**Durum: Aile bireyi yönetimi güçlü, oyuna özel günlük limit 2. turda eklendi.**

- ✅ **Aile bireyi yönetimi (`FamilyMembersTab.tsx`) eksiksiz.** Ekleme/düzenleme/silme, fotoğraf (zorunlu) + ses (isteğe bağlı, `MediaRecorder` ile tarayıcıdan kayıt) — düzenleme akışı da var (2026-09-13 denetiminde "düzenleme hiç yazılmamıştı" bulgusu daha önce kapatılmış).
- ✅ **`sosyal-tanima` becerisi `ProgressTab.tsx`'te görünüyor.** `getAllSkillProgress()` tüm `Skill` kayıtlarını filtresiz listeliyor — gerçek tarayıcıda birkaç round oynanıp ebeveyn panelinin İlerleme sekmesi açıldığında hem "👪 Sosyal Tanıma" rozetinde hem beceri ilerlemesi listesinde (yüzdelik oranla) doğrulandı.
- ✅ (2026-09-15, 2. tur) **Günlük round limiti eklendi.** `dailyFamilyAlbumLimit` (`UserSettings`, varsayılan 20, 10-50 arası) — `dailyLetterHuntLimit`/`dailyMemoryMatchLimit`/`dailyVisualMatchLimit` ile birebir aynı desen: `ScreenTimeTab.tsx`'te 5. alan olarak eklendi (grid `lg:grid-cols-4`→`xl:grid-cols-5`), `updateFamilyAlbumLimit` action'ı ve `getFamilyAlbumDailyState` sorgu fonksiyonu (`familyMembers.ts`) eklendi. Oyun ekranında GameHud'ın ortasında "Bugün X/Y" rozeti gösteriliyor, limit dolunca oyun durup "Yarın devam edebilirsin!" ekranı çıkıyor (Gölge Eşleştirme ile aynı UX).
- N/A İçerik kontrol listesi/onay akışı (Müzik/Video sekmelerindeki gibi) — aile fotoğrafları zaten yalnızca ebeveyn tarafından yüklenebiliyor, ayrı bir onay adımı gerektirmiyor.

---

## Blok (c) — UI/UX

**Durum: İki turda düzeltildi — layout, erişilebilirlik, PC genişletme ve yanlış-seçenek vurgusu.**

- ✅ (2026-09-15) **Kırık görsel riski giderildi.** Hedef fotoğraf düz `<img>` yerine `ImageWithFallback` ile render ediliyor artık — dosya silinmiş/bozuksa kırık görsel ikonu yerine sakin bir kullanıcı ikonu placeholder'ı gösteriliyor (diğer oyunlarda zaten kullanılan desen, bu oyunda eksikti).
- ✅ (2026-09-15) **Dikey ortalama/PC boşluk sorunu düzeltildi.** Ana oyun kapsayıcısı `items-center` içeriyordu ama `justify-center` yoktu — içerik ekranın üst kısmında kümeleniyor, geniş ekranlarda (1920px) altta büyük boş alan kalıyordu. `GameHud`'ı `shrink-0` ile üstte sabit tutup geri kalan içeriği ayrı bir `flex-1 justify-center` kapsayıcısına almak suretiyle düzeltildi — geri düğmesi artık her zaman üstte, oyun içeriği dikeyde gerçekten ortalanıyor. Gerçek tarayıcıda 375/800/1920px'te doğrulandı.
- ✅ (2026-09-15) **PC'de (1920px+) içerik genişletildi.** Fotoğraf boyutuna `lg:`/`xl:` kademesi eklendi (`w-48`→`xl:w-80`) — diğer üç modülde de yapılan aynı düzeltme, burada eksikti.
- ✅ (2026-09-15) **Erişilebilirlik duyurusu eklendi (yalnızca gerekli olan kısmına).** İlk denemede hem doğru hem yanlış durumu için bir `aria-live` span'ı eklendi, ama gerçek tarayıcı testinde doğru cevabın zaten `useRewardMoment`'ın kendi toast'ı (`role="status"`, `ToastHost.tsx`) tarafından duyurulduğu görüldü — çift duyuru olmasın diye yalnızca yanlış cevap durumu (`Tekrar deneyelim`) için `aria-live` bırakıldı. Gerçek tarayıcıda hem doğru (toast üzerinden) hem yanlış (yeni span üzerinden) durumun ekran okuyucuya ayrı ayrı ulaştığı doğrulandı.
- ✅ Dokunma hedefleri: seçenek butonları `min-h-tap` + yeterli yatay dolgu (`px-6 py-3`), WCAG standardını karşılıyor.
- ✅ (2026-09-15, 2. tur) **Yanlış cevapta tıklanan seçenek artık ayrı vurgulanıyor.** `wrongPickId` state'i eklendi — tıklanan yanlış seçenek `bg-papatya-rose/20` + `border-papatya-rose/50` ile (diğer yanlış/nötr seçeneklerden ayrı bir stil) işaretleniyor, 900ms sonra sıfırlanıyor. `papatya-rose` projede zaten "dikkat/uyarı" rengi olarak kullanılıyor (`MagicWordsGame.tsx`), sert bir "hata" kırmızısı değil — "Başarısızlık yok" ilkesiyle çelişmiyor, yalnızca hangi seçeneğin tıklandığını görsel olarak netleştiriyor.
- ⚠️ Banner tanıtım kartı (`GameIntroCard variant="banner"`) her oyun açılışında yeniden görünüyor olabilir mi doğrulanmadı — `localStorage`'da kapatma tercihi tutulduğu biliniyor (kod incelemesiyle), ama bu oyunda ayrıca test edilmedi.

**Kalan:** Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi — insan/cihaz adımı, diğer dört modülde de aynı durum.

---

## Blok (d) — Görsel/işitsel içerik yeterliliği

**Durum: Sağlam — tamamen yerel, kullanıcı tarafından yüklenen içerik.**

### Harici CDN/dış bağımlılık listesi

| Varlık | Kaynak | Durum |
|---|---|---|
| Aile bireyi fotoğrafı | `FamilyMember.photoPath` → `public/uploads/family/<uuid>.jpg` (yerel dosya sistemi, `mediaStorage.ts`) | ✅ Yerel — "katı yerel işleme" ilkesine uygun, buluta/CDN'e hiç gitmiyor |
| Aile bireyi sesi (isteğe bağlı) | `FamilyMember.voicePath` → `public/uploads/voice/<uuid>.webm` | ✅ Yerel |
| Konfeti (`useRewardMoment` → `canvas-confetti`) | npm paketi, client-side üretiliyor | ✅ Harici ağ isteği yok |
| Ses efektleri (`useAudio`) | paylaşılan `AudioProvider`, yerel dosyalar | ✅ Yerel (diğer oyunlarda doğrulanmıştı) |

**Sonuç: bu oyunda hiçbir harici/CDN bağımlılığı yok** — tüm içerik ya kullanıcının kendi yüklediği (fotoğraf/ses) ya da tamamen yerel/npm paketi kaynaklı.

### Diğer bulgular

- ✅ (2026-09-15, kullanıcı kararı) **`/uploads/family/` ve `/uploads/voice/` klasörlerinin middleware istisna listesinde OLMAMASI kasıtlı bir güvenlik kararı olarak onaylandı.** `middleware.ts`'in matcher'ı `sounds`, `ikonlar`, `harfler`, `karsilastirma` gibi genel/anonim içerik klasörlerini istisna tutuyor ama aile fotoğrafı/ses klasörlerini tutmuyor — bu bilinçli: aile fotoğrafları kişisel/hassas veri, genel içerikten farklı olarak oturumsuz erişilebilir OLMAMALI. Detay için blok (f).
- ✅ Fotoğraf yükleme uzantı kısıtlaması var (`ALLOWED_EXTENSIONS`) — `mediaStorage.ts`'de tanımlı, `saveUploadedFile` izin verilmeyen uzantıları `.bin`'e çeviriyor (güvenli varsayılan).
- ✅ Fotoğraf zorunlu, ses isteğe bağlı — `createFamilyMember` doğru validasyon yapıyor.

---

## Blok (e) — Erişilebilirlik/duyusal uygunluk

**Durum: `reduceMotion` köprüsü kapsıyor; sakinleştirme modu 2. turda bağlandı; `sensoryProfile` proje-geneli eksik hâlâ burada da var.**

- ✅ `reduceMotion` → Framer Motion köprüsü diğer oyunlarla aynı kod yolunu paylaşıyor — bu oyunda animasyon zaten minimal (geçiş renkleri, konfeti), ayrıca gerçek tarayıcıda doğrulanmadı.
- ✅ Yanlış cevapta ceza/kırmızı-çarpı yok — yalnızca nazik bir ses (`encourageRetry`) + tıklanan seçeneğin yumuşak vurgusu (blok c), 900ms sonra otomatik sıfırlanıyor. "Başarısızlık yok" ilkesiyle uyumlu.
- ✅ (2026-09-15, 2. tur) **Sakinleştirme modu bağlandı** — artık beş oyunun hepsinde `useCalmingModeMonitor` tutarlı şekilde var (bkz. blok a).
- ❌ `sensoryProfile` JSON'u burada da (proje-geneli, diğer tüm oyunlarla aynı) hiç okunmuyor — bu tur kapsamı dışında, proje-geneli bir iş.

**Kalan:** Gerçek ekran okuyucu testi, `sensoryProfile` bağlanması — ikisi de proje-geneli veya mimari kararlar, bu turda kapsam dışı.

---

## Blok (f) — Güvenlik/gizlilik tekrar kontrolü

**Durum: Genel olarak sağlam, bir orta-risk bulgu var (blok d'deki middleware notuyla bağlantılı).**

- ✅ `recordSkillAttempt` diğer oyunlarla birebir aynı, sunucu tarafında `getCurrentUser()` ile doğrulanan güvenli desen.
- ✅ `listFamilyMembers` `where: { userId: user.id }` ile doğru filtreleniyor — başka bir kullanıcının aile bireyleri hiç sızmıyor.
- ✅ `updateFamilyMember`/`deleteFamilyMember` sahiplik kontrolü yapıyor (`member.userId !== user.id` ise reddediyor) — güvenli.
- ✅ `createFamilyMember`/`updateFamilyMember`/`deleteFamilyMember` her biri `logAudit` ile audit log'a yazıyor — "Her önemli işlem iz bırakır" ilkesiyle uyumlu.
- ✅ Dosya yükleme uzantı kısıtlaması var, dosya adları `randomUUID()` ile üretiliyor — path traversal veya dosya adı çakışması riski yok.
- ✅ (2026-09-15, kullanıcı kararı) **Middleware davranışı kasıtlı olarak onaylandı.** `/uploads/family` ve `/uploads/voice` klasörlerinin middleware istisna listesinde OLMAMASI — yani aile fotoğraflarının oturumsuz erişilemez olması — bilinçli bir güvenlik kararı olarak doğrulandı (aile fotoğrafları kişisel veri, `karsilastirma` gibi genel içerikten farklı olarak oturumsuz erişilebilir olmamalı). Kod değişikliği yapılmadı, mevcut davranış korunuyor. Kullanıcı ayrıca disk-at-rest şifreleme/ayrı güvenli depolama katmanı ihtimalini sordu — bu büyük bir mimari değişiklik olduğu için ayrı bir iş olarak roadmap'e not düşüldü (bkz. dosya sonu).
- ✅ Client'a sızan hassas veri yok — `FamilyMemberData` yalnızca oyunun ihtiyaç duyduğu alanları taşıyor (`id`, `name`, `relation`, `photoPath`, `voicePath`).

---

## Blok (g) — Ses/görsel efekt yeterliliği ve ihtiyaç tespiti

**Durum: Temel geri bildirimler var, sesli soru sorma tutarlı.**

- ✅ Round başında "Bu kim?" sesli olarak soruluyor (`speak('Bu kim?')`) — her round'da bir kez, çift ses riski yok (Harf Avı'ndaki bug'ın aksine burada `startRound` tek bir çağrı noktasından tetikleniyor).
- ✅ Doğru cevap: `useRewardMoment` (ses + konfeti + toast "Bu [isim]!") — kişiselleştirilmiş, sıcak bir pekiştirme.
- ✅ Yanlış cevap: `encourageRetry` sesi — ceza yok, nazik bir "tekrar dene" daveti.
- ✅ İpucu: 6 saniye sonra doğru seçeneğin rengi hafifçe değişiyor — sessiz ama düşük şiddetli bir görsel ipucu, isim vermiyor (oyunun amacını bozmuyor).
- ✅ Sözlü onay alternatifi (`useVoiceConfirm`) — dokunmatik yolun yanında ek bir seçenek, "Her otomatik onayın elle alternatifi var" ilkesiyle uyumlu (tersi yönde: burada asıl yol dokunmatik, sözlü onay ek alternatif).

**Kalan:** Yok — bu blok kapsanmış durumda.

---

## Genel geliştirme önerileri — 1. tur (düşük riskli, 4/4 tamamlandı)

1. ✅ Kırık görsel riski: `<img>` → `ImageWithFallback` (blok c).
2. ✅ Dikey ortalama/PC boşluk sorunu: `GameHud` sabit üstte, içerik `flex-1 justify-center` (blok c).
3. ✅ PC'de içerik genişletildi: `lg:`/`xl:` boyut kademesi (blok c).
4. ✅ Yanlış cevap için `aria-live` duyurusu eklendi (doğru cevap zaten toast ile duyuruluyordu, çift duyuru önlendi) (blok c).

## Genel geliştirme önerileri — 2. tur (büyük/mimari, kullanıcı onayıyla 5/5 tamamlandı)

1. ✅ Adaptif zorluk motoruna bağlandı — `getAdaptiveFamilyAlbumConfig` (blok a).
2. ✅ Günlük round limiti eklendi — `dailyFamilyAlbumLimit`, 10-50 arası, varsayılan 20 (blok b).
3. ✅ Hedef seçimi rastgele + ardışık aynı hedef koruması desenine geçirildi (blok a).
4. ✅ Yanlış cevapta tıklanan seçenek ayrıca vurgulanıyor (`papatya-rose` stili) (blok c).
5. ✅ Middleware'in `/uploads/family`+`/uploads/voice` davranışı kasıtlı güvenlik kararı olarak onaylandı, kod değişmedi (blok d/f).

**Doğrulama (1. tur):** `tsc --noEmit` ve `eslint` temiz. Gerçek tarayıcıda (Playwright, `dev:agent`/3042) 375px/800px/1920px'te: giriş akışı + 3 geçici test aile bireyi eklenip (gerçek ebeveyn panel formu üzerinden) oyun ekranı test edildi — doğru/yanlış seçim akışı, aria-live duyurusu (yanlışta "Tekrar deneyelim", doğruda toast), round geçişi, boş-durum mesajı (aile bireyi silinince) doğrulandı; `ProgressTab`'de `sosyal-tanima` becerisinin göründüğü teyit edildi; konsol hatası sıfır, scroll taşması yok. Test verileri sonunda tamamen temizlendi.

**Doğrulama (2. tur):** `tsc --noEmit` ve `eslint` temiz, migration (`20260915081055_add_daily_family_album_limit`) uygulandı. Gerçek tarayıcıda (Playwright, `dev:agent`/3042) 375px/800px/1920px'te: ebeveyn paneli üzerinden 3 geçici test aile bireyi eklendi (`public/karsilastirma/` altındaki mevcut görseller kullanıldı), oyun ekranı test edildi —
- GameHud'ın ortasındaki "Bugün X/20" günlük round rozeti üç viewport'ta da doğru göründü.
- Doğru cevapta yeşil buton + toast + otomatik round geçişi; yanlış cevapta tıklanan seçeneğin `papatya-rose` arka plan/border ile ayrı vurgulandığı **ekran görüntüsüyle** doğrulandı (salt metinsel kontrole güvenilmedi).
- Hedef seçiminin rastgele olduğu ve seçenek sayısının (`optionCount`) adaptif olarak 2-3 arası değiştiği gözlemlendi.
- Sakinleştirme modu test sırasında **organik olarak tetiklendi** — tam ekran nefes overlay'i (`CalmingMode.tsx`) doğru çalıştı.
- Günlük limit organik olarak dolduğunda (round sayısı 20'yi geçince) "Bugünkü 20 turluk hakkın doldu / Yarın devam edebilirsin!" ekranı doğru render oldu, rozet o durumda gizlendi.
- 1920px'te layout diğer oyunlarla tutarlı, taşma/boşluk yok; konsol/network'te hydration hatası, React uyarısı, 4xx/5xx sıfır.

Test verileri (3 aile bireyi + yüklenen fotoğraflar) UI üzerinden silindi, `dailyFamilyAlbumLimit` zaten hiç değiştirilmemişti (20 kaldı) — DB'de kalıcı kirlilik yok, `FamilyMember` tablosu 0 satıra döndü.

## Açık kalan işler (roadmap referansı)

- Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi ve klinik/pedagojik uzman denetimi — Faz 3'ün "Uzman denetimi" ve "Tam gerçek-cihaz QA" notlarının kapsamında, diğer dört modülle aynı insan/cihaz adımı.
- `sensoryProfile` JSON'unun oyun davranışına bağlanması — proje-geneli, tüm modüllerde aynı not var, bu modüle özel değil.
- Aile fotoğrafı/ses dosyaları için disk-at-rest şifreleme veya ayrı güvenli depolama katmanı (S3+KMS gibi) — kullanıcı tarafından gündeme getirildi, BÜYÜK bir mimari değişiklik olduğu için bu turun kapsamı dışında bırakıldı, ayrı bir iş olarak ele alınmalı. Mevcut middleware tabanlı oturum koruması (blok f) yeterli görülüp bu turda korundu.
