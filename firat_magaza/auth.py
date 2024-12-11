from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from datetime import datetime

from models import db, Kullanici

auth = Blueprint('auth', __name__)

@auth.route('/giris', methods=['GET', 'POST'])
def giris():
    if current_user.is_authenticated:
        return redirect(url_for('ana_sayfa'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        parola = request.form.get('parola')
        
        kullanici = Kullanici.query.filter_by(email=email).first()
        
        if kullanici and kullanici.parola_kontrol(parola):
            if not kullanici.aktif:
                flash('Hesabınız devre dışı bırakılmış.', 'error')
                return redirect(url_for('auth.giris'))
                
            kullanici.son_giris = datetime.utcnow()
            db.session.commit()
            
            login_user(kullanici)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('ana_sayfa'))
        else:
            flash('E-posta veya parola hatalı.', 'error')
            
    return render_template('giris.html')

@auth.route('/kayit', methods=['GET', 'POST'])
def kayit():
    if current_user.is_authenticated:
        return redirect(url_for('ana_sayfa'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        parola = request.form.get('parola')
        parola_tekrar = request.form.get('parola_tekrar')
        ad = request.form.get('ad')
        soyad = request.form.get('soyad')
        ogrenci_no = request.form.get('ogrenci_no')
        not_ortalamasi = request.form.get('not_ortalamasi')
        
        # Zorunlu alanları kontrol et
        if not all([email, parola, parola_tekrar, ad, soyad]):
            flash('Lütfen tüm zorunlu alanları doldurun.', 'error')
            return redirect(url_for('auth.kayit'))
            
        # Parola kontrolü
        if parola != parola_tekrar:
            flash('Parolalar eşleşmiyor.', 'error')
            return redirect(url_for('auth.kayit'))
            
        # E-posta kontrolü
        if Kullanici.query.filter_by(email=email).first():
            flash('Bu e-posta adresi zaten kayıtlı.', 'error')
            return redirect(url_for('auth.kayit'))
            
        # Öğrenci numarası kontrolü
        if ogrenci_no and Kullanici.query.filter_by(ogrenci_no=ogrenci_no).first():
            flash('Bu öğrenci numarası zaten kayıtlı.', 'error')
            return redirect(url_for('auth.kayit'))
            
        # Not ortalaması kontrolü
        try:
            not_ortalamasi = float(not_ortalamasi) if not_ortalamasi else None
            if not_ortalamasi and (not_ortalamasi < 0 or not_ortalamasi > 4):
                flash('Geçerli bir not ortalaması girin (0-4 arası).', 'error')
                return redirect(url_for('auth.kayit'))
        except ValueError:
            flash('Geçerli bir not ortalaması girin.', 'error')
            return redirect(url_for('auth.kayit'))
            
        # Yeni kullanıcı oluştur
        yeni_kullanici = Kullanici(
            email=email,
            ad=ad,
            soyad=soyad,
            ogrenci_no=ogrenci_no,
            not_ortalamasi=not_ortalamasi
        )
        yeni_kullanici.parola_belirle(parola)
        
        try:
            db.session.add(yeni_kullanici)
            db.session.commit()
            flash('Kayıt başarılı! Şimdi giriş yapabilirsiniz.', 'success')
            return redirect(url_for('auth.giris'))
        except Exception as e:
            db.session.rollback()
            flash('Kayıt sırasında bir hata oluştu.', 'error')
            return redirect(url_for('auth.kayit'))
            
    return render_template('kayit.html')

@auth.route('/cikis')
@login_required
def cikis():
    logout_user()
    flash('Başarıyla çıkış yaptınız.', 'success')
    return redirect(url_for('ana_sayfa'))

@auth.route('/profil/guncelle', methods=['POST'])
@login_required
def profil_guncelle():
    if request.method == 'POST':
        ad = request.form.get('ad')
        soyad = request.form.get('soyad')
        not_ortalamasi = request.form.get('not_ortalamasi')
        
        if not all([ad, soyad]):
            flash('Ad ve soyad alanları zorunludur.', 'error')
            return redirect(url_for('profil'))
            
        try:
            not_ortalamasi = float(not_ortalamasi) if not_ortalamasi else None
            if not_ortalamasi and (not_ortalamasi < 0 or not_ortalamasi > 4):
                flash('Geçerli bir not ortalaması girin (0-4 arası).', 'error')
                return redirect(url_for('profil'))
        except ValueError:
            flash('Geçerli bir not ortalaması girin.', 'error')
            return redirect(url_for('profil'))
            
        current_user.ad = ad
        current_user.soyad = soyad
        current_user.not_ortalamasi = not_ortalamasi
        
        try:
            db.session.commit()
            flash('Profil bilgileriniz güncellendi.', 'success')
        except:
            db.session.rollback()
            flash('Güncelleme sırasında bir hata oluştu.', 'error')
            
    return redirect(url_for('profil'))

@auth.route('/profil/parola', methods=['POST'])
@login_required
def parola_degistir():
    if request.method == 'POST':
        eski_parola = request.form.get('eski_parola')
        yeni_parola = request.form.get('yeni_parola')
        yeni_parola_tekrar = request.form.get('yeni_parola_tekrar')
        
        if not all([eski_parola, yeni_parola, yeni_parola_tekrar]):
            flash('Tüm parola alanlarını doldurun.', 'error')
            return redirect(url_for('profil'))
            
        if not current_user.parola_kontrol(eski_parola):
            flash('Mevcut parolanız hatalı.', 'error')
            return redirect(url_for('profil'))
            
        if yeni_parola != yeni_parola_tekrar:
            flash('Yeni parolalar eşleşmiyor.', 'error')
            return redirect(url_for('profil'))
            
        current_user.parola_belirle(yeni_parola)
        
        try:
            db.session.commit()
            flash('Parolanız başarıyla değiştirildi.', 'success')
        except:
            db.session.rollback()
            flash('Parola değiştirme sırasında bir hata oluştu.', 'error')
            
    return redirect(url_for('profil'))
