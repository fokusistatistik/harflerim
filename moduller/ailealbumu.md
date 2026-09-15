# Aile Albümü — "Bu Kim?" (`/games/family-album`)

> Faz 2.11 denetim çeklistinin dördüncü modülü — format `moduller/harfavi.md` / `moduller/hafizakartlari.md` / `moduller/gorseleslestirme.md`'yi birebir izler.
>
> Son güncelleme: 2026-09-15 (ilk denetim — düşük riskli UI/erişilebilirlik/layout düzeltmeleri uygulandı).

## Özet

Çoktan-seçmeli tanıma oyunu: ekranda ebeveynin yüklediği gerçek bir aile bireyi fotoğrafı belirir, çocuk "Bu kim?" sorusuna 3 isim seçeneği arasından doğru cevabı seçer (dokunarak ya da ismi söyleyerek — sözlü onay isteğe bağlı bir alternatif, dokunmatik yol her zaman birincil). Ölçtüğü beceri `sosyal-tanima` (SkillAttempt). Diğer dört oyundan farklı olarak içerik havuzu proje-geneli değil, tamamen ebeveynin kendi yüklediği aile fotoğraflarından (`FamilyMember` modeli) oluşuyor — bu yüzden oyunun oynanabilmesi için ebeveyn panelinden en az 2 aile bireyi kaydı gerekiyor.

**Ana dosyalar:** `src/components/game/FamilyAlbumGame.tsx` · `src/app/games/family-album/page.tsx` · `src/actions/familyMembers.ts` (`listFamilyMembers`, `createFamilyMember`, `updateFamilyMember`, `deleteFamilyMember`) · `src/actions/skills.ts` (`recordSkillAttempt`, `getAllSkillProgress`) · `src/hooks/useHintTimer.ts`, `useRewardMoment.ts`, `useVoiceConfirm.ts`, `useGameDayBudget.ts` (paylaşılan, "GameShell" altyapısı) · `src/lib/mediaStorage.ts` (fotoğraf/ses dosyası kaydı) · `src/components/ui/parentPanel/FamilyMembersTab.tsx` (ebeveyn tarafı: kayıt ekleme/düzenleme/silme).

**Diğer dört oyuna göre en belirgin fark:** Bu modül hiçbir zaman adaptif zorluk motoruna (`adaptiveDifficulty.ts`) bağlanmadı — seçenek sayısı sabit 3 (`OPTIONS_PER_ROUND`), hedef seçimi rastgele değil sıralı bir döngü (`pool[index % pool.length]`). Bu, diğer oyunların "ilk turda sabit sistem, sonraki turda adaptif zorluk eklendi" gelişim eğrisinden farklı olarak hiç ele alınmamış bir alan.

---

## Blok (a) — Klinik/pedagojik/gelişimsel uygunluk

**Durum: Temel işlevsellik sağlam, zorluk kademesi hiç yok.**

- ❌ **Zorluk kademesi/adaptif zorluk yok.** `OPTIONS_PER_ROUND = 3` sabit — Harf Avı/Hafıza Kartları/Gölge Eşleştirme'nin üçünde de artık `detectErrorStreak` tabanlı bir adaptif motor var (çeldirici/seçenek sayısı başarıya göre ayarlanıyor); bu oyunda hiç yok. Bir çocuk zorlandığı aile bireylerinde üst üste yanlış yapabilir, sistem bunu hiç fark etmiyor.
- ⚠️ **Hedef seçimi rastgele değil, sıralı bir döngü.** `startRound(index, pool)` her zaman `pool[index % pool.length]` seçiyor — round 0 her zaman ilk kayıtlı aile bireyi, round 1 ikincisi, vs. Diğer oyunlardaki "rastgele + ardışık aynı hedef koruması" desenine göre farklı bir yaklaşım: burada zaten hiç ardışık tekrar riski yok (sıralı döngü doğası gereği), ama tahmin edilebilirlik de var — çocuk sırayı ezberleyebilir. Bilinçli bir tasarım kararı olabilir (sabit sırada gösterim = daha öngörülebilir, "Öngörülebilirlik > sürpriz" ilkesiyle bile uyumlu okunabilir), ama doğrulanmadı.
- ✅ Sakinleştirme modu bu oyunda **hiç bağlı değil** — `useCalmingModeMonitor` çağrısı yok. Diğer dört oyunun hepsinde var. Bu N/A değil, gerçek bir eksiklik olabilir: sosyal tanıma da üst üste yanlış yapıldığında çocuk için stresli olabilir.
- ✅ Rozet mekanizması aynı merkezi `recordSkillAttempt`/`Skill` katmanını kullanıyor, spam değil.
- ✅ Pekiştirme doğru cevapta `useRewardMoment` (ses + konfeti + toast) — diğer oyunlarla aynı, tutarlı.
- ✅ İpucu sistemi var: 6 saniye sonra doğru seçeneğin rengi hafifçe değişiyor (`bg-papatya-petal/40`), ismi vermiyor — makul bir ipucu şiddeti.

**Öneri (kod dışı/mimari, bu turda kapsam dışı):** Adaptif zorluk motoruna bağlanma (`getAdaptiveFamilyAlbumConfig` gibi, diğer üç oyunla aynı desen) ve sakinleştirme modu entegrasyonu — büyük bir iş değil ama kullanıcı onayı gerektirir.

---

## Blok (b) — Ebeveyn deneyimi

**Durum: Aile bireyi yönetimi güçlü, oyuna özel görünürlük/limit eksik.**

- ✅ **Aile bireyi yönetimi (`FamilyMembersTab.tsx`) eksiksiz.** Ekleme/düzenleme/silme, fotoğraf (zorunlu) + ses (isteğe bağlı, `MediaRecorder` ile tarayıcıdan kayıt) — düzenleme akışı da var (2026-09-13 denetiminde "düzenleme hiç yazılmamıştı" bulgusu daha önce kapatılmış).
- ✅ **`sosyal-tanima` becerisi `ProgressTab.tsx`'te görünüyor.** `getAllSkillProgress()` tüm `Skill` kayıtlarını filtresiz listeliyor — gerçek tarayıcıda birkaç round oynanıp ebeveyn panelinin İlerleme sekmesi açıldığında hem "👪 Sosyal Tanıma" rozetinde hem beceri ilerlemesi listesinde (yüzdelik oranla) doğrulandı.
- ❌ Günlük round (tur) limiti yok — Harf Avı/Hafıza Kartları/Gölge Eşleştirme'nin üçünde de artık `dailyXxxLimit` deseni var (ebeveyn panelinden 10-50 arası ayarlanabilir), bu oyunda hiç yok, yalnızca genel günlük ekran süresi bütçesi geçerli.
- N/A İçerik kontrol listesi/onay akışı (Müzik/Video sekmelerindeki gibi) — aile fotoğrafları zaten yalnızca ebeveyn tarafından yüklenebiliyor, ayrı bir onay adımı gerektirmiyor.

**Öneri:** `dailyFamilyAlbumLimit` deseninin eklenmesi tutarlılık açısından mantıklı olur — kod dışı, kullanıcı onayı gerektiren bir sonraki adım.

---

## Blok (c) — UI/UX

**Durum: Bu turda düzeltildi — layout, erişilebilirlik ve PC genişletme.**

- ✅ (2026-09-15) **Kırık görsel riski giderildi.** Hedef fotoğraf düz `<img>` yerine `ImageWithFallback` ile render ediliyor artık — dosya silinmiş/bozuksa kırık görsel ikonu yerine sakin bir kullanıcı ikonu placeholder'ı gösteriliyor (diğer oyunlarda zaten kullanılan desen, bu oyunda eksikti).
- ✅ (2026-09-15) **Dikey ortalama/PC boşluk sorunu düzeltildi.** Ana oyun kapsayıcısı `items-center` içeriyordu ama `justify-center` yoktu — içerik ekranın üst kısmında kümeleniyor, geniş ekranlarda (1920px) altta büyük boş alan kalıyordu. `GameHud`'ı `shrink-0` ile üstte sabit tutup geri kalan içeriği ayrı bir `flex-1 justify-center` kapsayıcısına almak suretiyle düzeltildi — geri düğmesi artık her zaman üstte, oyun içeriği dikeyde gerçekten ortalanıyor. Gerçek tarayıcıda 375/800/1920px'te doğrulandı.
- ✅ (2026-09-15) **PC'de (1920px+) içerik genişletildi.** Fotoğraf boyutuna `lg:`/`xl:` kademesi eklendi (`w-48`→`xl:w-80`) — diğer üç modülde de yapılan aynı düzeltme, burada eksikti.
- ✅ (2026-09-15) **Erişilebilirlik duyurusu eklendi (yalnızca gerekli olan kısmına).** İlk denemede hem doğru hem yanlış durumu için bir `aria-live` span'ı eklendi, ama gerçek tarayıcı testinde doğru cevabın zaten `useRewardMoment`'ın kendi toast'ı (`role="status"`, `ToastHost.tsx`) tarafından duyurulduğu görüldü — çift duyuru olmasın diye yalnızca yanlış cevap durumu (`Tekrar deneyelim`) için `aria-live` bırakıldı. Gerçek tarayıcıda hem doğru (toast üzerinden) hem yanlış (yeni span üzerinden) durumun ekran okuyucuya ayrı ayrı ulaştığı doğrulandı.
- ✅ Dokunma hedefleri: seçenek butonları `min-h-tap` + yeterli yatay dolgu (`px-6 py-3`), WCAG standardını karşılıyor.
- ⚠️ **Yanlış cevap seçildiğinde hangi butona basıldığı görsel olarak ayırt edilemiyor.** `feedback === 'wrong'` durumunda TÜM yanlış seçenekler (tıklanan dahil, tıklanmayan da dahil) aynı soluk `bg-papatya-surface` rengini alıyor — çocuk hangi seçeneği seçtiğini göremiyor, yalnızca ses (`encourageRetry`) geliyor. "Başarısızlık yok" ilkesiyle kasıtlı bir tasarım olabilir (yanlışı vurgulamamak) ama davranış belirsiz, kod değişikliği gerektiren bir tasarım kararı — bu turda dokunulmadı.
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

- ⚠️ **`/uploads/family/` klasörü middleware statik asset istisna listesinde YOK.** `middleware.ts`'in matcher'ı `sounds`, `ikonlar`, `harfler`, `karsilastirma` gibi genel/anonim içerik klasörlerini istisna tutuyor ama `uploads/family` (ve `uploads/voice`) listede değil — oturum yoksa bu dosyalara yapılan istek `/giris`'e redirect ediliyor. Bu aslında **doğru güvenlik davranışı olabilir**: aile fotoğrafları kişisel/hassas veri, `karsilastirma` gibi genel içerikten farklı olarak oturumsuz erişilebilir OLMAMALI. Pratik risk düşük (oyun ekranı zaten `getCurrentUser()` ile korunuyor, istek her zaman oturum açıkken yapılıyor olmalı) ama teorik bir senaryo var: session cookie süresi dolarsa veya tarayıcı önbellekten eski bir `<img src>` isteği tekrar denerse redirect'e düşebilir. Kasıtlı mı yoksa gözden kaçmış mı belirsiz — kullanıcı kararı gerektirir, bu turda dokunulmadı.
- ✅ Fotoğraf yükleme uzantı kısıtlaması var (`ALLOWED_EXTENSIONS`) — `mediaStorage.ts`'de tanımlı, `saveUploadedFile` izin verilmeyen uzantıları `.bin`'e çeviriyor (güvenli varsayılan).
- ✅ Fotoğraf zorunlu, ses isteğe bağlı — `createFamilyMember` doğru validasyon yapıyor.

---

## Blok (e) — Erişilebilirlik/duyusal uygunluk

**Durum: `reduceMotion` köprüsü kapsıyor; sakinleştirme modu bağlı değil (blok a'da not edildi); `sensoryProfile` proje-geneli eksik burada da var.**

- ✅ `reduceMotion` → Framer Motion köprüsü diğer oyunlarla aynı kod yolunu paylaşıyor — bu oyunda animasyon zaten minimal (geçiş renkleri, konfeti), ayrıca gerçek tarayıcıda doğrulanmadı.
- ✅ Yanlış cevapta ceza/kırmızı-çarpı yok — yalnızca nazik bir ses (`encourageRetry`), 900ms sonra otomatik sıfırlanıyor. "Başarısızlık yok" ilkesiyle uyumlu.
- ❌ `sensoryProfile` JSON'u burada da (proje-geneli, diğer tüm oyunlarla aynı) hiç okunmuyor.
- ❌ **Sakinleştirme modu bu oyuna hiç bağlanmamış** (bkz. blok a) — diğer dört oyunun hepsinde `useCalmingModeMonitor` var, bu oyunda yok. Bu, erişilebilirlik/duyusal güvenlik açısından tutarsız bir boşluk.

**Kalan:** Gerçek ekran okuyucu testi, `sensoryProfile` bağlanması, sakinleştirme modu entegrasyonu — üçü de proje-geneli veya mimari kararlar, bu turda kapsam dışı.

---

## Blok (f) — Güvenlik/gizlilik tekrar kontrolü

**Durum: Genel olarak sağlam, bir orta-risk bulgu var (blok d'deki middleware notuyla bağlantılı).**

- ✅ `recordSkillAttempt` diğer oyunlarla birebir aynı, sunucu tarafında `getCurrentUser()` ile doğrulanan güvenli desen.
- ✅ `listFamilyMembers` `where: { userId: user.id }` ile doğru filtreleniyor — başka bir kullanıcının aile bireyleri hiç sızmıyor.
- ✅ `updateFamilyMember`/`deleteFamilyMember` sahiplik kontrolü yapıyor (`member.userId !== user.id` ise reddediyor) — güvenli.
- ✅ `createFamilyMember`/`updateFamilyMember`/`deleteFamilyMember` her biri `logAudit` ile audit log'a yazıyor — "Her önemli işlem iz bırakır" ilkesiyle uyumlu.
- ✅ Dosya yükleme uzantı kısıtlaması var, dosya adları `randomUUID()` ile üretiliyor — path traversal veya dosya adı çakışması riski yok.
- ⚠️ Fotoğraf/ses dosyaları **kişisel veri** ama middleware'in koruması bu klasörlere de uygulanıyor (blok d'de detaylandırıldı) — bu satırda ayrıca not: bu aslında güvenlik AÇIĞI değil, muhtemelen fazla kısıtlayıcı (ama güvenli tarafta) bir davranış. Gözden geçirilmesi gereken nokta, davranışın kasıtlı olup olmadığı.
- ✅ Client'a sızan hassas veri yok — `FamilyMemberData` yalnızca oyunun ihtiyaç duyduğu alanları taşıyor (`id`, `name`, `relation`, `photoPath`, `voicePath`).

**Kalan:** Middleware'in `/uploads/family` ve `/uploads/voice` davranışının kasıtlı olup olmadığının netleştirilmesi — kullanıcı kararı gerektirir.

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

## Genel geliştirme önerileri — bu turda uygulanan düzeltmeler (4/4 düşük riskli)

1. ✅ Kırık görsel riski: `<img>` → `ImageWithFallback` (blok c).
2. ✅ Dikey ortalama/PC boşluk sorunu: `GameHud` sabit üstte, içerik `flex-1 justify-center` (blok c).
3. ✅ PC'de içerik genişletildi: `lg:`/`xl:` boyut kademesi (blok c).
4. ✅ Yanlış cevap için `aria-live` duyurusu eklendi (doğru cevap zaten toast ile duyuruluyordu, çift duyuru önlendi) (blok c).

**Doğrulama:** `tsc --noEmit` ve `eslint` temiz. Gerçek tarayıcıda (Playwright, `dev:agent`/3042) 375px/800px/1920px'te: giriş akışı + 3 geçici test aile bireyi eklenip (gerçek ebeveyn panel formu üzerinden) oyun ekranı test edildi — doğru/yanlış seçim akışı, aria-live duyurusu (yanlışta "Tekrar deneyelim", doğruda toast), round geçişi, boş-durum mesajı (aile bireyi silinince) doğrulandı; `ProgressTab`'de `sosyal-tanima` becerisinin göründüğü teyit edildi; konsol hatası sıfır, scroll taşması yok. Test verileri (aile bireyleri + yüklenen fotoğraflar + skill attempt/rozet kayıtları) sonunda tamamen temizlendi.

**Bu turda kod DEĞİŞTİRİLMEYEN, yalnızca öneri olarak kalan büyük/mimari bulgular (kullanıcı onayıyla kapsam dışı):**
- Adaptif zorluk motoruna bağlanma yok (blok a) — diğer üç oyunda artık var, bu oyunda hiç yok.
- Hedef seçiminin sıralı döngü olması (blok a) — rastgele değil, kasıtlı olup olmadığı doğrulanmadı.
- Sakinleştirme modu bu oyuna hiç bağlanmamış (blok a/e) — diğer dört oyunun hepsinde var.
- Günlük round limiti yok (blok b) — `dailyLetterHuntLimit`/`dailyMemoryMatchLimit`/`dailyVisualMatchLimit` desenine paralel bir alan eksik.
- Yanlış cevapta hangi seçeneğin tıklandığının görsel olarak ayırt edilememesi (blok c) — davranış değişikliği gerektiren bir tasarım kararı.
- `/uploads/family`+`/uploads/voice` klasörlerinin middleware'de istisna tutulmaması (blok d/f) — muhtemelen doğru/kasıtlı davranış ama netleştirilmedi.
- `sensoryProfile` JSON'unun oyun davranışına bağlanması (blok e) — proje-geneli, diğer dört modülde de aynı not var.

## Açık kalan işler (roadmap referansı)

- Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi ve klinik/pedagojik uzman denetimi — Faz 3'ün "Uzman denetimi" ve "Tam gerçek-cihaz QA" notlarının kapsamında, diğer dört modülle aynı insan/cihaz adımı.
- Bu modülün adaptif zorluk/sakinleştirme modu/günlük limit kapsamına hiç alınmamış olması — roadmap'e ayrı bir madde olarak işlenmesi düşünülebilir.
- Middleware'in aile fotoğrafı/ses klasörlerine yönelik davranışının kasıtlı olup olmadığının netleştirilmesi — güvenlik açısından "fazla kısıtlayıcı ama güvenli" ile "gözden kaçmış eksiklik" arasındaki fark önemli, kullanıcı kararı gerektirir.
