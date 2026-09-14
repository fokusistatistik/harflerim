export interface LetterAsset {
    word: string;
    img: string;
}

// Collection of objects for each letter
export const LETTER_OBJECTS: Record<string, LetterAsset[]> = {
    'A': [
        { word: 'Araba', img: '/karsilastirma/araba.jpg' },
        { word: 'Arı', img: '/karsilastirma/ari.jpg' },
        { word: 'Ayı', img: 'https://static.fokusistatistik.com/melike/gorseller/ayi.png' },
        { word: 'Armut', img: 'https://static.fokusistatistik.com/melike/gorseller/armut.png' },
        { word: 'Ayakkabı', img: '/karsilastirma/ayakkabi.jpg' },
        { word: 'Aslan', img: 'https://static.fokusistatistik.com/melike/gorseller/aslan.png' },
        { word: 'Ahtapot', img: 'https://static.fokusistatistik.com/melike/gorseller/ahtapot.png' },
        { word: 'Ay', img: 'https://static.fokusistatistik.com/melike/gorseller/ay.png' },
        { word: 'Anahtar', img: '/karsilastirma/anahtar.jpg' },
        { word: 'At', img: '/karsilastirma/at.jpg' }
    ],
    'B': [
        { word: 'Balık', img: '/karsilastirma/balik.jpg' },
        { word: 'Bebek', img: 'https://static.fokusistatistik.com/melike/gorseller/bebek.png' },
        { word: 'Balon', img: '/karsilastirma/balon.jpg' },
        { word: 'Bisiklet', img: '/karsilastirma/bisiklet.jpg' },
        { word: 'Bardak', img: 'https://static.fokusistatistik.com/melike/gorseller/bardak.png' },
        { word: 'Bot', img: 'https://static.fokusistatistik.com/melike/gorseller/bot.png' },
        { word: 'Bulut', img: 'https://static.fokusistatistik.com/melike/gorseller/bulut.png' },
        { word: 'Biber', img: 'https://static.fokusistatistik.com/melike/gorseller/biber.png' },
        { word: 'Bisküvi', img: 'https://static.fokusistatistik.com/melike/gorseller/biskuvi.png' },
        { word: 'Battaniye', img: 'https://static.fokusistatistik.com/melike/gorseller/battaniye.png' }
    ],
    'C': [
        { word: 'Civciv', img: '/karsilastirma/civciv.jpg' },
        { word: 'Ceket', img: 'https://static.fokusistatistik.com/melike/gorseller/ceket.png' },
        { word: 'Ceviz', img: '/karsilastirma/ceviz.jpg' },
        { word: 'Cetvel', img: 'https://static.fokusistatistik.com/melike/gorseller/cetvel.png' },
        { word: 'Cüzdan', img: 'https://static.fokusistatistik.com/melike/gorseller/cuzdan.png' },
        { word: 'Cam', img: 'https://static.fokusistatistik.com/melike/gorseller/cam.png' },
        { word: 'Ceylan', img: 'https://static.fokusistatistik.com/melike/gorseller/ceylan.png' },
        { word: 'Civata', img: 'https://static.fokusistatistik.com/melike/gorseller/civata.png' },
        { word: 'Cips', img: 'https://static.fokusistatistik.com/melike/gorseller/cips.png' },
        { word: 'Cadde', img: 'https://static.fokusistatistik.com/melike/gorseller/cadde.png' }
    ],
    'Ç': [
        { word: 'Çilek', img: 'https://static.fokusistatistik.com/melike/gorseller/cilek.png' },
        { word: 'Çiçek', img: '/karsilastirma/cicek.jpg' },
        { word: 'Çanta', img: '/karsilastirma/canta.jpg' },
        { word: 'Çorap', img: '/karsilastirma/corap.jpg' },
        { word: 'Çatal', img: 'https://static.fokusistatistik.com/melike/gorseller/catal.png' },
        { word: 'Çekiç', img: 'https://static.fokusistatistik.com/melike/gorseller/cekic.png' },
        { word: 'Çöp', img: 'https://static.fokusistatistik.com/melike/gorseller/cop.png' },
        { word: 'Çizme', img: 'https://static.fokusistatistik.com/melike/gorseller/cizme.png' },
        { word: 'Çan', img: 'https://static.fokusistatistik.com/melike/gorseller/can.png' },
        { word: 'Çay', img: 'https://static.fokusistatistik.com/melike/gorseller/cay.png' }
    ],
    'D': [
        { word: 'Dondurma', img: '/karsilastirma/dondurma.jpg' },
        { word: 'Domates', img: '/karsilastirma/domates.jpg' },
        { word: 'Düğme', img: 'https://static.fokusistatistik.com/melike/gorseller/dugme.png' },
        { word: 'Davul', img: 'https://static.fokusistatistik.com/melike/gorseller/davul.png' },
        { word: 'Diş', img: 'https://static.fokusistatistik.com/melike/gorseller/dis.png' },
        { word: 'Defter', img: 'https://static.fokusistatistik.com/melike/gorseller/defter.png' },
        { word: 'Deve', img: '/karsilastirma/deve.jpg' },
        { word: 'Dinozor', img: 'https://static.fokusistatistik.com/melike/gorseller/dinozor.png' },
        { word: 'Düdük', img: 'https://static.fokusistatistik.com/melike/gorseller/duduk.png' },
        { word: 'Direksiyon', img: 'https://static.fokusistatistik.com/melike/gorseller/direksiyon.png' }
    ],
    'E': [
        { word: 'Elma', img: '/karsilastirma/elma.jpg' },
        { word: 'Eldiven', img: '/karsilastirma/eldiven.jpg' },
        { word: 'Ekmek', img: '/karsilastirma/ekmek.jpg' },
        { word: 'Elbise', img: '/karsilastirma/elbise.jpg' },
        { word: 'Ev', img: 'https://static.fokusistatistik.com/melike/gorseller/ev.png' },
        { word: 'Eşek', img: '/karsilastirma/esek.jpg' },
        { word: 'Elek', img: 'https://static.fokusistatistik.com/melike/gorseller/elek.png' },
        { word: 'Erik', img: 'https://static.fokusistatistik.com/melike/gorseller/erik.png' },
        { word: 'Etek', img: 'https://static.fokusistatistik.com/melike/gorseller/etek.png' },
        { word: 'Emzik', img: 'https://static.fokusistatistik.com/melike/gorseller/emzik.png' }
    ],
    'F': [
        { word: 'Fil', img: '/karsilastirma/fil.jpg' },
        { word: 'Fırça', img: 'https://static.fokusistatistik.com/melike/gorseller/firca.png' },
        { word: 'Fındık', img: 'https://static.fokusistatistik.com/melike/gorseller/findik.png' },
        { word: 'Fener', img: 'https://static.fokusistatistik.com/melike/gorseller/fener.png' },
        { word: 'Fincan', img: 'https://static.fokusistatistik.com/melike/gorseller/fincan.png' },
        { word: 'Fare', img: 'https://static.fokusistatistik.com/melike/gorseller/fare.png' },
        { word: 'Fasulye', img: 'https://static.fokusistatistik.com/melike/gorseller/fasulye.png' },
        { word: 'Fular', img: 'https://static.fokusistatistik.com/melike/gorseller/fular.png' },
        { word: 'Fırın', img: 'https://static.fokusistatistik.com/melike/gorseller/firin.png' },
        { word: 'Flüt', img: 'https://static.fokusistatistik.com/melike/gorseller/flut.png' }
    ],
    'G': [
        { word: 'Güneş', img: '/karsilastirma/gunes.jpg' },
        { word: 'Gemi', img: '/karsilastirma/gemi.jpg' },
        { word: 'Gözlük', img: 'https://static.fokusistatistik.com/melike/gorseller/gozluk.png' },
        { word: 'Gitar', img: '/karsilastirma/gitar.jpg' },
        { word: 'Gül', img: 'https://static.fokusistatistik.com/melike/gorseller/gul.png' },
        { word: 'Geyik', img: 'https://static.fokusistatistik.com/melike/gorseller/geyik.png' },
        { word: 'Gökkuşağı', img: '/karsilastirma/gokkusagi.jpg' },
        { word: 'Gömlek', img: 'https://static.fokusistatistik.com/melike/gorseller/gomlek.png' },
        { word: 'Gaga', img: 'https://static.fokusistatistik.com/melike/gorseller/gaga.png' },
        { word: 'Garaj', img: 'https://static.fokusistatistik.com/melike/gorseller/garaj.png' }
    ],
    'Ğ': [
        { word: 'Ağaç', img: '/karsilastirma/agac.jpg' },
        { word: 'Dağ', img: 'https://static.fokusistatistik.com/melike/gorseller/dag.png' },
        { word: 'Bağ', img: 'https://static.fokusistatistik.com/melike/gorseller/bag.png' }
    ],
    'H': [
        { word: 'Havuç', img: '/karsilastirma/havuc.jpg' },
        { word: 'Helikopter', img: 'https://static.fokusistatistik.com/melike/gorseller/helikopter.png' },
        { word: 'Hediye', img: 'https://static.fokusistatistik.com/melike/gorseller/hediye.png' },
        { word: 'Halı', img: 'https://static.fokusistatistik.com/melike/gorseller/hali.png' },
        { word: 'Havlu', img: 'https://static.fokusistatistik.com/melike/gorseller/havlu.png' },
        { word: 'Horoz', img: 'https://static.fokusistatistik.com/melike/gorseller/horoz.png' },
        { word: 'Halka', img: 'https://static.fokusistatistik.com/melike/gorseller/halka.png' },
        { word: 'Hortum', img: 'https://static.fokusistatistik.com/melike/gorseller/hortum.png' },
        { word: 'Hırka', img: 'https://static.fokusistatistik.com/melike/gorseller/hirka.png' },
        { word: 'Hurma', img: 'https://static.fokusistatistik.com/melike/gorseller/hurma.png' }
    ],
    'I': [
        { word: 'Ispanak', img: 'https://static.fokusistatistik.com/melike/gorseller/ispanak.png' },
        { word: 'Izgara', img: 'https://static.fokusistatistik.com/melike/gorseller/izgara.png' },
        { word: 'Islık', img: 'https://static.fokusistatistik.com/melike/gorseller/islik.png' },
        { word: 'Işık', img: '/karsilastirma/isik.jpg' },
        { word: 'Istakoz', img: 'https://static.fokusistatistik.com/melike/gorseller/istakoz.png' },
        { word: 'Irmak', img: 'https://static.fokusistatistik.com/melike/gorseller/irmak.png' },
        { word: 'Isıtıcı', img: 'https://static.fokusistatistik.com/melike/gorseller/isitici.png' },
        { word: 'Islak', img: 'https://static.fokusistatistik.com/melike/gorseller/islak.png' }
    ],
    'İ': [
        { word: 'İnek', img: '/karsilastirma/inek.jpg' },
        { word: 'İncir', img: 'https://static.fokusistatistik.com/melike/gorseller/incir.png' },
        { word: 'İp', img: '/karsilastirma/ip.jpg' },
        { word: 'İtfaiye', img: 'https://static.fokusistatistik.com/melike/gorseller/itfaiye.png' },
        { word: 'İğne', img: 'https://static.fokusistatistik.com/melike/gorseller/igne.png' },
        { word: 'İlaç', img: 'https://static.fokusistatistik.com/melike/gorseller/ilac.png' },
        { word: 'İskelet', img: 'https://static.fokusistatistik.com/melike/gorseller/iskelet.png' },
        { word: 'İz', img: 'https://static.fokusistatistik.com/melike/gorseller/iz.png' },
        { word: 'İncik', img: 'https://static.fokusistatistik.com/melike/gorseller/incik.png' },
        { word: 'İbik', img: 'https://static.fokusistatistik.com/melike/gorseller/ibik.png' }
    ],
    'J': [
        { word: 'Jip', img: 'https://static.fokusistatistik.com/melike/gorseller/jip.png' },
        { word: 'Jeton', img: 'https://static.fokusistatistik.com/melike/gorseller/jeton.png' },
        { word: 'Jöle', img: 'https://static.fokusistatistik.com/melike/gorseller/jole.png' },
        { word: 'Jaguvar', img: 'https://static.fokusistatistik.com/melike/gorseller/jaguvar.png' },
        { word: 'Jilet', img: 'https://static.fokusistatistik.com/melike/gorseller/jilet.png' },
        { word: 'Jelibon', img: '/karsilastirma/jelibon.jpg' },
        { word: 'Jak', img: 'https://static.fokusistatistik.com/melike/gorseller/jak.png' },
        { word: 'Jant', img: 'https://static.fokusistatistik.com/melike/gorseller/jant.png' },
        { word: 'Jarse', img: 'https://static.fokusistatistik.com/melike/gorseller/jarse.png' }
    ],
    'K': [
        { word: 'Kedi', img: '/karsilastirma/kedi.jpg' },
        { word: 'Köpek', img: '/karsilastirma/kopek.jpg' },
        { word: 'Kitap', img: 'https://static.fokusistatistik.com/melike/gorseller/kitap.png' },
        { word: 'Kalem', img: 'https://static.fokusistatistik.com/melike/gorseller/kalem.png' },
        { word: 'Karpuz', img: '/karsilastirma/karpuz.jpg' },
        { word: 'Kapı', img: 'https://static.fokusistatistik.com/melike/gorseller/kapi.png' },
        { word: 'Kuş', img: 'https://static.fokusistatistik.com/melike/gorseller/kus.png' },
        { word: 'Kaplumbağa', img: '/karsilastirma/kaplumbaga.jpg' },
        { word: 'Kova', img: 'https://static.fokusistatistik.com/melike/gorseller/kova.png' },
        { word: 'Kar', img: 'https://static.fokusistatistik.com/melike/gorseller/kar.png' }
    ],
    'L': [
        { word: 'Limon', img: '/karsilastirma/limon.jpg' },
        { word: 'Leylek', img: 'https://static.fokusistatistik.com/melike/gorseller/leylek.png' },
        { word: 'Lale', img: '/karsilastirma/lale.jpg' },
        { word: 'Leğen', img: 'https://static.fokusistatistik.com/melike/gorseller/legen.png' },
        { word: 'Lolipop', img: 'https://static.fokusistatistik.com/melike/gorseller/lolipop.png' },
        { word: 'Levrek', img: 'https://static.fokusistatistik.com/melike/gorseller/levrek.png' }
    ],
    'M': [
        { word: 'Maymun', img: 'https://static.fokusistatistik.com/melike/gorseller/maymun.png' },
        { word: 'Muz', img: '/karsilastirma/muz.jpg' },
        { word: 'Masa', img: '/karsilastirma/masa.jpg' },
        { word: 'Makas', img: 'https://static.fokusistatistik.com/melike/gorseller/makas.png' },
        { word: 'Merdiven', img: 'https://static.fokusistatistik.com/melike/gorseller/merdiven.png' },
        { word: 'Mantar', img: 'https://static.fokusistatistik.com/melike/gorseller/mantar.png' },
        { word: 'Mısır', img: 'https://static.fokusistatistik.com/melike/gorseller/misir.png' },
        { word: 'Mıknatıs', img: 'https://static.fokusistatistik.com/melike/gorseller/miknatis.png' },
        { word: 'Marul', img: 'https://static.fokusistatistik.com/melike/gorseller/marul.png' }
    ],
    'N': [
        { word: 'Nar', img: '/karsilastirma/nar.jpg' },
        { word: 'Nane', img: 'https://static.fokusistatistik.com/melike/gorseller/nane.png' },
        { word: 'Nohut', img: 'https://static.fokusistatistik.com/melike/gorseller/nohut.png' },
        { word: 'Nemlendirici', img: 'https://static.fokusistatistik.com/melike/gorseller/nemlendirici.png' },
        { word: 'Nota', img: 'https://static.fokusistatistik.com/melike/gorseller/nota.png' },
        { word: 'Nilüfer', img: 'https://static.fokusistatistik.com/melike/gorseller/nilufer.png' }
    ],
    'O': [
        { word: 'Otobüs', img: '/karsilastirma/otobus.jpg' },
        { word: 'Olta', img: '/karsilastirma/olta.jpg' },
        { word: 'Okul', img: 'https://static.fokusistatistik.com/melike/gorseller/okul.png' },
        { word: 'Orman', img: 'https://static.fokusistatistik.com/melike/gorseller/orman.png' },
        { word: 'Oyuncak', img: 'https://static.fokusistatistik.com/melike/gorseller/oyuncak.png' },
        { word: 'Ocak', img: 'https://static.fokusistatistik.com/melike/gorseller/ocak.png' }
    ],
    'Ö': [
        { word: 'Ördek', img: '/karsilastirma/ordek2.jpg' },
        { word: 'Örümcek', img: 'https://static.fokusistatistik.com/melike/gorseller/orumcek.png' },
        { word: 'Örgü', img: 'https://static.fokusistatistik.com/melike/gorseller/orgu.png' },
        { word: 'Örtü', img: 'https://static.fokusistatistik.com/melike/gorseller/ortu.png' },
        { word: 'Öküz', img: 'https://static.fokusistatistik.com/melike/gorseller/okuz.png' },
        { word: 'Ödül', img: 'https://static.fokusistatistik.com/melike/gorseller/odul.png' }
    ],
    'P': [
        { word: 'Portakal', img: '/karsilastirma/portakal.jpg' },
        { word: 'Peynir', img: 'https://static.fokusistatistik.com/melike/gorseller/peynir.png' },
        { word: 'Pantolon', img: '/karsilastirma/pantolon.jpg' },
        { word: 'Penguen', img: '/karsilastirma/penguen.jpg' },
        { word: 'Pasta', img: '/karsilastirma/pasta.jpg' },
        { word: 'Para', img: 'https://static.fokusistatistik.com/melike/gorseller/para.png' },
        { word: 'Piyano', img: '/karsilastirma/piyano.jpg' },
        { word: 'Papatya', img: 'https://static.fokusistatistik.com/melike/gorseller/papatya.png' },
        { word: 'Pil', img: 'https://static.fokusistatistik.com/melike/gorseller/pil.png' },
        { word: 'Pijama', img: 'https://static.fokusistatistik.com/melike/gorseller/pijama.png' }
    ],
    'R': [
        { word: 'Roket', img: 'https://static.fokusistatistik.com/melike/gorseller/roket.png' },
        { word: 'Robot', img: 'https://static.fokusistatistik.com/melike/gorseller/robot.png' },
        { word: 'Reçel', img: 'https://static.fokusistatistik.com/melike/gorseller/recel.png' },
        { word: 'Rende', img: 'https://static.fokusistatistik.com/melike/gorseller/rende.png' },
        { word: 'Raket', img: '/karsilastirma/raket.jpg' },
        { word: 'Ruj', img: 'https://static.fokusistatistik.com/melike/gorseller/ruj.png' }
    ],
    'S': [
        { word: 'Süt', img: 'https://static.fokusistatistik.com/melike/gorseller/sut.png' },
        { word: 'Saat', img: '/karsilastirma/saat.jpg' },
        { word: 'Su', img: 'https://static.fokusistatistik.com/melike/gorseller/su.png' },
        { word: 'Sandalye', img: '/karsilastirma/sandalye.jpg' },
        { word: 'Sepet', img: 'https://static.fokusistatistik.com/melike/gorseller/sepet.png' },
        { word: 'Sabun', img: 'https://static.fokusistatistik.com/melike/gorseller/sabun.png' },
        { word: 'Silgi', img: 'https://static.fokusistatistik.com/melike/gorseller/silgi.png' },
        { word: 'Simit', img: '/karsilastirma/simit.jpg' },
        { word: 'Soğan', img: '/karsilastirma/sogan.jpg' }
    ],
    'Ş': [
        { word: 'Şemsiye', img: '/karsilastirma/semsiye.jpg' },
        { word: 'Şapka', img: '/karsilastirma/sapka.jpg' },
        { word: 'Şeker', img: 'https://static.fokusistatistik.com/melike/gorseller/seker.png' },
        { word: 'Şişe', img: 'https://static.fokusistatistik.com/melike/gorseller/sise.png' },
        { word: 'Şort', img: 'https://static.fokusistatistik.com/melike/gorseller/sort.png' },
        { word: 'Şeftali', img: 'https://static.fokusistatistik.com/melike/gorseller/seftali.png' },
        { word: 'Şerbet', img: 'https://static.fokusistatistik.com/melike/gorseller/serbet.png' },
        { word: 'Şampuan', img: 'https://static.fokusistatistik.com/melike/gorseller/sampuan.png' }
    ],
    'T': [
        { word: 'Tavşan', img: '/karsilastirma/tavsan.jpg' },
        { word: 'Top', img: '/karsilastirma/top.jpg' },
        { word: 'Telefon', img: 'https://static.fokusistatistik.com/melike/gorseller/telefon.png' },
        { word: 'Tarak', img: 'https://static.fokusistatistik.com/melike/gorseller/tarak.png' },
        { word: 'Tavuk', img: '/karsilastirma/tavuk.jpg' },
        { word: 'Tren', img: 'https://static.fokusistatistik.com/melike/gorseller/tren.png' },
        { word: 'Tencere', img: '/karsilastirma/tencere.jpg' },
        { word: 'Terlik', img: 'https://static.fokusistatistik.com/melike/gorseller/terlik.png' },
        { word: 'Timsah', img: 'https://static.fokusistatistik.com/melike/gorseller/timsah.png' },
        { word: 'Turşu', img: 'https://static.fokusistatistik.com/melike/gorseller/tursu.png' }
    ],
    'U': [
        { word: 'Uçak', img: '/karsilastirma/ucak.jpg' },
        { word: 'Uçurtma', img: 'https://static.fokusistatistik.com/melike/gorseller/ucurtma.png' },
        { word: 'Un', img: 'https://static.fokusistatistik.com/melike/gorseller/un.png' },
        { word: 'Uydu', img: 'https://static.fokusistatistik.com/melike/gorseller/uydu.png' },
        { word: 'Uzay', img: 'https://static.fokusistatistik.com/melike/gorseller/uzay.png' }
    ],
    'Ü': [
        { word: 'Üzüm', img: '/karsilastirma/uzum.jpg' },
        { word: 'Ütü', img: 'https://static.fokusistatistik.com/melike/gorseller/utu.png' },
        { word: 'Üçgen', img: '/karsilastirma/ucgen.jpg' },
        { word: 'Üniforma', img: 'https://static.fokusistatistik.com/melike/gorseller/uniforma.png' },
        { word: 'Ülke', img: 'https://static.fokusistatistik.com/melike/gorseller/ulke.png' },
        { word: 'Üflemek', img: 'https://static.fokusistatistik.com/melike/gorseller/uflemek.png' },
        { word: 'Ünlü', img: 'https://static.fokusistatistik.com/melike/gorseller/unlu.png' }
    ],
    'V': [
        { word: 'Valiz', img: '/karsilastirma/valiz.jpg' },
        { word: 'Vişne', img: 'https://static.fokusistatistik.com/melike/gorseller/visne.png' },
        { word: 'Vapur', img: 'https://static.fokusistatistik.com/melike/gorseller/vapur.png' },
        { word: 'Voleybol', img: 'https://static.fokusistatistik.com/melike/gorseller/voleybol.png' },
        { word: 'Vazo', img: 'https://static.fokusistatistik.com/melike/gorseller/vazo.png' },
        { word: 'Vantilatör', img: 'https://static.fokusistatistik.com/melike/gorseller/vantilator.png' }
    ],
    'Y': [
        { word: 'Yumurta', img: '/karsilastirma/yumurta.jpg' },
        { word: 'Yıldız', img: '/karsilastirma/yildiz.jpg' },
        { word: 'Yastık', img: 'https://static.fokusistatistik.com/melike/gorseller/yastik.png' },
        { word: 'Yaprak', img: '/karsilastirma/yaprak.jpg' },
        { word: 'Yatak', img: '/karsilastirma/yatak.jpg' },
        { word: 'Yunus', img: '/karsilastirma/yunus.jpg' },
        { word: 'Yüzük', img: 'https://static.fokusistatistik.com/melike/gorseller/yuzuk.png' },
        { word: 'Yoğurt', img: 'https://static.fokusistatistik.com/melike/gorseller/yogurt.png' },
        { word: 'Yılan', img: 'https://static.fokusistatistik.com/melike/gorseller/yilan.png' }
    ],
    'Z': [
        { word: 'Zebra', img: 'https://static.fokusistatistik.com/melike/gorseller/zebra.png' },
        { word: 'Zil', img: 'https://static.fokusistatistik.com/melike/gorseller/zil.png' },
        { word: 'Zeytin', img: '/karsilastirma/zeytin.jpg' },
        { word: 'Zürafa', img: '/karsilastirma/zurafa.jpg' },
        { word: 'Zar', img: 'https://static.fokusistatistik.com/melike/gorseller/zar.png' },
        { word: 'Zincir', img: 'https://static.fokusistatistik.com/melike/gorseller/zincir.png' },
        { word: 'Zarf', img: 'https://static.fokusistatistik.com/melike/gorseller/zarf.png' }
    ]
};

export const ALPHABET_ORDER = Object.keys(LETTER_OBJECTS);

// 2026-09-14 — eski static.fokusistatistik.com/melike/harfler/ CDN'i tamamen
// öldü (tüm 23 harf linki 404, kullanıcı testinde "linkler patlak" olarak
// bulundu). Yeni harf görselleri artık YEREL (public/harfler/) — bkz.
// PROMPTLAR.md Bölüm 1b (AI üretim promptları) ve dokumantasyon/harf-gorselleri.md.
// Dosya henüz yoksa ImageWithFallback zarif bir yer tutucu gösterir (kırık
// resim ikonu değil) — bkz. src/components/ui/ImageWithFallback.tsx.
export const LETTER_IMAGES: Record<string, string> = {
    'A': '/harfler/harf_a.png',
    'B': '/harfler/harf_b.png',
    'C': '/harfler/harf_c.png',
    'Ç': '/harfler/harf_c_cedil.png',
    'D': '/harfler/harf_d.png',
    'E': '/harfler/harf_e.png',
    'F': '/harfler/harf_f.png',
    'G': '/harfler/harf_g.png',
    'Ğ': '/harfler/harf_g_breve.png',
    'H': '/harfler/harf_h.png',
    'I': '/harfler/harf_i_noktasiz.png',
    'İ': '/harfler/harf_i.png',
    'J': '/harfler/harf_j.png',
    'K': '/harfler/harf_k.png',
    'L': '/harfler/harf_l.png',
    'M': '/harfler/harf_m.png',
    'N': '/harfler/harf_n.png',
    'O': '/harfler/harf_o.png',
    'Ö': '/harfler/harf_o_noktali.png',
    'P': '/harfler/harf_p.png',
    'R': '/harfler/harf_r.png',
    'S': '/harfler/harf_s.png',
    'Ş': '/harfler/harf_s_noktali.png',
    'T': '/harfler/harf_t.png',
    'U': '/harfler/harf_u.png',
    'Ü': '/harfler/harf_u_noktali.png',
    'V': '/harfler/harf_v.png',
    'Y': '/harfler/harf_y.png',
    'Z': '/harfler/harf_z.png'
};

export const AUDIOS = {
    correct: 'https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3',
    wrong: 'https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3',
    complete: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
    // UX düzeltmesi (2026-09-13) — eski freesound.org linki 404 veriyordu
    // (kullanıcı testinde bulundu). Diğer oyunların zaten kullandığı yerel
    // dosyaya (public/sounds/error.wav) taşındı — "yanlış/pas" hissi için uygun.
    sad: '/sounds/error.wav',
};
