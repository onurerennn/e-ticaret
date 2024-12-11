// Profil Sayfası JavaScript İşlevleri

document.addEventListener('DOMContentLoaded', function() {
    // Form doğrulamaları
    initFormValidations();

    // Parola görünürlük kontrolü
    initPasswordToggles();

    // Not ortalaması kontrolü
    initGradeControl();

    // Profil resmi yükleme
    initProfileImageUpload();
});

// Form doğrulamalarını başlat
function initFormValidations() {
    // Profil güncelleme formu
    const profileForm = document.getElementById('profileUpdateForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            if (!validateProfileForm(this)) {
                e.preventDefault();
            }
        });
    }

    // Parola değiştirme formu
    const passwordForm = document.getElementById('passwordChangeForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            if (!validatePasswordForm(this)) {
                e.preventDefault();
            }
        });
    }
}

// Profil formu doğrulama
function validateProfileForm(form) {
    let isValid = true;

    // Ad ve soyad kontrolü
    const nameInput = form.querySelector('input[name="ad"]');
    const surnameInput = form.querySelector('input[name="soyad"]');

    if (nameInput && !nameInput.value.trim()) {
        showError(nameInput, 'Ad alanı zorunludur');
        isValid = false;
    }

    if (surnameInput && !surnameInput.value.trim()) {
        showError(surnameInput, 'Soyad alanı zorunludur');
        isValid = false;
    }

    // Not ortalaması kontrolü
    const gradeInput = form.querySelector('input[name="not_ortalamasi"]');
    if (gradeInput && gradeInput.value) {
        const grade = parseFloat(gradeInput.value);
        if (isNaN(grade) || grade < 0 || grade > 4) {
            showError(gradeInput, 'Not ortalaması 0-4 arasında olmalıdır');
            isValid = false;
        }
    }

    return isValid;
}

// Parola formu doğrulama
function validatePasswordForm(form) {
    let isValid = true;

    const currentPassword = form.querySelector('input[name="eski_parola"]');
    const newPassword = form.querySelector('input[name="yeni_parola"]');
    const confirmPassword = form.querySelector('input[name="yeni_parola_tekrar"]');

    // Mevcut parola kontrolü
    if (!currentPassword.value) {
        showError(currentPassword, 'Mevcut parolanızı girin');
        isValid = false;
    }

    // Yeni parola kontrolü
    if (!newPassword.value) {
        showError(newPassword, 'Yeni parolanızı girin');
        isValid = false;
    } else if (newPassword.value.length < 6) {
        showError(newPassword, 'Parola en az 6 karakter olmalıdır');
        isValid = false;
    }

    // Parola tekrar kontrolü
    if (!confirmPassword.value) {
        showError(confirmPassword, 'Parolanızı tekrar girin');
        isValid = false;
    } else if (newPassword.value !== confirmPassword.value) {
        showError(confirmPassword, 'Parolalar eşleşmiyor');
        isValid = false;
    }

    return isValid;
}

// Parola görünürlük kontrollerini başlat
function initPasswordToggles() {
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Not ortalaması kontrolünü başlat
function initGradeControl() {
    const gradeInput = document.querySelector('input[name="not_ortalamasi"]');
    if (gradeInput) {
        gradeInput.addEventListener('input', function() {
            let value = this.value.replace(/[^0-9.]/g, '');
            
            // Birden fazla nokta kontrolü
            const dots = value.match(/\./g);
            if (dots && dots.length > 1) {
                value = value.substring(0, value.lastIndexOf('.'));
            }
            
            // Maksimum 4 kontrolü
            if (value && !isNaN(value)) {
                value = Math.min(parseFloat(value), 4).toString();
            }
            
            this.value = value;
            updateDiscountRate(value);
        });
    }
}

// İndirim oranını güncelle
function updateDiscountRate(grade) {
    const discountElement = document.querySelector('.discount-rate');
    if (discountElement) {
        let rate = 0;
        grade = parseFloat(grade);

        if (!isNaN(grade)) {
            if (grade >= 3.5) rate = 10;
            else if (grade >= 3.0) rate = 7;
            else if (grade >= 2.5) rate = 5;
        }

        discountElement.textContent = `%${rate}`;
        discountElement.parentElement.style.display = rate > 0 ? 'block' : 'none';
    }
}

// Profil resmi yükleme
function initProfileImageUpload() {
    const imageInput = document.getElementById('profileImageInput');
    const imagePreview = document.getElementById('profileImagePreview');
    
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Dosya türü kontrolü
                if (!file.type.startsWith('image/')) {
                    showToast('Lütfen geçerli bir resim dosyası seçin', 'error');
                    return;
                }

                // Dosya boyutu kontrolü (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showToast('Resim dosyası 2MB\'dan küçük olmalıdır', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Hata mesajı göster
function showError(input, message) {
    const formGroup = input.closest('.form-group');
    const errorDiv = formGroup.querySelector('.invalid-feedback') || 
                    document.createElement('div');
    
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    
    input.classList.add('is-invalid');
    
    if (!formGroup.querySelector('.invalid-feedback')) {
        input.parentNode.appendChild(errorDiv);
    }
}

// Toast bildirimi göster
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    const container = document.getElementById('toast-container') || createToastContainer();
    container.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// Toast container oluştur
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}
