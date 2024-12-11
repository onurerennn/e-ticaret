from models import db, Kullanici, Kategori, Urun

def ornek_veriler_ekle():
    """Veritabanına örnek veriler ekler."""
    
    # Admin kullanıcısı oluştur
    if not Kullanici.query.filter_by(email='admin@firat.edu.tr').first():
        admin = Kullanici(
            email='admin@firat.edu.tr',
            ad='Admin',
            soyad='Kullanıcı',
            rol='admin'
        )
        admin.parola_belirle('admin123')
        db.session.add(admin)
    
    # Kategoriler
    kategoriler = [
        {
            'ad': 'T-Shirt',
            'aciklama': 'Fırat Üniversitesi logolu t-shirtler',
            'sira': 1
        },
        {
            'ad': 'Sweatshirt',
            'aciklama': 'Fırat Üniversitesi logolu sweatshirtler',
            'sira': 2
        },
        {
            'ad': 'Kırtasiye',
            'aciklama': 'Kalem, defter ve diğer kırtasiye ürünleri',
            'sira': 3
        },
        {
            'ad': 'Aksesuarlar',
            'aciklama': 'Rozet, anahtarlık ve diğer aksesuarlar',
            'sira': 4
        }
    ]
    
    for kategori_data in kategoriler:
        if not Kategori.query.filter_by(ad=kategori_data['ad']).first():
            kategori = Kategori(**kategori_data)
            db.session.add(kategori)
    
    # Örnek ürünler
    urunler = [
        {
            'ad': 'Klasik Logo T-Shirt',
            'aciklama': 'Fırat Üniversitesi klasik logo baskılı pamuklu t-shirt',
            'fiyat': 149.99,
            'stok_miktari': 100,
            'kategori': 'T-Shirt'
        },
        {
            'ad': 'Kapüşonlu Sweatshirt',
            'aciklama': 'Fırat Üniversitesi logolu kapüşonlu sweatshirt',
            'fiyat': 299.99,
            'stok_miktari': 50,
            'kategori': 'Sweatshirt'
        },
        {
            'ad': 'Spiralli Defter',
            'aciklama': 'Fırat Üniversitesi logolu A4 spiralli defter',
            'fiyat': 39.99,
            'stok_miktari': 200,
            'kategori': 'Kırtasiye'
        },
        {
            'ad': 'Metal Rozet',
            'aciklama': 'Fırat Üniversitesi metal rozet',
            'fiyat': 24.99,
            'stok_miktari': 150,
            'kategori': 'Aksesuarlar'
        },
        {
            'ad': 'Polo Yaka T-Shirt',
            'aciklama': 'Fırat Üniversitesi logolu polo yaka t-shirt',
            'fiyat': 179.99,
            'stok_miktari': 75,
            'kategori': 'T-Shirt'
        },
        {
            'ad': 'Fermuarlı Sweatshirt',
            'aciklama': 'Fırat Üniversitesi logolu fermuarlı sweatshirt',
            'fiyat': 349.99,
            'stok_miktari': 40,
            'kategori': 'Sweatshirt'
        },
        {
            'ad': 'Kalem Seti',
            'aciklama': 'Fırat Üniversitesi logolu premium kalem seti',
            'fiyat': 89.99,
            'stok_miktari': 100,
            'kategori': 'Kırtasiye'
        },
        {
            'ad': 'Anahtarlık',
            'aciklama': 'Fırat Üniversitesi logolu metal anahtarlık',
            'fiyat': 29.99,
            'stok_miktari': 200,
            'kategori': 'Aksesuarlar'
        }
    ]
    
    for urun_data in urunler:
        if not Urun.query.filter_by(ad=urun_data['ad']).first():
            urun = Urun(**urun_data)
            db.session.add(urun)
    
    try:
        db.session.commit()
        print("Örnek veriler başarıyla eklendi.")
    except Exception as e:
        db.session.rollback()
        print(f"Hata oluştu: {str(e)}")

if __name__ == '__main__':
    ornek_veriler_ekle()
