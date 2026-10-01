# flagr — Tanıtım Sitesi

Bağımlılığı olmayan, tamamen **statik** bir landing page. Framework yok, build adımı yok — dosyaları herhangi bir statik hosting'e atman yeterli.

## Klasör yapısı

```
flagr-site/
├── index.html            # Sayfanın tamamı (içerik markup içinde → SEO dostu)
├── gizlilik.html         # Gizlilik Politikası / KVKK (Play Console'a /gizlilik girilir)
├── hesap-silme.html      # Hesap silme talimatı (Play Console "hesap silme URL'si")
├── favicon.svg           # Marka ikonu
├── site.webmanifest      # PWA/meta bilgisi
├── robots.txt            # Arama motoru izinleri
├── sitemap.xml           # Site haritası
├── .gitignore
└── assets/
    ├── css/styles.css    # Tüm stiller (design token'lar + bileşenler)
    └── js/main.js        # SSS akordeonu, form davranışı, yıl
```

> Not: Bu klasör, tasarım aracının önizleme formatından (`.dc.html` + `support.js`)
> temizlenerek üretildi. O runtime dosyalarına **ihtiyaç yoktur**, buraya dahil değildir.

## Yerelde çalıştırma

Herhangi bir statik sunucu yeterli:

```bash
cd flagr-site
python3 -m http.server 8000
```

Sonra tarayıcıdan `http://localhost:8000` adresine git. (Dosyayı çift tıklayıp
`file://` ile de açabilirsin; tüm yollar göreli olduğu için çalışır.)

## Yayınlama (deploy)

Klasörün tamamını şunlardan birine yükle:

- **Netlify / Vercel / Cloudflare Pages** → klasörü sürükle-bırak, publish dizini: `flagr-site`
- **GitHub Pages** → repoya it, Settings → Pages → kaynak olarak bu klasörü seç
- **Klasik hosting (cPanel/FTP)** → içeriği `public_html`'e kopyala

Build komutu gerekmez.

## Yayın öncesi yapılacaklar

1. **Domain**: `index.html`, `robots.txt`, `sitemap.xml` ve `site.webmanifest`
   içindeki `https://flagr.app/` adreslerini kendi alan adınla değiştir.
2. **Bekleme listesi formu**: Form `/api/waitlist` adresine POST atar; bu rota
   `functions/api/waitlist.js` (Cloudflare Pages Function) tarafından karşılanır
   ve kayıtları Google E-Tablo'ya yazar. Kurulumu tamamlamadan form "hata"
   gösterir. Adım adım kurulum: proje kökündeki **`DEPLOY-WAITLIST.md`**.
3. **Sosyal linkler**: Footer'daki `IG` / `X` bağlantılarındaki `href="#"` alanlarını doldur.
4. (Opsiyonel) OG paylaşım görseli: `og:image` meta etiketi ekleyip bir kapak görseli koy.

## Erişilebilirlik / performans

- İçerik HTML içinde statik → JS kapalı olsa bile okunur (SEO + erişilebilirlik).
- SSS akordeonu `aria-expanded` ile yönetilir, klavyeyle çalışır.
- `prefers-reduced-motion` desteklenir (animasyonlar kapanır).
- Tek CSS + tek JS dosyası, harici bağımlılık yalnızca Google Fonts.
