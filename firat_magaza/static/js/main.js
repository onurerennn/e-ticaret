// Flash mesajları için otomatik kapatma
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        if (!alert.classList.contains('alert-danger')) {
            setTimeout(() => {
                alert.classList.add('fade');
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }, 5000);
        }
    });
});

// Form doğrulama
function validateForm(form) {
    let isValid = true;
    const requiredInputs = form.querySelectorAll('[required]');
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
            
            // Hata mesajı göster
            let feedback = input.nextElementSibling;
            if (!feedback || !feedback.classList.contains('invalid-feedback')) {
                feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                feedback.textContent = 'Bu alan zorunludur.';
                input.parentNode.insertBefore(feedback, input.nextSibling);
            }
        } else {
            input.classList.remove('is-invalid');
            const feedback = input.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.remove();
            }
        }
    });
    
    return isValid;
}

// Input maskeleme
document.addEventListener('DOMContentLoaded', function() {
    // Sadece sayı girişi
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });
    
    // Para formatı
    const priceInputs = document.querySelectorAll('.price-input');
    priceInputs.forEach(input => {
        input.addEventListener('input', function() {
            let value = this.value.replace(/[^0-9]/g, '');
            if (value) {
                value = parseInt(value, 10);
                this.value = new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                }).format(value / 100);
            }
        });
    });
});

// AJAX istekleri için yardımcı fonksiyon
async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content,
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
}

// Loading spinner yönetimi
function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

// Toast bildirim sistemi
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }
    
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
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Sepet işlemleri
async function updateCart(productId, quantity) {
    try {
        const response = await fetchData(`/sepet/guncelle/${productId}`, {
            method: 'POST',
            body: JSON.stringify({ miktar: quantity })
        });
        
        if (response.success) {
            location.reload();
        } else {
            showToast(response.message || 'Bir hata oluştu.', 'danger');
        }
    } catch (error) {
        showToast('Bir hata oluştu.', 'danger');
    }
}

async function removeFromCart(productId) {
    if (confirm('Bu ürünü sepetten kaldırmak istediğinize emin misiniz?')) {
        try {
            const response = await fetchData(`/sepet/kaldir/${productId}`, {
                method: 'POST'
            });
            
            if (response.success) {
                location.reload();
            } else {
                showToast(response.message || 'Bir hata oluştu.', 'danger');
            }
        } catch (error) {
            showToast('Bir hata oluştu.', 'danger');
        }
    }
}

// Sayfa yüklendiğinde tooltip ve popover'ları etkinleştir
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});
