# Papatya — Loop Çalışma Kuralları

**Sürüm 2.0 · 12 Eylül 2026 — Mühürlenmiş**

Bu belge, Papatya geliştirmesinde `/loop` aracının nasıl kullanılacağını tarif eder — yalnızca `/loop` özelinde geçerli süreç kurallarını içerir. Genel (loop içinde olsun olmasın her zaman geçerli) çalışma standartları [GENEL-KURALLAR.md](GENEL-KURALLAR.md)'de mühürlenmiştir ve bu belgeyle birlikte, ondan bağımsız olarak da uygulanır. Bu belge ayrıca [YOL-HARITASI.md](YOL-HARITASI.md)'nin altında çalışır — burada yazan hiçbir kural yol haritasındaki Yönetişim bölümünü geçersiz kılmaz, onu uygulamanın operasyonel biçimidir.

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
| **DUR ve sor** | Kapsamın dışına çıkan her şey: planlanmamış bir dosya/dizin değişikliği, kapsamda olmayan bir bağımlılık, yol haritasına aykırı bir yön değişikliği, veri/dosya silme, `.env`/gizli anahtar değişikliği, `git push --force`, dal silme gibi geri dönüşü olmayan işlemler, **ve `git push`** (bkz. [GENEL-KURALLAR.md](GENEL-KURALLAR.md) md. 9). |
| **YAP ve not düş** | Yalnızca önceden onaylanmış kapsamın içindeki işler: kapsamda tanımlı yeni tablo/migration ([GENEL-KURALLAR.md](GENEL-KURALLAR.md) md. 1), kapsamda tanımlı yeni dosya/bileşen, kapsamda tanımlı bağımlılık ekleme, refactor, UI değişikliği, test yazma. |

Öngörülemeyen bir durumla karşılaşılırsa: kapsam içindeyse ve risk seviyesi düşükse yapılır ve not düşülür; kapsam dışındaysa loop durur ve sorulur; risk seviyesi belirsizse **daha sonra tartışılmak üzere pas geçilir** — loop bir sonraki maddeye geçer, geri dönmez.

## 3a. Çalışma ortamı işlemleri

Dev sunucusu başlatma/durdurma, port çakışması çözme, bağımlılık kurma gibi yerel geliştirme ortamını çalışır tutan işlemler her zaman **kapsam içi ve serbesttir** — loop bunları onay beklemeden yapar. Port ayrımı (kullanıcının 3041'i, ajanın 3042'yi kullanması) [GENEL-KURALLAR.md](GENEL-KURALLAR.md) md. 10'da mühürlenmiştir ve loop içinde de aynen geçerlidir.

## 3b. Hata ve istisna protokolü

Loop bir hata/istisnayla karşılaşınca (migration başarısız, test kırılıyor, beklenmeyen derleme hatası): önce kök nedeni teşhis eder ve **sınırlı sayıda** makul düzeltme dener. Çözülürse devam eder ve düzeltmeyi loop sonu raporuna yazar. Çözülmezse **loop durmaz** — o maddeyi "çözülemedi" olarak işaretleyip bir sonraki işe geçer; gereksiz bir döngüye girip aynı hatayı tekrar tekrar denemez. Çözülemeyen her hata, loop sonu raporunun "açık sorular" bölümünde açıkça listelenir.

## 3c. Her tur sonu kod kontrolü

Kodun modüler/ölçeklenebilir yazılması genel bir standarttır ([GENEL-KURALLAR.md](GENEL-KURALLAR.md) md. 8). Loop'a özgü olan, her maddenin kapanmadan önce geçmesi gereken kontroldür:

1. **Tip kontrolü** (`tsc --noEmit`) hatasız geçer.
2. **Lint** (`next lint` / eslint) uyarısız veya bilinçli olarak göz ardı edilenler açıkça not edilerek geçer.
3. **Hızlı manuel deneyim kontrolü** — değişen akış gerçekten denenir (ajanın kendi `dev:agent` sunucusu üzerinden), sadece "derlendi" ile yetinilmez.

Bu üçü geçmeden bir madde "tamamlandı" sayılmaz; geçmiyorsa madde 3b'deki hata protokolü devreye girer.

## 4. Loop öncesi risk tartışması

Bir loop'un kapsamı onaylanmadan önce, o kapsamdaki işlerin taşıdığı riskler ayrıca ve açıkça konuşulur ve karara bağlanır — "muallak konu netleştirme" adımının bir parçası olarak, ama ayrı bir başlık altında ele alınır: *bu işin ne türden riskleri var, hangi karşı önlem alınacak.* Yol Haritası'ndaki risk tablosuna yeni bir risk türü ekleniyorsa, o satır da bu aşamada yazılır.

## 5. Loop sonu raporu

Her loop, aşağıdaki üç başlıklı kısa bir raporla kapanır — bu rapor sohbette kalır, dosyaya işlenmez:

1. **Tamamlanan işler** — ne yapıldı, hangi dosyalar değişti.
2. **Loop içinde alınan ufak kararlar** — kapsam içi ama önceden tam olarak belirtilmemiş noktalarda ne karar verildi ve neden.
3. **Açık sorular / pas geçilenler** — sizinle birlikte karara bağlanması gereken, loop'un durup beklediği veya bilerek atladığı konular; çözülemeyen hatalar da burada listelenir.

Bu rapora ek olarak, **kalıcı önemdeki kararlar** (bir tablo neden öyle modellendi, bir mimari tercih neden yapıldı gibi gerekçeler) Claude'un kalıcı hafıza sistemine kısa bir özet olarak kaydedilir — böylece yeni bir oturum veya loop, aynı gerekçeyi tekrar sormaz. Rapor kendisi dosyaya işlenmez, yalnızca bu tür kalıcı gerekçe özetleri hafızada kalır.

---

## Bu kuralların değişimi

Bu belge, [GENEL-KURALLAR.md](GENEL-KURALLAR.md) ve [YOL-HARITASI.md](YOL-HARITASI.md) gibi mühürlenmiştir. Bir kural değiştirilecekse bu, bir loop'un içinde değil, yeni bir onay turunda yapılır — kuralın kendisini değiştirmek de kapsam dışı bir iştir.
