#!/bin/bash
# ==============================================================================
# PAPATYALAR PLATFORMU - TEK TIKLA DOMAIN VE SSL AKTİVASYON SCRIPTI
# Kullanım: sudo bash scripts/setup-papatyalar-domain.sh [domain_adi]
# Varsayılan: papatyalar.com
# ==============================================================================

set -e

DOMAIN="${1:-papatyalar.com}"
APP_PORT="3041"
NGINX_CONF_PATH="/etc/nginx/sites-available/$DOMAIN"
NGINX_LINK_PATH="/etc/nginx/sites-enabled/$DOMAIN"

echo "=========================================================="
echo "🌸 Papatyalar Alan Adı Aktivasyonu Başlıyor: $DOMAIN"
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
    echo "❌ Lütfen bu scripti root veya sudo ile çalıştırın: sudo bash scripts/setup-papatyalar-domain.sh"
    exit 1
fi

# 1. Certbot doğrulaması için geçici HTTP bloğu oluştur
echo "🔧 1/4: İlk geçici Nginx HTTP yapılandırması kuruluyor..."
cat << EOF > "$NGINX_CONF_PATH"
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf "$NGINX_CONF_PATH" "$NGINX_LINK_PATH"
nginx -t
systemctl reload nginx
echo "✅ Geçici HTTP yönlendirmesi aktif."

# 2. Let's Encrypt Ücretsiz SSL Sertifikası Al
echo "🔒 2/4: Let's Encrypt SSL sertifikası alınıyor..."
certbot certonly --webroot -w /var/www/html -d "$DOMAIN" -d "www.$DOMAIN" --agree-tos --no-eff-email --register-unsafely-without-email || true

# 3. Tam Güvenlikli HTTPS ve Canonical Yönlendirmeli Bloğu Yaz
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "🚀 3/4: Kalıcı HTTPS yapılandırması uygulanıyor..."
    cat << EOF > "$NGINX_CONF_PATH"
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$DOMAIN\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://$DOMAIN\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 50M;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
    }
}
EOF
else
    echo "⚠️ SSL sertifikası henüz oluşturulamadı (DNS yönlendirmesi henüz oturmamış olabilir). HTTP üzerinden çalışmaya devam ediliyor."
fi

# 4. Nginx Kontrolü ve Yeniden Yükleme
echo "🔄 4/4: Nginx test ediliyor ve yeniden başlatılıyor..."
nginx -t
systemctl reload nginx

echo "=========================================================="
echo "🎉 TEBRİKLER! $DOMAIN yapılandırması başarıyla tamamlandı."
echo "🔗 Ziyaret edin: https://$DOMAIN"
echo "=========================================================="
