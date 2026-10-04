#!/bin/bash
# ==============================================================================
# PAPATYA ÇOCUK PLATFORMU - GÜVENLİ VE DİSK DOSTU DEPLOYMENT SCRIPTI
# ==============================================================================
# - Veritabanını (dev.db) otomatik yedekler, ASLA sıfırlamaz / ezmez.
# - Next.js cache ve PM2 loglarını temizleyerek disk şişmesini önler.
# - Üretim derlemesini alır ve PM2 sürecini günceller.
# ==============================================================================

set -e # Hata olursa durdur

APP_DIR="/var/www/harflerim"
cd "$APP_DIR" || exit 1

echo "=========================================="
echo "🚀 Papatya Güncelleme Başlıyor: $(date)"
echo "=========================================="

# ------------------------------------------------------------------------------
# 1. VERİTABANI KORUMA & YEDEKLEME (SIFIR VERİ KAYBI)
# ------------------------------------------------------------------------------
echo "📦 1/6: Veritabanı kontrol ediliyor ve yedekleniyor..."
mkdir -p "$APP_DIR/prisma/backups"

if [ -f "$APP_DIR/prisma/dev.db" ]; then
    BACKUP_FILE="$APP_DIR/prisma/backups/dev.db.$(date +%Y%m%d_%H%M%S).bak"
    cp "$APP_DIR/prisma/dev.db" "$BACKUP_FILE"
    echo "✅ Veritabanı yedeği alındı: $BACKUP_FILE"
    
    # Disk dolmasın diye sadece son 3 yedeği tut, eskileri sil
    find "$APP_DIR/prisma/backups" -name "dev.db.*.bak" -type f | sort -r | tail -n +4 | xargs -r rm --
else
    echo "⚠️ Uyarı: prisma/dev.db henüz mevcut değil."
fi

# ------------------------------------------------------------------------------
# 2. ESKİ CACHE VE DİSK TEMİZLİĞİ
# ------------------------------------------------------------------------------
echo "🧹 2/6: Eski derleme cache ve logları temizleniyor..."
# Next.js derleme önbelleğini temizle (diskte yüzlerce MB tasarruf)
rm -rf "$APP_DIR/.next/cache"
# PM2 eski loglarını sıfırla
pm2 flush papatya-harflerim 2>/dev/null || true

# ------------------------------------------------------------------------------
# 3. KOD GÜNCELLEMESİ (GIT PULL)
# ------------------------------------------------------------------------------
echo "📥 3/6: Güncel kodlar GitHub'dan çekiliyor..."
git fetch origin deployment-melike
git checkout deployment-melike
git pull origin deployment-melike

# ------------------------------------------------------------------------------
# 4. BAĞIMLILIKLAR & PRISMA CLIENT
# ------------------------------------------------------------------------------
echo "⚙️  4/6: Paketler ve Prisma Client güncelleniyor..."
npm install
# SADECE client kodunu derler, DB'ye tablo silme/veri ezme işlemi KESİNLİKLE yapmaz:
npx prisma generate

# ------------------------------------------------------------------------------
# 5. NEXT.JS ÜRETİM DERLEMESİ
# ------------------------------------------------------------------------------
echo "🏗️  5/6: Next.js üretim derlemesi alınıyor..."
npm run build

# Derleme bittikten sonra cache'i tekrar silerek sunucuda yer aç
rm -rf "$APP_DIR/.next/cache"
npm cache clean --force 2>/dev/null || true

# ------------------------------------------------------------------------------
# 6. PM2 PROCESS YENİLEME
# ------------------------------------------------------------------------------
echo "🔄 6/6: PM2 süreci güncelleniyor..."
if pm2 describe papatya-harflerim > /dev/null 2>&1; then
    pm2 restart papatya-harflerim --update-env
else
    pm2 start "npm run start -- -p 3041" --name "papatya-harflerim"
fi
pm2 save

echo "=========================================="
echo "🎉 Güncelleme Başarıyla Tamamlandı!"
echo "📊 Sunucu Disk Durumu:"
df -h "$APP_DIR" | awk 'NR==1 || NR==2'
echo "=========================================="
