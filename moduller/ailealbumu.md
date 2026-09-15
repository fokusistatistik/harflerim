# Aile Albümü — "Bu Kim?" (`/games/family-album`)

> Faz 2.11 denetim çeklistinin dördüncü modülü — format `moduller/harfavi.md` / `moduller/hafizakartlari.md` / `moduller/gorseleslestirme.md`'yi birebir izler.
>
> Son güncelleme: 2026-09-15 (altıncı tur — 6sn otomatik görsel ipucu kaldırıldı, artık cevabı doğrudan vermiyor; ayrıca 5. turda minimum 3 seçenek, görsel boyutu büyütme, masaüstü boşluk düzeltmesi (kesinleştirildi), mikrofon durumu rozeti, 30sn round süresi, günlük limit varsayılanı/aralığı Aile Albümü'ne özel 25/10-100'e çekildi).

## Özet

Çoktan-seçmeli tanıma oyunu: ekranda ebeveynin yüklediği gerçek bir aile bireyi fotoğrafı belirir, çocuk "Bu kim?" sorusuna (adaptif zorluğa göre 3-4 arası, taban 2'den 3'e çekildi) **yakınlık derecesi** seçeneği arasından doğru cevabı seçer (dokunarak, yakınlık kelimesini söyleyerek, veya 30sn içinde cevap verilmezse otomatik geçilerek — sözlü onay isteğe bağlı bir alternatif, dokunmatik yol her zaman birincil). 4. turdan itibaren seçenekler ÖZEL AD değil YAKINLIK DERECESİ gösteriyor (örn. "Hatice" değil "Babaanne") — okuma-yazma bilmeyen/henüz konuşmayan bir çocuk için özel ad anlamsız, çocuğun o kişiye seslendiği kelime anlamlı; kullanıcı isteğiyle değiştirildi. Ölçtüğü beceri `sosyal-tanima` (SkillAttempt). Diğer dört oyundan farklı olarak içerik havuzu proje-geneli değil, tamamen ebeveynin kendi yüklediği aile fotoğraflarından (`FamilyMember` modeli) oluşuyor — bu yüzden oyunun oynanabilmesi için ebeveyn panelinden en az 2 aile bireyi kaydı gerekiyor.

**Ana dosyalar:** `src/components/game/FamilyAlbumGame.tsx` · `src/app/games/family-album/page.tsx` · `src/actions/familyMembers.ts` (`listFamilyMembers`, `createFamilyMember`, `updateFamilyMember`, `deleteFamilyMember`, `getFamilyAlbumDailyState`) · `src/actions/skills.ts` (`recordSkillAttempt`, `getAllSkillProgress`) · `src/hooks/useHintTimer.ts`, `useRewardMoment.ts`, `useVoiceConfirm.ts`, `useGameDayBudget.ts`, `useCalmingModeMonitor.ts` (paylaşılan, "GameShell" altyapısı) · `src/lib/mediaStorage.ts` (fotoğraf/ses dosyası kaydı) · `src/lib/adaptiveDifficulty.ts` (`getAdaptiveFamilyAlbumConfig`) · `src/config/familyRelations.ts` (kategorik yakınlık derecesi listesi) · `src/store/parentGateStore.ts` (`requestedTab` — oyundan doğrudan sekmeye yönlendirme) · `src/components/ui/parentPanel/FamilyMembersTab.tsx` (ebeveyn tarafı: kayıt ekleme/düzenleme/silme).

**Diğer dört oyuna göre en belirgin fark (2. turda kapatıldı):** Bu modül ilk denetim turunda adaptif zorluk motoruna (`adaptiveDifficulty.ts`) hiç bağlı değildi — seçenek sayısı sabit 3 (`OPTIONS_PER_ROUND`), hedef seçimi rastgele değil sıralı bir döngü (`pool[index % pool.length]`). 2. turda `getAdaptiveFamilyAlbumConfig` eklenip diğer üç oyunla aynı `detectErrorStreak` desenine bağlandı, hedef seçimi rastgele + ardışık-aynı-hedef korumasına geçirildi — artık diğer oyunlarla aynı gelişim eğrisinde.

---

## Blok (a) — Klinik/pedagojik/gelişimsel uygunluk

**Durum: Temel işlevsellik sağlam, zorluk kademesi ve sakinleştirme modu 2. turda eklendi.**

- ✅ (2026-09-15, 2. tur) **Adaptif zorluk eklendi.** `getAdaptiveFamilyAlbumConfig` (`src/lib/adaptiveDifficulty.ts`) — Harf Avı/Hafıza Kartları/Gölge Eşleştirme ile aynı `detectErrorStreak` tabanlı desen, farklı beceri anahtarı (`sosyal-tanima`). Seçenek sayısı artık sabit 3 değil, başarı oranına göre 2-4 arası (`ardisikYanlisSayisi >= 3` → 2'ye düşer, `basari >= 0.8` → 4'e çıkar). `Math.min(optionCount, members.length)` ile mevcut aile bireyi sayısını aşmıyor.
- ✅ (2026-09-15, 2. tur) **Hedef seçimi rastgele + ardışık koruma.** Eski `pool[index % pool.length]` sıralı döngüsü kaldırıldı — Gölge Eşleştirme/Harf Avı'ndaki `previousTargetIdRef` desenine geçirildi: her round havuz karıştırılıp ilk eleman seçiliyor, önceki round'un hedefiyle aynıysa bir sıra kaydırılıyor.
- ✅ (2026-09-15, 2. tur) **Sakinleştirme modu bağlandı.** `useCalmingModeMonitor('sosyal-tanima')` eklendi, `handleSelect` içinde `checkCalmingMode(isMatch)` diğer dört oyunla aynı noktada çağrılıyor — artık beş oyunun hepsinde tutarlı.
- ✅ Rozet mekanizması aynı merkezi `recordSkillAttempt`/`Skill` katmanını kullanıyor, spam değil.
- ✅ Pekiştirme doğru cevapta `useRewardMoment` (ses + konfeti + toast) — diğer oyunlarla aynı, tutarlı.
- ✅ (2026-09-15, 6. tur) **Otomatik görsel ipucu kaldırıldı.** Eski "6 saniye sonra doğru seçeneğin rengi hafifçe değişiyor" mekanizması, artık seçenekler özel ad değil yakınlık derecesi gösterdiği için cevabı doğrudan veriyordu (kullanıcı bulgusu) — tamamen kaldırıldı. Yerine manuel "Sesli ipucu" butonu (10sn sonra belirir) ve 30sn round timeout'u var, bkz. 5-6. tur notları.
- ✅ (2026-09-15, 4. tur) **Oyun artık özel ad değil yakınlık derecesi gösteriyor/soruyor.** Kullanıcı isteği: okuma-yazma bilmeyen/henüz konuşmayan bir çocuk için "Hatice" gibi özel ad anlamsız, "Babaanne"/"Amca" gibi çocuğun o kişiye seslendiği kelime anlamlı ve pedagojik olarak daha doğru. Seçenek butonları, doğru-cevap toast'ı ("Bu senin babaannen!") ve sözlü onay (`useVoiceConfirm`, artık `target.relation`'ı dinliyor — çocuğun "amca" demesi kabul edilir) hepsi güncellendi. Aynı round'da hedefle aynı yakınlığa sahip kişiler (ör. iki "Amca") çeldirici havuzundan çıkarılır — çocuğa asla aynı yazılı iki buton gösterilmez; hedef de en az bir farklı-yakınlıklı kayıt bulunan bir kişiden seçilir (aksi halde round tek seçenekli olurdu). Tüm kayıtlar aynı yakınlıktaysa (nadir, ör. yalnızca 2 "Amca" varsa) eski davranışa (ayrım yapılmadan) güvenli şekilde düşülür.
- ✅ (2026-09-15, 4. tur) **"Sesli ipucu" butonu eklendi.** 10 saniye cevapsız kalınırsa fotoğrafın altında bir buton belirir; tıklanınca `speak()` ile "Bu senin [yakınlık]" sesli söylenir. Otomatik seslenmez, bilinçli bir tasarım kararı (istenmeyen/beklenmedik ses otizmli çocuklar için rahatsız edici olabilir) — çocuk isterse dokunup kullanır. `isVoiceHintPlaying` koruması ile konuşma sırasında/hemen sonrasında mikrofon geçici kapatılır (yankı/yanlış-tetikleme riski önlenir). Bu ses metinleri `seslendirmeler.md`'nin A4 bölümüne (21 yakınlık kelimesi, 1 taşıyıcı cümle) eklendi, gelecekteki ElevenLabs geçişi için envanterlendi. (6. turda eski 6sn otomatik görsel ipucu kaldırıldığı için artık tek ipucu mekanizması bu.)

---

## Blok (b) — Ebeveyn deneyimi

**Durum: Aile bireyi yönetimi güçlü, oyuna özel günlük limit 2. turda eklendi.**

- ✅ **Aile bireyi yönetimi (`FamilyMembersTab.tsx`) eksiksiz.** Ekleme/düzenleme/silme, fotoğraf (zorunlu) + ses (isteğe bağlı, `MediaRecorder` ile tarayıcıdan kayıt) — düzenleme akışı da var (2026-09-13 denetiminde "düzenleme hiç yazılmamıştı" bulgusu daha önce kapatılmış).
- ✅ (2026-09-15, kullanıcı isteği) **Yakınlık derecesi serbest metinden kategorik `<select>`'e geçirildi.** `src/config/familyRelations.ts`'te 21 sabit seçenek (Anne, Baba, Abla, Ağabey, Kız/Erkek Kardeş, Anneanne, Babaanne, iki taraflı Dede, Teyze, Hala, Dayı, Amca, Kuzen, Yenge, Enişte gibi kan bağı olanlar + Arkadaş, Öğretmen, Bakıcı, Komşu gibi kan bağı olmayanlar) + "Diğer" (seçilince serbest metin alanı açılır). `FamilyMember.relation` şeması hâlâ düz `String` — kod tarafında kısıtlama, veritabanı değişikliği gerekmedi. Düzenleme akışında kayıtlı değer sabit listede yoksa (eski serbest-metin kayıtları) otomatik "Diğer" seçilip mevcut metin serbest alana taşınıyor — veri kaybı yok.
- ✅ (2026-09-15, kullanıcı isteği) **Fotoğraf yükleme için 1 MB boyut sınırı eklendi.** Hem client tarafında (`FamilyMembersTab.tsx`, seçim anında anlık hata mesajı) hem server tarafında (`familyMembers.ts`, `createFamilyMember`/`updateFamilyMember` içinde `MAX_PHOTO_SIZE_BYTES` kontrolü — asıl güvenlik sınırı, client kontrolü yalnızca hızlı geri bildirim). Önceden hiçbir boyut sınırı yoktu, proje genelinde de bir upload boyut sınırı deseni bulunmuyordu — ilk kez burada tanımlandı.
- ✅ **`sosyal-tanima` becerisi `ProgressTab.tsx`'te görünüyor.** `getAllSkillProgress()` tüm `Skill` kayıtlarını filtresiz listeliyor — gerçek tarayıcıda birkaç round oynanıp ebeveyn panelinin İlerleme sekmesi açıldığında hem "👪 Sosyal Tanıma" rozetinde hem beceri ilerlemesi listesinde (yüzdelik oranla) doğrulandı.
- ✅ (2026-09-15, 2. tur) **Günlük round limiti eklendi.** `dailyFamilyAlbumLimit` (`UserSettings`, varsayılan 20, 10-50 arası) — `dailyLetterHuntLimit`/`dailyMemoryMatchLimit`/`dailyVisualMatchLimit` ile birebir aynı desen: `ScreenTimeTab.tsx`'te 5. alan olarak eklendi (grid `lg:grid-cols-4`→`xl:grid-cols-5`), `updateFamilyAlbumLimit` action'ı ve `getFamilyAlbumDailyState` sorgu fonksiyonu (`familyMembers.ts`) eklendi. Oyun ekranında GameHud'ın ortasında "Bugün X/Y" rozeti gösteriliyor, limit dolunca oyun durup "Yarın devam edebilirsin!" ekranı çıkıyor (Gölge Eşleştirme ile aynı UX).
- N/A İçerik kontrol listesi/onay akışı (Müzik/Video sekmelerindeki gibi) — aile fotoğrafları zaten yalnızca ebeveyn tarafından yüklenebiliyor, ayrı bir onay adımı gerektirmiyor.

---

## Blok (c) — UI/UX

**Durum: Dört turda düzeltildi — layout, erişilebilirlik, PC genişletme, yanlış-seçenek vurgusu, fotoğraf önizlemesi, sesli ipucu.**

- ✅ (2026-09-15) **Kırık görsel riski giderildi.** Hedef fotoğraf düz `<img>` yerine `ImageWithFallback` ile render ediliyor artık — dosya silinmiş/bozuksa kırık görsel ikonu yerine sakin bir kullanıcı ikonu placeholder'ı gösteriliyor (diğer oyunlarda zaten kullanılan desen, bu oyunda eksikti).
- ✅ (2026-09-15) **Dikey ortalama/PC boşluk sorunu düzeltildi.** Ana oyun kapsayıcısı `items-center` içeriyordu ama `justify-center` yoktu — içerik ekranın üst kısmında kümeleniyor, geniş ekranlarda (1920px) altta büyük boş alan kalıyordu. `GameHud`'ı `shrink-0` ile üstte sabit tutup geri kalan içeriği ayrı bir `flex-1 justify-center` kapsayıcısına almak suretiyle düzeltildi — geri düğmesi artık her zaman üstte, oyun içeriği dikeyde gerçekten ortalanıyor. Gerçek tarayıcıda 375/800/1920px'te doğrulandı.
- ✅ (2026-09-15) **PC'de (1920px+) içerik genişletildi.** Fotoğraf boyutuna `lg:`/`xl:` kademesi eklendi (`w-48`→`xl:w-80`) — diğer üç modülde de yapılan aynı düzeltme, burada eksikti.
- ✅ (2026-09-15) **Erişilebilirlik duyurusu eklendi (yalnızca gerekli olan kısmına).** İlk denemede hem doğru hem yanlış durumu için bir `aria-live` span'ı eklendi, ama gerçek tarayıcı testinde doğru cevabın zaten `useRewardMoment`'ın kendi toast'ı (`role="status"`, `ToastHost.tsx`) tarafından duyurulduğu görüldü — çift duyuru olmasın diye yalnızca yanlış cevap durumu (`Tekrar deneyelim`) için `aria-live` bırakıldı. Gerçek tarayıcıda hem doğru (toast üzerinden) hem yanlış (yeni span üzerinden) durumun ekran okuyucuya ayrı ayrı ulaştığı doğrulandı.
- ✅ Dokunma hedefleri: seçenek butonları `min-h-tap` + yeterli yatay dolgu (`px-6 py-3`), WCAG standardını karşılıyor.
- ✅ (2026-09-15, 2. tur) **Yanlış cevapta tıklanan seçenek artık ayrı vurgulanıyor.** `wrongPickId` state'i eklendi — tıklanan yanlış seçenek `bg-papatya-rose/20` + `border-papatya-rose/50` ile (diğer yanlış/nötr seçeneklerden ayrı bir stil) işaretleniyor, 900ms sonra sıfırlanıyor. `papatya-rose` projede zaten "dikkat/uyarı" rengi olarak kullanılıyor (`MagicWordsGame.tsx`), sert bir "hata" kırmızısı değil — "Başarısızlık yok" ilkesiyle çelişmiyor, yalnızca hangi seçeneğin tıklandığını görsel olarak netleştiriyor.
- ✅ (2026-09-15, 3. tur) **Boş-durum ekranına doğrudan "Aile Bireyi Ekle" butonu eklendi.** Kullanıcı bulgusu: "en az 2 aile bireyi eklemelisiniz" mesajı yalnızca metindi, ebeveyn Ebeveyn Alanı'nı manuel açıp doğru sekmeyi bulmak zorundaydı. Çözüm: `parentGateStore.ts`'e `requestedTab`/`consumeRequestedTab` eklendi — `openPinPrompt('aile')` çağrıldığında PIN doğrulandıktan sonra `ParentGate` otomatik olarak "Aile" sekmesini açıyor. Buton PIN ekranını `requestedTab: 'aile'` ile açıyor, ebeveyn PIN'i girer girmez doğrudan aile bireyi ekleme formuna düşüyor (ara tıklama yok). Diğer üç çağrı noktası (`Header.tsx`, `NavGrid.tsx`, `HomeAvatar.tsx`) parametresiz çağırmaya devam ediyor, davranışları değişmedi (`requestedTab` `undefined` kalır, varsayılan "Genel" sekmesi açılır).
- ⚠️ Banner tanıtım kartı (`GameIntroCard variant="banner"`) her oyun açılışında yeniden görünüyor olabilir mi doğrulanmadı — `localStorage`'da kapatma tercihi tutulduğu biliniyor (kod incelemesiyle), ama bu oyunda ayrıca test edilmedi.
- ✅ (2026-09-15, 4. tur) **Fotoğraf seçildiğinde anında küçük önizleme gösteriliyor.** Kullanıcı bulgusu: "yüklenen fotoğrafın önizlemesi gelmiyor, yüklendi mi yüklenmedi mi hiç belli değil." `URL.createObjectURL` ile `FamilyMembersTab.tsx`'te (hem yeni ekleme hem düzenleme modunda mevcut fotoğraf için) anında bir küçük önizleme eklendi; obje URL'i `useEffect` cleanup ile serbest bırakılıyor, bellek sızıntısı yok.
- ✅ (2026-09-15, 4. tur) **Düzenleme modunda mevcut ses kaydı dinlenebiliyor.** "Mevcut sesi dinle" butonu eklendi — kayıt listesindeki Play butonuyla aynı desen, önceden yalnızca liste görünümünde vardı.
- ✅ (2026-09-15, 4. tur) **Ebeveyn formunda yakınlık kelimesini TTS ile dinleme.** Dropdown'dan bir yakınlık seçilince ("Diğer" hariç) yanında bir hoparlör butonu beliriyor, `useAudio().speak()` ile kelimenin sesli okunuşu duyulabiliyor — ebeveyn doğru telaffuzu/hitabı referans alabilir.
- ✅ (2026-09-15, 4. tur) **Oyun ekranında masaüstü boşluk düzeltmesi.** Kullanıcı bulgusu: masaüstünde GameHud ile içerik arasında gereksiz büyük boşluk vardı. Kök neden: `min-h-app` (`min-height`, viewport büyükse devasa alan bırakıyor) kullanılıyordu — visual-match/Harf Avı'nın kanıtlanmış `h-app overflow-hidden` (sabit yükseklik) desenine geçirildi, içerik bloğuna `overflow-y-auto` eklendi (taşma riski için). Mobil/tablet regresyon olmadan doğrulandı — boş-durum ekranları (yükleniyor, "en az 2 aile bireyi") `min-h-app` ile kaldı çünkü içerik zaten az, taşma riski yok.

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
- ✅ (2026-09-15, 6. tur) İpucu artık otomatik değil, manuel "Sesli ipucu" butonu — eski otomatik görsel renklenme (6sn) kaldırıldı çünkü yakınlık derecesi gösterimine geçildikten sonra cevabı doğrudan veriyordu.
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

## Genel geliştirme önerileri — 3. tur (kullanıcı doğrudan talebi, 5/5 tamamlandı)

1. ✅ Fotoğraf yükleme için 1 MB boyut sınırı — client + server (blok b).
2. ✅ Yakınlık derecesi kategorik `<select>`'e geçirildi (kan bağı olan/olmayan, "Diğer" ile serbest metin desteği korunuyor) (blok b).
3. ✅ Boş-durum ekranına doğrudan "Aile Bireyi Ekle" butonu — PIN sonrası otomatik "Aile" sekmesi (blok c).
4. ✅ Fotoğraf seçildiğinde anında küçük önizleme gösteriliyor — kullanıcı bulgusu: dosya seçildiğinde yalnızca dosya adı görünüyordu, doğru/bozuk yüklendiği belli değildi (blok c).
5. ✅ Düzenleme modunda mevcut ses kaydı (varsa) "Mevcut sesi dinle" butonuyla dinlenebiliyor — kayıt listesindeki Play butonuyla aynı desen, önceden yalnızca liste görünümünde vardı (blok c).

**Doğrulama (3. tur):** `tsc --noEmit` ve `eslint` temiz. Gerçek tarayıcıda (Playwright, `dev:agent`/3042):
- Dropdown'da 22 seçeneğin (21 kategori + "Diğer") tam listesi doğrulandı; "Dayı" seçilip kaydedilen kayıt listede doğru göründü.
- "Diğer" seçilince serbest metin alanının açıldığı, "Mahalle arkadaşı" gibi bir değerin doğru kaydedildiği doğrulandı.
- Düzenleme akışında hem sabit listedeki değerin (dropdown'da otomatik seçili) hem sabit listede olmayan eski/serbest bir değerin ("Diğer" otomatik seçilip metin serbest alana taşınarak, veri kaybı olmadan) doğru haritalandığı doğrulandı.
- 1 MB üstü bir dosya seçilince client tarafında anında "1 MB sınırını aşıyor" hatası çıktığı, `photo` state'inin `null` kaldığı (submit engellendiği) doğrulandı; server tarafındaki aynı kontrol kod incelemesiyle teyit edildi.
- "Aile Bireyi Ekle" butonuna tıklayıp PIN girildikten hemen sonra Ebeveyn Yönetim Alanı'nın doğrudan "Aile" sekmesinde ("Yeni aile bireyi ekle" formu görünür) açıldığı ekran görüntüsüyle doğrulandı — ara tıklama gerekmiyor.
- Fotoğraf seçilince `URL.createObjectURL` ile anında küçük bir önizleme (`w-14 h-14`) göründüğü, dosya inputunun yanında yer aldığı ekran görüntüsüyle doğrulandı; düzenleme modunda yeni fotoğraf seçilmezse mevcut kayıtlı fotoğrafın önizleme olarak göründüğü de teyit edildi.
- Ses kaydı eklenip kaydedilen bir aile bireyi düzenleme moduna alındığında "Mevcut sesi dinle" butonunun "Yeniden kaydet" butonunun yanında göründüğü, yeni bir kayıt alınana kadar kalıcı olduğu ekran görüntüsüyle doğrulandı (fake mikrofon cihazıyla, `--use-fake-device-for-media-stream`).
- Konsol hatası: yalnızca ilgisiz bir dev-sunucusu chunk 404'ü (hot-reload kaynaklı, koddan bağımsız).

Test verileri ("Test Dayı", "Test Komşu Çocuğu", "Test Ses Kişisi" + geçici 1.5MB test dosyası) UI/scratchpad üzerinden tamamen temizlendi — `FamilyMember` tablosu 0 satıra döndü.

## Genel geliştirme önerileri — 4. tur (otizm-temelli pedagojik değişiklik + UX bulgusu, kullanıcı doğrudan talebi)

1. ✅ **Oyunda özel ad yerine yakınlık derecesi gösterimi.** Seçenekler, toast, sözlü onay — hepsi `target.relation` kullanıyor artık, `target.name` değil (blok a).
2. ✅ **Aynı round'da çakışan yakınlık koruması** — iki "Amca" aynı anda gösterilmez, hedef seçimi de bu kısıtı gözetir (blok a). **Gerçek bug bulunup düzeltildi:** ilk implementasyon yalnızca çeldiricilerin HEDEFTEN farklı yakınlıkta olmasını kontrol ediyordu, çeldiricilerin BİRBİRİNDEN farklı olmasını kontrol etmiyordu — 4+ kayıtlı test verisiyle (2 "Amca" dahil) Playwright doğrulamasında bazı round'larda iki "Amca" butonunun aynı anda göründüğü tespit edildi. Düzeltme: çeldiriciler artık sırayla seçiliyor, her seçilenin yakınlığı bir `usedRelations` Set'ine eklenip sonraki adaylardan aynı yakınlıktakiler eleniyor — hem hedeften hem birbirinden farklı olmaları garanti ediliyor.
3. ✅ **"Sesli ipucu" butonu** — 10sn cevapsız kalınca belirir, tıklanınca doğru yakınlığı sesli söyler, otomatik seslenmez (blok a).
4. ✅ **Oyun ekranında masaüstü boşluk düzeltmesi** — `min-h-app` → `h-app overflow-hidden` (Harf Avı/Gölge Eşleştirme'nin kanıtlanmış deseni), mobil/tablet regresyonsuz (blok c).
5. ✅ **`seslendirmeler.md` güncellendi** — A4 bölümüne 21 yakınlık kelimesi (1 taşıyıcı cümleyle) eklendi, gelecekteki ElevenLabs geçişi için envanterlendi (kod değişikliği değil, doküman).

**Doğrulama (4. tur):** `tsc --noEmit` ve `eslint` temiz. Gerçek tarayıcıda (Playwright, `dev:agent`/3042) iki ayrı turda doğrulandı:
- İlk turda masaüstü boşluk düzeltmesi (1920x1080'de scroll yok, GameHud-içerik arası boşluk normalleşti, 375/800px regresyonsuz), yakınlık gösterimi (seçenekler/toast doğru), TTS dinleme butonu (hem ekleme hem düzenleme modunda, "Diğer"de gizli) PASS geldi — ama çeldirici çakışma korumasında GERÇEK BİR BUG bulundu (yukarıda anlatıldı) ve düzeltildi.
- İkinci turda (bug düzeltmesi sonrası) 2× "Amca" içeren bilinçli çakışma senaryosuyla 20 round oynandı — HİÇBİRİNDE aynı yazılı iki buton görülmedi, "Amca" geçen 14 round'un hepsinde tam olarak bir "Amca" vardı. PASS.

Test verileri (toplam 40+ geçici kayıt, iki turda) tamamen temizlendi, `dailyFamilyAlbumLimit` geçici olarak değiştirilip 20'ye geri döndürüldü, `FamilyMember`/`SkillAttempt(family-album)` count 0.

## Genel geliştirme önerileri — 5. tur (kullanıcı doğrudan talebi)

1. ✅ **Minimum seçenek sayısı 2'den 3'e çekildi** — `MIN_FAMILY_OPTIONS = 3` (`adaptiveDifficulty.ts`), Gölge Eşleştirme'deki "her round en az 3 alternatif" ilkesiyle aynı (blok a).
2. ✅ **Fotoğraf boyutu büyütüldü** — `w-48`→`xl:w-80`'den `w-56`→`xl:w-[26rem]`'e, her kademe ~32-96px büyüdü (blok c).
3. ✅ **Masaüstü boşluk sorunu kesin çözüldü.** Önceki turda `min-h-app`→`h-app overflow-hidden` geçişi tek başına yeterli olmamıştı — kullanıcı ekran görüntüsüyle GameHud ile "Bu Kim?" başlığı arasında hâlâ büyük boşluk olduğunu gösterdi. Kök neden: içerik bloğunda `justify-center` kullanılıyordu, içerik (1 fotoğraf + kısa buton satırı) `h-app`'in toplam yüksekliğinden çok daha küçük kaldığı için üstte/altta eşit büyük boşluk oluşuyordu. Çözüm: `justify-center` kaldırıldı, içerik artık GameHud'a yakın üstten başlıyor (doğal flex-start davranışı) (blok c).
4. ✅ **Mikrofon durumu rozeti eklendi** — Sihirli Kelimeler'deki (`MagicWordsGame.tsx`) deseni birebir kopyalandı: yeşil dolgun nokta+pulse+"Dinliyor" / kırmızı sabit nokta+"Bekliyor". `useVoiceConfirm`'ün döndürdüğü `isListening`/`isSupported` kullanılıyor, tarayıcı desteklemiyorsa rozet hiç gösterilmiyor. GameHud'ın `right` prop'unda (blok a/c).
5. ✅ **30 saniyelik round süresi eklendi.** Cevap verilmezse round otomatik bir sonraki hedefe geçer. Kullanıcı kararı: bu "yanlış" olarak kaydedilir (`recordSkillAttempt(..., false)`) — hem günlük round sayacına dahil olsun hem başarı oranını etkilesin diye (SkillAttempt tablosu ikisini de aynı kayıttan hesaplıyor, ayrıştırma büyük bir mimari değişiklik gerektirirdi). Hiçbir seçenek "tıklandı" olarak vurgulanmaz (`wrongPickId` null kalır) — çocuk hiçbir şeye dokunmadı (blok a).
6. ✅ **Günlük limit Aile Albümü'ne özel 25/10-100'e çekildi.** Kullanıcı kararı: "her oyunun sınırı ayrı olmalı" — diğer üç oyun (Harf Avı/Hafıza Kartları/Gölge Eşleştirme, 20/10-50) kasıtlı olarak DEĞİŞTİRİLMEDİ, yalnızca Aile Albümü farklı bir varsayılan/aralığa taşındı. Migration (`20260915123015_update_family_album_limit_default`) + `updateFamilyAlbumLimit` action'ının aralık kontrolü + `ScreenTimeTab.tsx`'in input min/max'ı + `getFamilyAlbumDailyState`'in fallback değeri hepsi güncellendi. Mevcut kullanıcının önceden hiç değiştirmediği 20 değeri de yeni varsayılana (25) taşındı (blok b).

**Doğrulama (5. tur):** `tsc --noEmit` ve `eslint` temiz, migration uygulandı. Gerçek tarayıcıda (Playwright, `dev:agent`/3042, mikrofon izni verilmiş context) 6 madde tek tek doğrulandı, HEPSİ PASS:
- İlk round'da (geçmiş yokken) her zaman 3 seçenek geldi, asla 2 değil.
- 1920x1080'de fotoğraf 416×416px (yeni `xl:w-[26rem]`), taşma/scroll yok.
- GameHud ile "Bu Kim?" arası boşluk normalleşti (~118px, aşırı boşluk yok); 375/800px'te de regresyonsuz.
- Mikrofon rozeti sayfa yüklenince "Dinliyor" (yeşil, pulse) durumuna geçti.
- **30sn timeout gerçek zamanlı test edildi** (31 saniye gerçekten beklendi, kısayol kullanılmadı): round otomatik yeni hedefe geçti, hiçbir seçenek "tıklandı" olarak vurgulanmadı (0 buton `wrongPickId` stilinde), günlük sayaç 3/25 → 4/25 (+1) arttı — `recordSkillAttempt(..., false)` doğru kaydedildiği doğrulandı.
- Günlük limit formu `min=10 max=100`, varsayılan 25 doğru geldi; hem tarayıcı native kısıtı hem sunucu tarafı (5 ve 150 gibi sınır dışı değerlerle) "10-100 arasında olmalı" hatasıyla doğru reddetti.

**Kritik doğrulama:** Test sırasında DB'de zaten "Emre" (Baba) dahil 4 aile bireyi kaydı vardı (kullanıcının önceki oturumlarda eklediği gerçek veriler) — test için yeni kayıt eklenmedi, "Emre" kaydına KESİNLİKLE dokunulmadığı ayrıca doğrulandı (id ile teyit edildi). Gerçek bir hata bulunmadı.

## Genel geliştirme önerileri — 6. tur (kullanıcı bulgusu, hemen ardından)

1. ✅ **6sn otomatik görsel ipucu (doğru seçeneğin otomatik renklenmesi) kaldırıldı.** Kullanıcı ekran görüntüsüyle bulgu verdi: seçenekler artık özel ad değil yakınlık derecesi gösterdiği için ("Dede (anne tarafı)" gibi) eski 6sn'lik otomatik renklenme doğrudan cevabı vermek anlamına geliyordu — çocuk hiç düşünmeden görebiliyordu. `useHintTimer([target?.id], 6000)`/`showHint`/`isHinted`/`dismissHint` tamamen kaldırıldı. Artık TEK ipucu yolu 10sn'deki manuel "Sesli ipucu" butonu — çocuk isterse kullanır, otomatik verilmez (blok a).

**Doğrulama (6. tur):** `tsc --noEmit` ve `eslint` temiz. Gerçek tarayıcıda 7. saniyede (eski otomatik ipucunun tetikleneceği an) hiçbir butonun ipucu rengini (`papatya-petal/40`) almadığı, 11. saniyede "Sesli ipucu dinle" butonunun doğru şekilde göründüğü ekran görüntüsüyle doğrulandı.

## Açık kalan işler (roadmap referansı)

- Gerçek ekran okuyucu (VoiceOver/NVDA) uçtan uca testi ve klinik/pedagojik uzman denetimi — Faz 3'ün "Uzman denetimi" ve "Tam gerçek-cihaz QA" notlarının kapsamında, diğer dört modülle aynı insan/cihaz adımı.
- `sensoryProfile` JSON'unun oyun davranışına bağlanması — proje-geneli, tüm modüllerde aynı not var, bu modüle özel değil.
- Aile fotoğrafı/ses dosyaları için disk-at-rest şifreleme veya ayrı güvenli depolama katmanı (S3+KMS gibi) — kullanıcı tarafından gündeme getirildi, BÜYÜK bir mimari değişiklik olduğu için bu turun kapsamı dışında bırakıldı, ayrı bir iş olarak ele alınmalı. Mevcut middleware tabanlı oturum koruması (blok f) yeterli görülüp bu turda korundu.
