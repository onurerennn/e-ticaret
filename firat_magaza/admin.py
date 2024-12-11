from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime
import os

from models import db, Urun, Kategori, Kullanici, Siparis, SiparisUrun
from decorators import admin_required

admin = Blueprint('admin', __name__, url_prefix='/admin')

@admin.route('/')
@login_required
@admin_required
def panel():
    return render_template('admin/panel.html')

# Kategori Yönetimi
@admin.route('/kategoriler')
@login_required
@admin_required
def kategoriler():
    kategoriler = Kategori.query.order_by(Kategori.sira).all()
    return render_template('admin/kategoriler.html', kategoriler=kategoriler)

@admin.route('/kategori/ekle', methods=['POST'])
@login_required
@admin_required
def kategori_ekle():
    ad = request.form.get('ad')
    aciklama = request.form.get('aciklama')
    sira = request.form.get('sira', type=int)
    
    if not ad:
        return jsonify({'success': False, 'message': 'Kategori adı zorunludur.'}), 400
        
    if Kategori.query.filter_by(ad=ad).first():
        return jsonify({'success': False, 'message': 'Bu kategori zaten mevcut.'}), 400
        
    yeni_kategori = Kategori(
        ad=ad,
        aciklama=aciklama,
        sira=sira or 0
    )
    
    try:
        db.session.add(yeni_kategori)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Kategori başarıyla eklendi.',
            'kategori': {
                'id': yeni_kategori.id,
                'ad': yeni_kategori.ad,
                'aciklama': yeni_kategori.aciklama,
                'sira': yeni_kategori.sira
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Bir hata oluştu.'}), 500

@admin.route('/kategori/<int:id>/guncelle', methods=['POST'])
@login_required
@admin_required
def kategori_guncelle(id):
    kategori = Kategori.query.get_or_404(id)
    
    ad = request.form.get('ad')
    aciklama = request.form.get('aciklama')
    sira = request.form.get('sira', type=int)
    aktif = request.form.get('aktif') == 'true'
    
    if not ad:
        return jsonify({'success': False, 'message': 'Kategori adı zorunludur.'}), 400
        
    mevcut_kategori = Kategori.query.filter_by(ad=ad).first()
    if mevcut_kategori and mevcut_kategori.id != id:
        return jsonify({'success': False, 'message': 'Bu kategori adı zaten kullanılıyor.'}), 400
        
    try:
        kategori.ad = ad
        kategori.aciklama = aciklama
        kategori.sira = sira or 0
        kategori.aktif = aktif
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Kategori başarıyla güncellendi.',
            'kategori': {
                'id': kategori.id,
                'ad': kategori.ad,
                'aciklama': kategori.aciklama,
                'sira': kategori.sira,
                'aktif': kategori.aktif
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Bir hata oluştu.'}), 500

# Ürün Yönetimi
@admin.route('/urunler')
@login_required
@admin_required
def urunler():
    urunler = Urun.query.order_by(Urun.olusturma_tarihi.desc()).all()
    kategoriler = Kategori.query.filter_by(aktif=True).order_by(Kategori.sira).all()
    return render_template('admin/urunler.html', urunler=urunler, kategoriler=kategoriler)

@admin.route('/urun/ekle', methods=['POST'])
@login_required
@admin_required
def urun_ekle():
    ad = request.form.get('ad')
    aciklama = request.form.get('aciklama')
    fiyat = request.form.get('fiyat', type=float)
    stok_miktari = request.form.get('stok_miktari', type=int)
    kategori = request.form.get('kategori')
    resim = request.files.get('resim')
    
    if not all([ad, fiyat, stok_miktari, kategori]):
        return jsonify({'success': False, 'message': 'Tüm zorunlu alanları doldurun.'}), 400
        
    if resim:
        # Resim kaydetme işlemi
        dosya_adi = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{resim.filename}"
        resim.save(os.path.join(current_app.config['UPLOAD_FOLDER'], dosya_adi))
    else:
        dosya_adi = None
        
    yeni_urun = Urun(
        ad=ad,
        aciklama=aciklama,
        fiyat=fiyat,
        stok_miktari=stok_miktari,
        kategori=kategori,
        resim_url=dosya_adi
    )
    
    try:
        db.session.add(yeni_urun)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Ürün başarıyla eklendi.',
            'urun': {
                'id': yeni_urun.id,
                'ad': yeni_urun.ad,
                'fiyat': yeni_urun.fiyat,
                'stok_miktari': yeni_urun.stok_miktari
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Bir hata oluştu.'}), 500

@admin.route('/urun/<int:id>/guncelle', methods=['POST'])
@login_required
@admin_required
def urun_guncelle(id):
    urun = Urun.query.get_or_404(id)
    
    ad = request.form.get('ad')
    aciklama = request.form.get('aciklama')
    fiyat = request.form.get('fiyat', type=float)
    stok_miktari = request.form.get('stok_miktari', type=int)
    kategori = request.form.get('kategori')
    aktif = request.form.get('aktif') == 'true'
    resim = request.files.get('resim')
    
    if not all([ad, fiyat, stok_miktari, kategori]):
        return jsonify({'success': False, 'message': 'Tüm zorunlu alanları doldurun.'}), 400
        
    if resim:
        # Eski resmi sil
        if urun.resim_url:
            eski_resim_yolu = os.path.join(current_app.config['UPLOAD_FOLDER'], urun.resim_url)
            if os.path.exists(eski_resim_yolu):
                os.remove(eski_resim_yolu)
        
        # Yeni resmi kaydet
        dosya_adi = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{resim.filename}"
        resim.save(os.path.join(current_app.config['UPLOAD_FOLDER'], dosya_adi))
        urun.resim_url = dosya_adi
    
    try:
        urun.ad = ad
        urun.aciklama = aciklama
        urun.fiyat = fiyat
        urun.stok_miktari = stok_miktari
        urun.kategori = kategori
        urun.aktif = aktif
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Ürün başarıyla güncellendi.',
            'urun': {
                'id': urun.id,
                'ad': urun.ad,
                'fiyat': urun.fiyat,
                'stok_miktari': urun.stok_miktari,
                'aktif': urun.aktif
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Bir hata oluştu.'}), 500

# Kullanıcı Yönetimi
@admin.route('/kullanicilar')
@login_required
@admin_required
def kullanicilar():
    kullanicilar = Kullanici.query.order_by(Kullanici.kayit_tarihi.desc()).all()
    return render_template('admin/kullanicilar.html', kullanicilar=kullanicilar)

@admin.route('/kullanici/<int:id>/durum', methods=['POST'])
@login_required
@admin_required
def kullanici_durum_degistir(id):
    kullanici = Kullanici.query.get_or_404(id)
    
    if kullanici.id == current_user.id:
        return jsonify({'success': False, 'message': 'Kendi hesabınızı devre dışı bırakamazsınız.'}), 400
        
    kullanici.aktif = not kullanici.aktif
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f"Kullanıcı {'aktifleştirildi' if kullanici.aktif else 'devre dışı bırakıldı'}.",
            'aktif': kullanici.aktif
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Bir hata oluştu.'}), 500

# Sipariş Yönetimi
@admin.route('/siparisler')
@login_required
@admin_required
def siparisler():
    siparisler = Siparis.query.order_by(Siparis.siparis_tarihi.desc()).all()
    return render_template('admin/siparisler.html', siparisler=siparisler)

@admin.route('/siparis/<int:id>/durum', methods=['POST'])
@login_required
@admin_required
def siparis_durum_guncelle(id):
    siparis = Siparis.query.get_or_404(id)
    yeni_durum = request.form.get('durum')
    
    if not yeni_durum:
        return jsonify({'success': False, 'message': 'Durum belirtilmedi.'}), 400
        
    try:
        siparis.durum = yeni_durum
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Sipariş durumu güncellendi.',
            'durum': siparis.durum
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Bir hata oluştu.'}), 500

# İstatistikler
@admin.route('/istatistikler')
@login_required
@admin_required
def istatistikler():
    # Toplam kullanıcı sayısı
    toplam_kullanici = Kullanici.query.count()
    
    # Toplam sipariş sayısı ve ciro
    toplam_siparis = Siparis.query.count()
    toplam_ciro = db.session.query(db.func.sum(Siparis.toplam_tutar)).scalar() or 0
    
    # En çok satan ürünler
    en_cok_satanlar = db.session.query(
        Urun,
        db.func.sum(SiparisUrun.miktar).label('toplam_satis')
    ).join(SiparisUrun).group_by(Urun).order_by(db.desc('toplam_satis')).limit(5).all()
    
    return render_template('admin/istatistikler.html',
                         toplam_kullanici=toplam_kullanici,
                         toplam_siparis=toplam_siparis,
                         toplam_ciro=toplam_ciro,
                         en_cok_satanlar=en_cok_satanlar)
