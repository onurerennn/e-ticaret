# Fırat Store

Fırat Store, Fırat Üniversitesi öğrencileri, personeli ve mezunları için özel olarak tasarlanmış bir e-ticaret platformudur. Platform, üniversitenin logolu ürünlerini sunarken, öğrencilerin akademik başarılarını teşvik eden benzersiz bir para puan sistemi sunmaktadır.

## Özellikler

- **Kullanıcı Yönetimi**
  - Öğrenci, personel ve mezun kayıt sistemi
  - Güvenli giriş ve kimlik doğrulama
  - Profil yönetimi

- **Not Ortalamasına Dayalı İndirim Sistemi**
  - 3.5 ve üzeri ortalama: %10 indirim
  - 3.0 - 3.49 arası ortalama: %7 indirim
  - 2.5 - 2.99 arası ortalama: %5 indirim

- **Ürün Yönetimi**
  - Kategorilere göre ürün listeleme
  - Detaylı ürün sayfaları
  - Stok takibi

- **Sepet ve Sipariş Yönetimi**
  - Kolay sepet yönetimi
  - Güvenli ödeme işlemleri
  - Sipariş takibi

- **Admin Paneli**
  - Ürün ve kategori yönetimi
  - Kullanıcı yönetimi
  - Sipariş yönetimi
  - Satış istatistikleri

## Kurulum

1. Python 3.8 veya üzeri sürümün kurulu olduğundan emin olun.

2. Projeyi klonlayın:
```bash
git clone https://github.com/kullanici/firat-store.git
cd firat-store
```

3. Sanal ortam oluşturun ve aktifleştirin:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

4. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

5. Veritabanını oluşturun:
```bash
flask db upgrade
```

6. Örnek verileri yükleyin:
```bash
python -c "from app import create_app; from models import db; from baslangic_verisi import ornek_veriler_ekle; app = create_app(); app.app_context().push(); db.create_all(); ornek_veriler_ekle()"
```

7. Uygulamayı başlatın:
```bash
flask run
```

Uygulama varsayılan olarak http://localhost:5000 adresinde çalışacaktır.

## Admin Hesabı

Varsayılan admin hesabı bilgileri:
- E-posta: admin@firat.edu.tr
- Parola: admin123

## Geliştirme

### Proje Yapısı

```
firat_magaza/
├── static/
│   ├── css/
│   ├── js/
│   └── img/
├── templates/
│   ├── admin/
│   └── ...
├── app.py
├── models.py
├── auth.py
├── admin.py
├── decorators.py
└── requirements.txt
```

### Teknolojiler

- **Backend**
  - Flask
  - SQLAlchemy
  - Flask-Login
  - Flask-Migrate
  - Flask-WTF

- **Frontend**
  - Bootstrap 5
  - jQuery
  - Font Awesome

### Veritabanı Şeması

- **Kullanici**
  - Temel kullanıcı bilgileri
  - Not ortalaması
  - Rol (öğrenci/personel/mezun/admin)

- **Kategori**
  - Ürün kategorileri
  - Sıralama ve aktiflik durumu

- **Urun**
  - Ürün detayları
  - Stok bilgisi
  - Kategori ilişkisi

- **Siparis**
  - Sipariş bilgileri
  - Kullanıcı ilişkisi
  - Ödeme ve teslimat detayları

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik: XYZ'`)
4. Branch'inizi push edin (`git push origin yeni-ozellik`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

- Proje Sorumlusu: [Ad Soyad](mailto:ornek@firat.edu.tr)
- Proje Web Sitesi: [https://store.firat.edu.tr](https://store.firat.edu.tr)

## Teşekkürler

Bu projenin geliştirilmesine katkıda bulunan herkese teşekkür ederiz.
