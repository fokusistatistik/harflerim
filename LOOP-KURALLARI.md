# Papatya — Loop Çalışma Kuralları

**Sürüm 1.2 · 12 Eylül 2026 — Mühürlenmiş**

Bu belge, Papatya geliştirmesinde `/loop` aracının nasıl kullanılacağını tarif eder. [YOL-HARITASI.md](YOL-HARITASI.md)'nin altında çalışır — burada yazan hiçbir kural yol haritasındaki Yönetişim bölümünü geçersiz kılmaz, onu uygulamanın operasyonel biçimidir.

---

## `/loop` gerçekte ne yapar

`/loop`, siz ortamda değilken belirli aralıklarla (varsayılan olarak 20–30 dakika) kendiliğinden uyanan bir zamanlayıcıdır. Her uyanışında:

- **Konuşmada zaten onaylanmış işi sürdürür** — yarım kalan bir implementasyon, "sonra yaparım" denilen bir iş, açık bir PR'ın bakımı. Kendiliğinden yeni iş icat etmez.
- **Geri dönüşü olan işlerde** (yerel dosya düzenleme, test çalıştırma, migration oluşturma) kendi kararını verip devam eder.
- **Geri dönüşü olmayan işlerde** (push, silme, force işlemler, dış sistemlere gönderim) bir sonraki onaya kadar bekler.
- **Art arda 3 tur** hiçbir ilerleme bulamazsa kendini durdurur.

Bu belge, bu mekanizmanın üstüne Papatya'ya özgü ek kısıtları ve onay akışını bindirir.

---

## 1. Loop öncesi: tam onay ve net kapsam

Bir loop **asla kendiliğinden başlamaz.** Her loop için önce şunlar netleşir ve konuşmada açıkça yazılır:

- **Kapsam:** Loop'un yapacağı işlerin listesi (hangi dosyalar, hangi özellik, hangi faz maddesi).
- **Sınır:** Loop'un yapmayacağı, dokunmayacağı şeyler.
- **Muallak konular:** Kapsam içinde belirsiz kalan hiçbir nokta olmadan loop başlamaz — belirsizlik varsa loop başlamadan önce sorulur ve karara bağlanır.

> Onaysız loop yoktur. Kapsamsız loop yoktur. Muallak soru taşıyan loop yoktur.

**Geniş kapsam bölümlenir.** "Tüm Faz 1'i tamamla" gibi büyük bir kapsam onaylanırken, loop başlamadan önce bu kapsam Yol Haritası'ndaki numaralandırılmış maddelere (1.4, 1.5, 1.6...) bölünür ve loop bu sırayla ilerler. Loop sonu raporu da bu maddelere göre yazılır — hangi madde tamamlandı, hangisi açık kaldı.

**Aynı anda tek loop çalışır.** Yeni bir loop başlatılmadan önce önceki loop'un bittiği veya durdurulduğu teyit edilir. İki loop aynı anda aynı dosyaya/veritabanına yazmaz.

## 2. Loop sırasında: kesinti yaratılmaz

Loop başladıktan sonra, siz açıkça **"bilgisayar başındayım"** demediğiniz sürece loop durmadan, ara onay istemeden sonuna kadar ilerler. Sorular ve sorunlar loop sırasında sorulmaz — biriktirilir, loop sonunda birlikte tartışılır. Bunun tek istisnası, aşağıdaki risk eşiğini aşan durumlardır.

## 3. Risk eşiği: ne zaman durulur, ne zaman devam edilir

| | Kural |
|---|---|
| **DUR ve sor** | Kapsamın dışına çıkan her şey: planlanmamış bir dosya/dizin değişikliği, kapsamda olmayan bir bağımlılık, yol haritasına aykırı bir yön değişikliği, veri/dosya silme, `.env`/gizli anahtar değişikliği, `git push --force`, dal silme gibi geri dönüşü olmayan işlemler. |
| **YAP ve not düş** | Yalnızca önceden onaylanmış kapsamın içindeki işler: kapsamda tanımlı yeni tablo/migration, kapsamda tanımlı yeni dosya/bileşen, kapsamda tanımlı bağımlılık ekleme, refactor, UI değişikliği, test yazma. |

Öngörülemeyen bir durumla karşılaşılırsa: kapsam içindeyse ve risk seviyesi düşükse yapılır ve not düşülür; kapsam dışındaysa loop durur ve sorulur; risk seviyesi belirsizse **daha sonra tartışılmak üzere pas geçilir** — loop bir sonraki maddeye geçer, geri dönmez.

## 3b. Commit ve push ayrımı

Loop içinde anlamlı her adımda **yerel commit** atılır — açıklayıcı bir mesajla, geri dönüş noktası oluşturacak sıklıkta. Bu, madde 3'teki "kapsam içi, geri dönüşü olan" işlerin doğal bir uzantısıdır. `git push`, PR açma ve dış sistemlere gönderim ise her zaman risk eşiğinin **DUR ve sor** tarafında kalır — loop bunları kendiliğinden yapmaz, loop sonunda ayrıca onaylanır.

## 3c. Çalışma ortamı işlemleri

Dev sunucusu başlatma/durdurma, port çakışması çözme, bağımlılık kurma gibi yerel geliştirme ortamını çalışır tutan işlemler her zaman **kapsam içi ve serbesttir** — bunlar veri veya kalıcı kod değiştirmez, yalnızca ortamı ayakta tutar. Loop bunları onay beklemeden yapar.

## 3d. Hata ve istisna protokolü

Loop bir hata/istisnayla karşılaşınca (migration başarısız, test kırılıyor, beklenmeyen derleme hatası): önce kök nedeni teşhis eder ve **sınırlı sayıda** makul düzeltme dener. Çözülürse devam eder ve düzeltmeyi loop sonu raporuna yazar. Çözülmezse **loop durmaz** — o maddeyi "çözülemedi" olarak işaretleyip bir sonraki işe geçer; gereksiz bir döngüye girip aynı hatayı tekrar tekrar denemez. Çözülemeyen her hata, loop sonu raporunun "açık sorular" bölümünde açıkça listelenir.

## 3e. Modüler mimari ve her tur sonu kod kontrolü

Kod **profesyonel, ölçeklenebilir ve modüler** yazılır — tek dosyaya yığılmış mantık, kopyala-yapıştır tekrarı (bkz. bugünkü `GameBoard.tsx` / `MemoryMatchGame.tsx` benzerliği) ve gizli bağımlılıklar loop içinde büyütülmez, fark edildikçe düzeltilir. Her loop maddesi kapanmadan önce şu kontrol zorunludur:

1. **Tip kontrolü** (`tsc --noEmit`) hatasız geçer.
2. **Lint** (`next lint` / eslint) uyarısız veya bilinçli olarak göz ardı edilenler açıkça not edilerek geçer.
3. **Hızlı manuel deneyim kontrolü** — değişen akış gerçekten denenir (dev sunucusu üzerinden), sadece "derlendi" ile yetinilmez.

Bu üçü geçmeden bir madde "tamamlandı" sayılmaz; geçmiyorsa madde 3d'deki hata protokolü devreye girer.

## 4. Migration ve veritabanı yetkisi (geliştirme dönemi)

Geliştirme sürecinde olduğumuz için **migration'lar ve şema değişiklikleri risk eşiğinin dışındadır** — bunlar "kapsam içi" sayılır ve loop içinde onaysız yapılabilir. Bu, kalıcı bir kural değil, geliştirme dönemine özgü geçici bir geniş yetkidir. Üretim verisi (gerçek kullanıcı verisi) barındırmaya başladığımızda bu madde daraltılır ve migration'lar da risk eşiğinin "dur ve sor" tarafına geçer.

## 5. Yol haritasına ve marka kimliğine bağlılık

Loop içindeki hiçbir işlem [YOL-HARITASI.md](YOL-HARITASI.md)'deki Yönetişim ilkelerine (katı yerel işleme, klinik sınır, anti-bağımlılık mimarisi, vb.) veya Papatya marka kimliğine (ana renk paleti, tipografi, sekiz yapraklı papatya metaforu) aykırı bir yön değişikliği yapamaz. Yol haritasına aykırı bir gereklilik ortaya çıkarsa bu otomatik olarak "kapsam dışı" sayılır ve loop durur.

## 6. Öncelik sırası: istatistiksel veri temelli yaklaşım

Papatya bir istatistikçi tarafından geliştiriliyor. Bu, teknik tercihlerde bir öncelik sırası anlamına gelir: özellik kararları mümkün olduğunca **ölçülebilir veriye** dayanır — varsayıma değil. Bu ilke pratikte şunu gerektirir:

- Yeni bir oyun mekaniği veya zorluk ayarı eklenirken, onu ölçecek bir olay/analiz kaydı da birlikte tasarlanır (bkz. Yol Haritası 3.1).
- Loop içinde "bu iyi çalışıyor gibi görünüyor" türü öznel değerlendirme yerine, mümkün olduğunda ölçülebilir bir gerekçe tercih edilir.
- Bu ilke, klinik sınır sözleşmesini geçersiz kılmaz: veri toplanır ve sunulur, yorum/tanı yapılmaz.

## 7. Üç cihaz denetimi zorunludur

Loop içinde arayüze dokunan her iş, kapanmadan önce **telefon, tablet ve PC** boyutlarının üçünde de gözden geçirilir. Bu bir seçenek değil, her arayüz değişikliğinin loop sonu kontrol listesinin parçasıdır (bkz. Yol Haritası 1.7 — Üç cihaz ölçeklemesi).

## 8. Tema yönetimi merkezidir

Açık mod, koyu mod ve sistem modu renk paletleri **tek bir merkezi token kaynağından** yönetilir (bkz. Yol Haritası 1.6 — Tasarım tokeni katmanı). Loop içinde hiçbir bileşene doğrudan, tokensiz renk değeri yazılmaz. Yeni bir renk ihtiyacı doğarsa önce merkezi tema dosyasına eklenir, sonra kullanılır.

## 9. UI/UX ve güvenlik önceliği

Kullanıcı dostu arayüz ile otizmli bireyin güvenliği çakıştığında, güvenlik kazanır — ama bu bir "ya biri ya diğeri" seçimi değildir. Loop içindeki her tasarım kararı önce Yol Haritası'ndaki **Değişmeyen tasarım ilkeleri** tablosundan (öngörülebilirlik, sakin varsayılan, başarısızlık yok, vb.) süzülür. Bir kısayol güvenlik ilkelerinden birini zayıflatıyorsa, o kısayol alınmaz.

## 10. Mahremiyet ve KVKK farkındalığı

Loop içinde yazılan hiçbir kod, Yol Haritası'ndaki **veri güvenliği anayasasını** (katı yerel işleme) ihlal edecek bir veri yolu açamaz. Kişisel veri (aile fotoğrafı, ses, konum, sağlık/gelişim verisi) işleyen her yeni özellik, kapsamı onaylanırken KVKK açısından da gözden geçirilir; bu gözden geçirme loop başlamadan önce yapılır, loop içinde değil.

## 11. Loop öncesi risk tartışması

Bir loop'un kapsamı onaylanmadan önce, o kapsamdaki işlerin taşıdığı riskler ayrıca ve açıkça konuşulur ve karara bağlanır — "muallak konu netleştirme" adımının bir parçası olarak, ama ayrı bir başlık altında ele alınır: *bu işin ne türden riskleri var, hangi karşı önlem alınacak.* Yol Haritası'ndaki risk tablosuna yeni bir risk türü ekleniyorsa, o satır da bu aşamada yazılır.

## 12. Loop sonu raporu

Her loop, aşağıdaki üç başlıklı kısa bir raporla kapanır — bu rapor sohbette kalır, dosyaya işlenmez:

1. **Tamamlanan işler** — ne yapıldı, hangi dosyalar değişti.
2. **Loop içinde alınan ufak kararlar** — kapsam içi ama önceden tam olarak belirtilmemiş noktalarda ne karar verildi ve neden.
3. **Açık sorular / pas geçilenler** — sizinle birlikte karara bağlanması gereken, loop'un durup beklediği veya bilerek atladığı konular; çözülemeyen hatalar da burada listelenir.

Bu rapora ek olarak, **kalıcı önemdeki kararlar** (bir tablo neden öyle modellendi, bir mimari tercih neden yapıldı gibi gerekçeler) Claude'un kalıcı hafıza sistemine kısa bir özet olarak kaydedilir — böylece yeni bir oturum veya loop, aynı gerekçeyi tekrar sormaz. Rapor kendisi dosyaya işlenmez, yalnızca bu tür kalıcı gerekçe özetleri hafızada kalır.

---

## Bu kuralların değişimi

Bu belge de Yol Haritası gibi mühürlenmiştir. Bir kural değiştirilecekse bu, bir loop'un içinde değil, yeni bir onay turunda yapılır — kuralın kendisini değiştirmek de kapsam dışı bir iştir.
