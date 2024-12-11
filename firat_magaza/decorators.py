from functools import wraps
from flask import flash, redirect, url_for
from flask_login import current_user

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.rol != 'admin':
            flash('Bu sayfaya erişim yetkiniz yok.', 'error')
            return redirect(url_for('ana_sayfa'))
        return f(*args, **kwargs)
    return decorated_function
