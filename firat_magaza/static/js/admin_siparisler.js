// Admin Siparişler Sayfası JavaScript İşlevleri

document.addEventListener('DOMContentLoaded', function() {
    // Event listener'ları başlat
    initEventListeners();
    
    // Form submit olayını yakala
    initFormHandling();
    
    // Tarih ve para formatını uygula
    formatDates();
    formatPrices();
});

// Event listener'ları başlat
function initEventListeners() {
    // Export butonları
    document.querySelectorAll('[data-export-type]').forEach(button => {
        button.addEventListener('click', function() {
            exportOrders(this.dataset.exportType);
        });
    });

    // Yazdır butonu
    document.querySelector('[data-action="print"]').addEventListener('click', () => {
        window.print();
    });

    // Sipariş detay butonları
    document.querySelectorAll('[data-action="show-details"]').forEach(button => {
        button.addEventListener('click', function() {
            showOrderDetails(this.dataset.orderId);
        });
    });

    // Sipariş iptal butonları
    document.querySelectorAll('[data-action="cancel-order"]').forEach(button => {
        button.addEventListener('click', function() {
            cancelOrder(this.dataset.orderId);
        });
    });

    // Durum değişikliği
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', function() {
            updateOrderStatus(this.dataset.orderId, this.value);
        });
    });

    // Toplu işlem butonları
    document.querySelectorAll('[data-bulk-action]').forEach(button => {
        button.addEventListener('click', function() {
            bulkUpdateStatus(this.dataset.bulkAction);
        });
    });

    // Toplu seçim checkbox'ı
    const bulkSelectAll = document.querySelector('.bulk-select-all');
    if (bulkSelectAll) {
        bulkSelectAll.addEventListener('change', function() {
            document.querySelectorAll('.bulk-select-item').forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateBulkActions();
        });
    }

    // Tekil seçim checkbox'ları
    document.querySelectorAll('.bulk-select-item').forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActions);
    });
}

// Form işlemlerini başlat
function initFormHandling() {
    const filterForm = document.getElementById('orderFilterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyFilters();
        });
    }
}

// Filtreleri uygula
async function applyFilters() {
    const form = document.getElementById('orderFilterForm');
    const ordersContainer = document.querySelector('.table-responsive');
    
    if (!form || !ordersContainer) return;

    try {
        ordersContainer.classList.add('loading');
        
        const formData = new FormData(form);
        const params = new URLSearchParams(formData);
        
        const response = await fetch(`/admin/api/siparisler?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            ordersContainer.innerHTML = data.html;
            initEventListeners();
            formatDates();
            formatPrices();
        } else {
            throw new Error(data.message || 'Filtreleme sırasında bir hata oluştu');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        ordersContainer.classList.remove('loading');
    }
}

// Sipariş durumunu güncelle
async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(`/admin/siparis/${orderId}/durum`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ durum: status })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Sipariş durumu güncellendi', 'success');
        } else {
            throw new Error(data.message || 'Güncelleme sırasında bir hata oluştu');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Sipariş detaylarını göster
async function showOrderDetails(orderId) {
    const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    const modalBody = document.querySelector('#orderDetailModal .modal-body');
    
    try {
        modalBody.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';
        modal.show();
        
        const response = await fetch(`/admin/siparis/${orderId}/detay`);
        const data = await response.json();
        
        if (data.success) {
            modalBody.innerHTML = data.html;
            formatDates(modalBody);
            formatPrices(modalBody);
        } else {
            throw new Error(data.message || 'Sipariş detayları yüklenemedi');
        }
    } catch (error) {
        showToast(error.message, 'error');
        modal.hide();
    }
}

// Sipariş iptal et
async function cancelOrder(orderId) {
    if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
        return;
    }

    try {
        const response = await fetch(`/admin/siparis/${orderId}/iptal`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        const data = await response.json();

        if (data.success) {
            showToast('Sipariş iptal edildi', 'success');
            location.reload();
        } else {
            throw new Error(data.message || 'İptal işlemi sırasında bir hata oluştu');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Toplu durum güncelleme
async function bulkUpdateStatus(status) {
    const selectedOrders = Array.from(document.querySelectorAll('.bulk-select-item:checked'))
        .map(checkbox => checkbox.value);

    if (selectedOrders.length === 0) {
        showToast('Lütfen en az bir sipariş seçin', 'warning');
        return;
    }

    try {
        const response = await fetch('/admin/api/siparisler/toplu-guncelle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({
                siparisler: selectedOrders,
                durum: status
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Siparişler güncellendi', 'success');
            location.reload();
        } else {
            throw new Error(data.message || 'Güncelleme sırasında bir hata oluştu');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Toplu işlem araçlarını güncelle
function updateBulkActions() {
    const selectedCount = document.querySelectorAll('.bulk-select-item:checked').length;
    const bulkActions = document.querySelector('.bulk-actions');
    
    if (bulkActions) {
        if (selectedCount > 0) {
            bulkActions.classList.remove('d-none');
            bulkActions.querySelector('.selected-count').textContent = selectedCount;
        } else {
            bulkActions.classList.add('d-none');
        }
    }
}

// Siparişleri dışa aktar
function exportOrders(format) {
    const form = document.getElementById('orderFilterForm');
    const params = new URLSearchParams(new FormData(form));
    params.append('format', format);
    
    window.location.href = `/admin/api/siparisler/export?${params.toString()}`;
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
