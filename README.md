# Fırat Store

Fırat Store, Fırat Üniversitesi öğrencileri, personeli ve mezunları için özel olarak tasarlanmış bir e-ticaret platformudur. Platform, üniversitenin logolu ürünlerini sunarken, öğrencilerin akademik başarılarını teşvik eden benzersiz bir para puan sistemi sunmaktadır.
Proje lisans dersi olan yazılım tasarım ve mimarisi projesi için hazırlanmıştır

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

 

## İletişim

- Proje Sorumlusu: [Onur Eren Ejder](onurerenejder36@gmail.com)

