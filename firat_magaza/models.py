from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Kullanici(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    parola_hash = db.Column(db.String(128))
    ad = db.Column(db.String(50), nullable=False)
    soyad = db.Column(db.String(50), nullable=False)
    ogrenci_no = db.Column(db.String(20), unique=True)
    not_ortalamasi = db.Column(db.Float)
    rol = db.Column(db.String(20), default='kullanici')  # kullanici, admin
    aktif = db.Column(db.Boolean, default=True)
    son_giris = db.Column(db.DateTime)
    kayit_tarihi = db.Column(db.DateTime, default=datetime.utcnow)
    
    siparisler = db.relationship('Siparis', backref='kullanici', lazy=True)
    sepet = db.relationship('SepetUrunu', backref='kullanici', lazy=True)

    def parola_belirle(self, parola):
        self.parola_hash = generate_password_hash(parola)

    def parola_kontrol(self, parola):
        return check_password_hash(self.parola_hash, parola)

    def indirim_orani(self):
        if not self.not_ortalamasi:
            return 0
        elif self.not_ortalamasi >= 3.5:
            return 10
        elif self.not_ortalamasi >= 3.0:
            return 7
        elif self.not_ortalamasi >= 2.5:
            return 5
        return 0

class Kategori(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ad = db.Column(db.String(50), unique=True, nullable=False)
    aciklama = db.Column(db.Text)
    sira = db.Column(db.Integer, default=0)
    aktif = db.Column(db.Boolean, default=True)
    olusturma_tarihi = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Kategori {self.ad}>'

class Urun(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ad = db.Column(db.String(100), nullable=False)
    aciklama = db.Column(db.Text)
    fiyat = db.Column(db.Float, nullable=False)
    stok_miktari = db.Column(db.Integer, default=0)
    kategori = db.Column(db.String(50), db.ForeignKey('kategori.ad'), nullable=False)
    resim_url = db.Column(db.String(200))
    aktif = db.Column(db.Boolean, default=True)
    olusturma_tarihi = db.Column(db.DateTime, default=datetime.utcnow)
    guncelleme_tarihi = db.Column(db.DateTime, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Urun {self.ad}>'

class SepetUrunu(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    kullanici_id = db.Column(db.Integer, db.ForeignKey('kullanici.id'), nullable=False)
    urun_id = db.Column(db.Integer, db.ForeignKey('urun.id'), nullable=False)
    miktar = db.Column(db.Integer, default=1)
    ekleme_tarihi = db.Column(db.DateTime, default=datetime.utcnow)
    
    urun = db.relationship('Urun', backref='sepet_urunleri')

    def toplam_fiyat(self):
        return self.urun.fiyat * self.miktar

class Siparis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    kullanici_id = db.Column(db.Integer, db.ForeignKey('kullanici.id'), nullable=False)
    siparis_tarihi = db.Column(db.DateTime, default=datetime.utcnow)
    durum = db.Column(db.String(20), default='beklemede')  # beklemede, onaylandı, kargoda, tamamlandı, iptal
    toplam_tutar = db.Column(db.Float, nullable=False)
    indirim_tutari = db.Column(db.Float, default=0)
    odeme_yontemi = db.Column(db.String(50))
    teslimat_adresi = db.Column(db.Text, nullable=False)
    
    urunler = db.relationship('SiparisUrun', backref='siparis', lazy=True)

    def __repr__(self):
        return f'<Siparis {self.id}>'

class SiparisUrun(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    siparis_id = db.Column(db.Integer, db.ForeignKey('siparis.id'), nullable=False)
    urun_id = db.Column(db.Integer, db.ForeignKey('urun.id'), nullable=False)
    miktar = db.Column(db.Integer, nullable=False)
    birim_fiyat = db.Column(db.Float, nullable=False)
    
    urun = db.relationship('Urun')

    def toplam_fiyat(self):
        return self.birim_fiyat * self.miktar
