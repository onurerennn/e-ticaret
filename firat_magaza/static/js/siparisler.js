// Siparişler Sayfası JavaScript İşlevleri

document.addEventListener('DOMContentLoaded', function() {
    // Sipariş filtreleme
    initOrderFilters();

    // Sipariş detay modalları
    initOrderModals();

    // Tarih formatı
    formatDates();

    // Para formatı
    formatPrices();
});

// Sipariş filtreleme başlatma
function initOrderFilters() {
    const filterForm = document.getElementById('orderFilterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters();
        });

        // Filtreleri temizle butonu
        const clearButton = filterForm.querySelector('.clear-filters');
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                filterForm.reset();
                applyFilters();
            });
        }

        // URL'den filtreleri yükle
        loadFiltersFromUrl();
    }
}

// Filtreleri uygula
async function applyFilters() {
    const form = document.getElementById('orderFilterForm');
    const ordersContainer = document.querySelector('.orders-container');
    
    if (!form || !ordersContainer) return;

    try {
        // Loading durumunu göster
        ordersContainer.classList.add('loading');
        
        const formData = new FormData(form);
        const params = new URLSearchParams(formData);
        
        // URL'i güncelle
        window.history.pushState({}, '', `?${params.toString()}`);
        
        const response = await fetch(`/api/siparisler?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            // Siparişleri güncelle
            ordersContainer.innerHTML = data.html;
            
            // Yeni içeriğe event listener'ları ekle
            initOrderModals();
            formatDates();
            formatPrices();
            
            // Sonuç sayısını güncelle
            updateResultCount(data.total);
        } else {
            throw new Error(data.message || 'Siparişler yüklenirken bir hata oluştu');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        ordersContainer.classList.remove('loading');
    }
}

// URL'den filtreleri yükle
function loadFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const form = document.getElementById('orderFilterForm');
    
    if (!form) return;

    // Form alanlarını URL parametrelerine göre doldur
    for (const [key, value] of params) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = value;
        }
    }
}

// Sipariş detay modallarını başlat
function initOrderModals() {
    document.querySelectorAll('[data-order-detail]').forEach(button => {
        button.addEventListener('click', async function() {
            const orderId = this.dataset.orderDetail;
            await loadOrderDetail(orderId);
        });
    });
}

// Sipariş detaylarını yükle
async function loadOrderDetail(orderId) {
    const modal = document.getElementById('orderDetailModal');
    const modalBody = modal.querySelector('.modal-body');
    
    try {
        modalBody.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
        
        const response = await fetch(`/api/siparis/${orderId}/detay`);
        const data = await response.json();
        
        if (data.success) {
            modalBody.innerHTML = data.html;
            
            // Modal içindeki tarihleri ve fiyatları formatla
            formatDates(modalBody);
            formatPrices(modalBody);
            
            // Modal'ı göster
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        } else {
            throw new Error(data.message || 'Sipariş detayları yüklenemedi');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Tarihleri formatla
function formatDates(container = document) {
    container.querySelectorAll('.format-date').forEach(element => {
        const date = new Date(element.textContent);
        element.textContent = new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    });
}

// Fiyatları formatla
function formatPrices(container = document) {
    container.querySelectorAll('.format-price').forEach(element => {
        const price = parseFloat(element.textContent);
        element.textContent = new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price);
    });
}

// Sonuç sayısını güncelle
function updateResultCount(total) {
    const countElement = document.querySelector('.result-count');
    if (countElement) {
        countElement.textContent = `${total} sipariş bulundu`;
    }
}

// Sipariş durumu badge'ini güncelle
function updateOrderStatus(orderId, status) {
    const statusBadge = document.querySelector(`[data-order-status="${orderId}"]`);
    if (statusBadge) {
        const statusClasses = {
            'beklemede': 'bg-warning',
            'onaylandı': 'bg-info',
            'kargoda': 'bg-primary',
            'tamamlandı': 'bg-success',
            'iptal': 'bg-danger'
        };

        // Eski sınıfları kaldır
        Object.values(statusClasses).forEach(cls => {
            statusBadge.classList.remove(cls);
        });

        // Yeni sınıfı ekle
        statusBadge.classList.add(statusClasses[status]);
        statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
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
