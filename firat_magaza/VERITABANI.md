# Fırat Store Veritabanı Şeması

Bu doküman, Fırat Store uygulamasının veritabanı yapısını ve ilişkilerini detaylı olarak açıklamaktadır.

## Tablolar

### Kullanici

Kullanıcı bilgilerini saklayan tablo.

```sql
CREATE TABLE kullanici (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(120) UNIQUE NOT NULL,
    parola_hash VARCHAR(128) NOT NULL,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    ogrenci_no VARCHAR(20) UNIQUE,
    not_ortalamasi FLOAT,
    rol VARCHAR(20) DEFAULT 'kullanici',
    aktif BOOLEAN DEFAULT TRUE,
    son_giris DATETIME,
    kayit_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**İlişkiler:**
- `siparisler`: Kullanıcının siparişleri (one-to-many)
- `sepet`: Kullanıcının sepet ürünleri (one-to-many)

### Kategori

Ürün kategorilerini saklayan tablo.

```sql
CREATE TABLE kategori (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad VARCHAR(50) UNIQUE NOT NULL,
    aciklama TEXT,
    sira INTEGER DEFAULT 0,
    aktif BOOLEAN DEFAULT TRUE,
    olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**İlişkiler:**
- `urunler`: Kategoriye ait ürünler (one-to-many)

### Urun

Ürün bilgilerini saklayan tablo.

```sql
CREATE TABLE urun (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad VARCHAR(100) NOT NULL,
    aciklama TEXT,
    fiyat FLOAT NOT NULL,
    stok_miktari INTEGER DEFAULT 0,
    kategori VARCHAR(50) NOT NULL,
    resim_url VARCHAR(200),
    aktif BOOLEAN DEFAULT TRUE,
    olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi DATETIME,
    FOREIGN KEY (kategori) REFERENCES kategori(ad)
);
```

**İlişkiler:**
- `kategori`: Ürünün ait olduğu kategori (many-to-one)
- `sepet_urunleri`: Ürünün sepetlerdeki durumu (one-to-many)
- `siparis_urunleri`: Ürünün siparişlerdeki durumu (one-to-many)

### SepetUrunu

Kullanıcıların sepetlerindeki ürünleri saklayan tablo.

```sql
CREATE TABLE sepet_urunu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kullanici_id INTEGER NOT NULL,
    urun_id INTEGER NOT NULL,
    miktar INTEGER DEFAULT 1,
    ekleme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES kullanici(id),
    FOREIGN KEY (urun_id) REFERENCES urun(id)
);
```

**İlişkiler:**
- `kullanici`: Sepet sahibi kullanıcı (many-to-one)
- `urun`: Sepetteki ürün (many-to-one)

### Siparis

Kullanıcı siparişlerini saklayan tablo.

```sql
CREATE TABLE siparis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kullanici_id INTEGER NOT NULL,
    siparis_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    durum VARCHAR(20) DEFAULT 'beklemede',
    toplam_tutar FLOAT NOT NULL,
    indirim_tutari FLOAT DEFAULT 0,
    odeme_yontemi VARCHAR(50),
    teslimat_adresi TEXT NOT NULL,
    FOREIGN KEY (kullanici_id) REFERENCES kullanici(id)
);
```

**İlişkiler:**
- `kullanici`: Siparişi veren kullanıcı (many-to-one)
- `urunler`: Siparişteki ürünler (one-to-many through SiparisUrun)

### SiparisUrun

Siparişlerdeki ürünleri ve detaylarını saklayan tablo.

```sql
CREATE TABLE siparis_urun (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    siparis_id INTEGER NOT NULL,
    urun_id INTEGER NOT NULL,
    miktar INTEGER NOT NULL,
    birim_fiyat FLOAT NOT NULL,
    FOREIGN KEY (siparis_id) REFERENCES siparis(id),
    FOREIGN KEY (urun_id) REFERENCES urun(id)
);
```

**İlişkiler:**
- `siparis`: Ürünün ait olduğu sipariş (many-to-one)
- `urun`: Siparişteki ürün (many-to-one)

## İlişki Diyagramı

```
Kullanici
    ├── SepetUrunu (one-to-many)
    └── Siparis (one-to-many)

Kategori
    └── Urun (one-to-many)

Urun
    ├── SepetUrunu (one-to-many)
    └── SiparisUrun (one-to-many)

Siparis
    └── SiparisUrun (one-to-many)
```

## İndeksler

Performans optimizasyonu için oluşturulan indeksler:

```sql
-- Kullanıcı aramaları için
CREATE INDEX idx_kullanici_email ON kullanici(email);
CREATE INDEX idx_kullanici_ogrenci_no ON kullanici(ogrenci_no);

-- Kategori sıralaması için
CREATE INDEX idx_kategori_sira ON kategori(sira);

-- Ürün aramaları için
CREATE INDEX idx_urun_kategori ON urun(kategori);
CREATE INDEX idx_urun_aktif ON urun(aktif);

-- Sipariş aramaları için
CREATE INDEX idx_siparis_kullanici ON siparis(kullanici_id);
CREATE INDEX idx_siparis_tarih ON siparis(siparis_tarihi);
CREATE INDEX idx_siparis_durum ON siparis(durum);

-- Sepet aramaları için
CREATE INDEX idx_sepet_kullanici ON sepet_urunu(kullanici_id);
```

## Veri Bütünlüğü

Veritabanı, aşağıdaki bütünlük kurallarını uygular:

1. Kullanıcı e-posta adresleri ve öğrenci numaraları benzersiz olmalıdır.
2. Kategori adları benzersiz olmalıdır.
3. Ürün fiyatları sıfırdan büyük olmalıdır.
4. Stok miktarları negatif olamaz.
5. Sipariş tutarları sıfırdan büyük olmalıdır.
6. İndirim tutarı toplam tutardan büyük olamaz.

## Yedekleme

Veritabanı yedekleme işlemi için önerilen komut:

```bash
sqlite3 firat_store.db ".backup 'backup/firat_store_$(date +%Y%m%d_%H%M%S).db'"
```

## Migrations

Veritabanı şema değişiklikleri için Flask-Migrate kullanılmaktadır:

```bash
# Yeni migration oluştur
flask db migrate -m "Değişiklik açıklaması"

# Migration'ları uygula
flask db upgrade

# Son migration'ı geri al
flask db downgrade
