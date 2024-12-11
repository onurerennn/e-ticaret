-- Kullanici Tablosu
CREATE TABLE kullanici (
    id INT PRIMARY KEY IDENTITY(1,1),
    kullanici_adi VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    parola_hash VARCHAR(128),
    ad VARCHAR(50),
    soyad VARCHAR(50),
    kullanici_tipi VARCHAR(20) DEFAULT 'musteri',  -- musteri, ogrenci, personel, admin
    ogrenci_no VARCHAR(20),
    not_ortalamasi FLOAT,
    kayit_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    son_giris DATETIME,
    aktif BIT DEFAULT 1,
    is_admin BIT DEFAULT 0
);

-- Urun Tablosu
CREATE TABLE urun (
    id INT PRIMARY KEY IDENTITY(1,1),
    ad VARCHAR(100) NOT NULL,
    aciklama TEXT,
    fiyat FLOAT NOT NULL,
    stok_miktari INT DEFAULT 0,
    kategori VARCHAR(50),
    resim_url VARCHAR(200),
    olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi DATETIME,
    aktif BIT DEFAULT 1
);

-- Siparis Tablosu
CREATE TABLE siparis (
    id INT PRIMARY KEY IDENTITY(1,1),
    kullanici_id INT NOT NULL,
    tarih DATETIME DEFAULT CURRENT_TIMESTAMP,
    durum VARCHAR(20) DEFAULT 'Beklemede',
    ara_toplam FLOAT NOT NULL,
    indirim_tutari FLOAT DEFAULT 0,
    toplam_fiyat FLOAT NOT NULL,
    adres TEXT NOT NULL,
    telefon VARCHAR(20) NOT NULL,
    guncelleme_tarihi DATETIME,
    notlar TEXT,
    FOREIGN KEY (kullanici_id) REFERENCES kullanici(id)
);

-- SiparisUrun Tablosu
CREATE TABLE siparis_urun (
    id INT PRIMARY KEY IDENTITY(1,1),
    siparis_id INT NOT NULL,
    urun_id INT NOT NULL,
    miktar INT NOT NULL,
    birim_fiyat FLOAT NOT NULL,
    toplam_fiyat FLOAT NOT NULL,
    indirim_tutari FLOAT DEFAULT 0,
    FOREIGN KEY (siparis_id) REFERENCES siparis(id),
    FOREIGN KEY (urun_id) REFERENCES urun(id)
);

-- SiparisDurumDegisikligi Tablosu
CREATE TABLE siparis_durum_degisikligi (
    id INT PRIMARY KEY IDENTITY(1,1),
    siparis_id INT NOT NULL,
    eski_durum VARCHAR(20) NOT NULL,
    yeni_durum VARCHAR(20) NOT NULL,
    tarih DATETIME DEFAULT CURRENT_TIMESTAMP,
    aciklama TEXT,
    FOREIGN KEY (siparis_id) REFERENCES siparis(id)
);

-- SepetUrunu Tablosu
CREATE TABLE sepet_urunu (
    id INT PRIMARY KEY IDENTITY(1,1),
    kullanici_id INT NOT NULL,
    urun_id INT NOT NULL,
    miktar INT NOT NULL DEFAULT 1,
    ekleme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES kullanici(id),
    FOREIGN KEY (urun_id) REFERENCES urun(id)
);

-- Kategori Tablosu
CREATE TABLE kategori (
    id INT PRIMARY KEY IDENTITY(1,1),
    ad VARCHAR(50) UNIQUE NOT NULL,
    aciklama TEXT,
    sira INT DEFAULT 0,
    aktif BIT DEFAULT 1
);

-- Kampanya Tablosu
CREATE TABLE kampanya (
    id INT PRIMARY KEY IDENTITY(1,1),
    ad VARCHAR(100) NOT NULL,
    aciklama TEXT,
    baslangic_tarihi DATETIME NOT NULL,
    bitis_tarihi DATETIME NOT NULL,
    indirim_orani FLOAT NOT NULL,
    minimum_tutar FLOAT DEFAULT 0,
    maksimum_indirim FLOAT,
    kullanim_limiti INT,
    kullanim_sayisi INT DEFAULT 0,
    aktif BIT DEFAULT 1
);

-- Log Tablosu
CREATE TABLE log (
    id INT PRIMARY KEY IDENTITY(1,1),
    kullanici_id INT,
    islem VARCHAR(50) NOT NULL,
    detay TEXT,
    ip_adresi VARCHAR(50),
    tarih DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES kullanici(id)
);

-- Ýndeksler
CREATE INDEX idx_kullanici_email ON kullanici(email);
CREATE INDEX idx_kullanici_ogrenci_no ON kullanici(ogrenci_no);
CREATE INDEX idx_urun_kategori ON urun(kategori);
CREATE INDEX idx_siparis_kullanici ON siparis(kullanici_id);
CREATE INDEX idx_siparis_tarih ON siparis(tarih);
CREATE INDEX idx_siparis_durum ON siparis(durum);
CREATE INDEX idx_sepet_kullanici ON sepet_urunu(kullanici_id);
CREATE INDEX idx_log_tarih ON log(tarih);

-- Tetikleyiciler (Triggers)
-- Sipariþ Durumu Deðiþtiðinde Durum Deðiþikliði Kaydý
GO
CREATE TRIGGER siparis_durum_degistiginde
ON siparis
AFTER UPDATE
AS
BEGIN
    IF UPDATE(durum)
    BEGIN
        INSERT INTO siparis_durum_degisikligi (siparis_id, eski_durum, yeni_durum, tarih)
        SELECT inserted.id, deleted.durum, inserted.durum, CURRENT_TIMESTAMP
        FROM inserted
        JOIN deleted ON inserted.id = deleted.id;
    END
END;
GO

-- Ürün Stok Miktarý Sýfýrýn Altýna Düþemez
GO
CREATE TRIGGER urun_stok_sifir_altina_dusemez
ON siparis_urun
FOR INSERT
AS
BEGIN
    DECLARE @stok_miktari INT;
    SELECT @stok_miktari = stok_miktari FROM urun WHERE id = (SELECT urun_id FROM inserted);
    IF @stok_miktari < (SELECT miktar FROM inserted)
    BEGIN
        RAISERROR('Yetersiz stok!', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- Sipariþ Oluþturulduðunda Ürün Stok Miktarý Azalýr
GO
CREATE TRIGGER siparis_olusturulurken_stok_azalir
ON siparis_urun
AFTER INSERT
AS
BEGIN
    UPDATE urun
    SET stok_miktari = stok_miktari - (SELECT miktar FROM inserted WHERE inserted.urun_id = urun.id)
    WHERE urun.id IN (SELECT urun_id FROM inserted);
END;
GO

-- Sipariþ Ýptal Edildiðinde Ürün Stok Miktarý Artar
GO
CREATE TRIGGER siparis_iptal_edildiginde_stok_artar
ON siparis_urun
AFTER UPDATE
AS
BEGIN
    IF EXISTS (SELECT * FROM deleted WHERE siparis_id IS NULL)
    BEGIN
        UPDATE urun
        SET stok_miktari = stok_miktari + (SELECT miktar FROM deleted WHERE deleted.siparis_id IS NULL)
        WHERE urun.id IN (SELECT urun_id FROM deleted WHERE deleted.siparis_id IS NULL);
    END
END;
GO

ALTER TABLE kullanici
ADD rol VARCHAR(50);
