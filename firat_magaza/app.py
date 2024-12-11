from flask import Flask, render_template, flash, redirect, url_for, request, jsonify
from flask_login import LoginManager, current_user, login_required
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect
from datetime import datetime
import os

from models import db, Kullanici, Siparis, SiparisUrun
from admin import admin
from auth import auth
from decorators import admin_required

def create_app():
    app = Flask(__name__)
    
    # Yapılandırma
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'gizli-anahtar-degistir')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///firat_magaza.db') # Corrected database URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static/img/urunler')

    # CSRF koruması
    csrf = CSRFProtect(app)

    # Veritabanı
    db.init_app(app)
    Migrate(app, db)

    # Login Manager
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.giris'
    login_manager.login_message = 'Lütfen giriş yapın.'
    login_manager.login_message_category = 'info'

    @login_manager.user_loader
    def load_user(user_id):
        return Kullanici.query.get(int(user_id))

    # Blueprint'leri kaydet
    app.register_blueprint(admin)
    app.register_blueprint(auth)

    # Ana sayfa
    @app.route('/')
    def ana_sayfa():
        from models import Urun, Kategori
        kategoriler = Kategori.query.filter_by(aktif=True).order_by(Kategori.sira).all()
        yeni_urunler = Urun.query.filter_by(aktif=True).order_by(Urun.olusturma_tarihi.desc()).limit(8).all()
        return render_template('ana_sayfa.html', 
                             kategoriler=kategoriler,
                             yeni_urunler=yeni_urunler)

    # Ürün detay sayfası
    @app.route('/urun/<int:urun_id>')
    def urun_detay(urun_id):
        from models import Urun
        urun = Urun.query.get_or_404(urun_id)
        return render_template('urun_detay.html', urun=urun)

    # Kategori sayfası
    @app.route('/kategori/<int:kategori_id>')
    def kategori(kategori_id):
        from models import Kategori, Urun
        kategori = Kategori.query.get_or_404(kategori_id)
        urunler = Urun.query.filter_by(kategori=kategori.ad, aktif=True).all()
        return render_template('kategori.html', kategori=kategori, urunler=urunler)

    # Sepet işlemleri
    @app.route('/sepet')
    def sepet():
        if not current_user.is_authenticated:
            flash('Sepeti görüntülemek için giriş yapmalısınız.', 'warning')
            return redirect(url_for('auth.giris'))
        return render_template('sepet.html')

    @app.route('/sepete-ekle/<int:urun_id>', methods=['POST'])
    def sepete_ekle(urun_id):
        if not current_user.is_authenticated:
            flash('Ürün eklemek için giriş yapmalısınız.', 'warning')
            return redirect(url_for('auth.giris'))
        
        from models import Urun, SepetUrunu
        urun = Urun.query.get_or_404(urun_id)
        
        # Sepette aynı ürün var mı kontrol et
        sepet_urunu = SepetUrunu.query.filter_by(
            kullanici_id=current_user.id,
            urun_id=urun_id
        ).first()

        if sepet_urunu:
            sepet_urunu.miktar += 1
        else:
            sepet_urunu = SepetUrunu(
                kullanici_id=current_user.id,
                urun_id=urun_id,
                miktar=1
            )
            db.session.add(sepet_urunu)

        try:
            db.session.commit()
            flash('Ürün sepete eklendi.', 'success')
        except:
            db.session.rollback()
            flash('Bir hata oluştu.', 'error')

        return redirect(url_for('sepet'))

    # Profil sayfası
    @app.route('/profil')
    def profil():
        if not current_user.is_authenticated:
            return redirect(url_for('auth.giris'))
        return render_template('profil.html')

    # Siparişler sayfası
    @app.route('/siparisler')
    def siparisler():
        if not current_user.is_authenticated:
            return redirect(url_for('auth.giris'))
        return render_template('siparisler.html')

    # Hata sayfaları
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('404.html'), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template('500.html'), 500

    # Context processors
    @app.context_processor
    def utility_processor():
        def format_price(amount):
            return "{:,.2f} ₺".format(amount)
        return dict(format_price=format_price)

    @app.context_processor
    def inject_user():
        if current_user.is_authenticated:
            from models import SepetUrunu
            sepet_urun_sayisi = SepetUrunu.query.filter_by(kullanici_id=current_user.id).count()
        else:
            sepet_urun_sayisi = 0
        return dict(sepet_urun_sayisi=sepet_urun_sayisi)

    @app.context_processor
    def inject_now():
        return {'now': datetime.utcnow()}

    # Jinja2 filtreleri
    @app.template_filter('tarih')
    def tarih_formati(value):
        return value.strftime('%d.%m.%Y')

    @app.template_filter('para')
    def para_formati(value):
        return "{:,.2f} ₺".format(value)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
