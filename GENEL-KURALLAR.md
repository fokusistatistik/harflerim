# Papatya — Genel Çalışma Kuralları

**Sürüm 1.0 · 12 Eylül 2026 — Mühürlenmiş**

Bu belge, Papatya üzerinde **nasıl çalışıldığını** tarif eder — loop içinde olsun olmasın, her zaman geçerlidir. [YOL-HARITASI.md](YOL-HARITASI.md) *ne* yapılacağını, [LOOP-KURALLARI.md](LOOP-KURALLARI.md) `/loop` aracının özel işleyişini tarif eder; bu belge ikisinin de altında durur ve her ikisinden de referans alınır.

---

## 1. Migration ve veritabanı yetkisi (geliştirme dönemi)

Geliştirme sürecinde olduğumuz için **migration'lar ve şema değişiklikleri risk eşiğinin dışındadır** — bunlar "kapsam içi" sayılır ve onaysız yapılabilir. Bu, kalıcı bir kural değil, geliştirme dönemine özgü geçici bir geniş yetkidir. Üretim verisi (gerçek kullanıcı verisi) barındırmaya başladığımızda bu madde daraltılır ve migration'lar da risk eşiğinin "dur ve sor" tarafına geçer.

## 2. Yol haritasına ve marka kimliğine bağlılık

Hiçbir işlem [YOL-HARITASI.md](YOL-HARITASI.md)'deki Yönetişim ilkelerine (katı yerel işleme, klinik sınır, anti-bağımlılık mimarisi, vb.) veya Papatya marka kimliğine (ana renk paleti, tipografi, sekiz yapraklı papatya metaforu) aykırı bir yön değişikliği yapamaz. Yol haritasına aykırı bir gereklilik ortaya çıkarsa bu otomatik olarak "kapsam dışı" sayılır ve iş durur.

## 3. Öncelik sırası: istatistiksel veri temelli yaklaşım

Papatya bir istatistikçi tarafından geliştiriliyor. Bu, teknik tercihlerde bir öncelik sırası anlamına gelir: özellik kararları mümkün olduğunca **ölçülebilir veriye** dayanır — varsayıma değil.

- Yeni bir oyun mekaniği veya zorluk ayarı eklenirken, onu ölçecek bir olay/analiz kaydı da birlikte tasarlanır (bkz. Yol Haritası 3.1).
- "Bu iyi çalışıyor gibi görünüyor" türü öznel değerlendirme yerine, mümkün olduğunda ölçülebilir bir gerekçe tercih edilir.
- Bu ilke, klinik sınır sözleşmesini geçersiz kılmaz: veri toplanır ve sunulur, yorum/tanı yapılmaz.

## 4. Üç cihaz denetimi zorunludur

Arayüze dokunan her iş, kapanmadan önce **telefon, tablet ve PC** boyutlarının üçünde de gözden geçirilir. Bu bir seçenek değil, her arayüz değişikliğinin kontrol listesinin parçasıdır (bkz. Yol Haritası 1.7 — Üç cihaz ölçeklemesi).

## 5. Tema yönetimi merkezidir

Açık mod, koyu mod ve sistem modu renk paletleri **tek bir merkezi token kaynağından** yönetilir (bkz. Yol Haritası 1.6 — Tasarım tokeni katmanı). Hiçbir bileşene doğrudan, tokensiz renk değeri yazılmaz. Yeni bir renk ihtiyacı doğarsa önce merkezi tema dosyasına eklenir, sonra kullanılır.

## 6. UI/UX ve güvenlik önceliği

Kullanıcı dostu arayüz ile otizmli bireyin güvenliği çakıştığında, güvenlik kazanır — ama bu bir "ya biri ya diğeri" seçimi değildir. Her tasarım kararı önce Yol Haritası'ndaki **Değişmeyen tasarım ilkeleri** tablosundan (öngörülebilirlik, sakin varsayılan, başarısızlık yok, vb.) süzülür. Bir kısayol güvenlik ilkelerinden birini zayıflatıyorsa, o kısayol alınmaz.

## 7. Mahremiyet ve KVKK farkındalığı

Yazılan hiçbir kod, Yol Haritası'ndaki **veri güvenliği anayasasını** (katı yerel işleme) ihlal edecek bir veri yolu açamaz. Kişisel veri (aile fotoğrafı, ses, konum, sağlık/gelişim verisi) işleyen her yeni özellik, kapsamı onaylanırken KVKK açısından da gözden geçirilir; bu gözden geçirme iş başlamadan önce yapılır, iş sırasında değil.

## 8. Modüler, ölçeklenebilir kod yapısı

Kod **profesyonel, ölçeklenebilir ve modüler** yazılır — tek dosyaya yığılmış mantık, kopyala-yapıştır tekrarı (bkz. bugünkü `GameBoard.tsx` / `MemoryMatchGame.tsx` benzerliği) ve gizli bağımlılıklar büyütülmez, fark edildikçe düzeltilir. Yeni bir soyutlama yalnızca gerçek bir tekrar ortaya çıktığında eklenir — spekülatif genelleme yapılmaz.

## 9. Commit ve push ayrımı

Anlamlı her adımda **yerel commit** atılır — açıklayıcı bir mesajla, geri dönüş noktası oluşturacak sıklıkta. `git push`, PR açma ve dış sistemlere gönderim ise her zaman **ayrıca ve açıkça onaylanır** — kendiliğinden yapılmaz.

## 10. Port ayrımı

`3041` kullanıcının kendi test portudur (`npm run dev`, WSL üzerinde) — ajan bu portu hiçbir zaman işgal etmez. Ajan kendi doğrulamaları için `npm run dev:agent` (port `3042`) kullanır. Bir doğrulama biter bitmez ajan kendi sunucusunu durdurur; kullanıcının 3041'deki sunucusuna asla dokunulmaz.

---

## Bu kuralların değişimi

Bu belge [YOL-HARITASI.md](YOL-HARITASI.md) ve [LOOP-KURALLARI.md](LOOP-KURALLARI.md) gibi mühürlenmiştir. Bir kural değiştirilecekse bu, bir loop'un veya herhangi bir işin içinde değil, yeni bir onay turunda yapılır.
