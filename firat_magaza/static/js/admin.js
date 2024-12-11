// Admin Panel Genel JavaScript İşlevleri

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle için mobil görünümde
    const sidebarToggle = document.querySelector('[data-bs-toggle="collapse"]');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('show');
        });
    }

    // AJAX istekleri için CSRF token ayarı
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (csrfToken) {
        $.ajaxSetup({
            headers: {
                'X-CSRFToken': csrfToken
            }
        });
    }

    // Genel form doğrulama
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Tablo sıralama
    const sortableTables = document.querySelectorAll('.sortable');
    sortableTables.forEach(table => {
        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const column = this.dataset.sort;
                const order = this.dataset.order === 'asc' ? 'desc' : 'asc';
                sortTable(table, column, order);
                
                // Sıralama ikonlarını güncelle
                headers.forEach(h => h.dataset.order = '');
                this.dataset.order = order;
                
                // İkonları güncelle
                const icon = this.querySelector('i');
                if (icon) {
                    icon.className = `fas fa-sort-${order === 'asc' ? 'up' : 'down'}`;
                }
            });
        });
    });

    // Tablo arama
    const searchInputs = document.querySelectorAll('.table-search');
    searchInputs.forEach(input => {
        input.addEventListener('keyup', function() {
            const table = document.querySelector(this.dataset.table);
            const searchText = this.value.toLowerCase();
            
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchText) ? '' : 'none';
            });
        });
    });

    // Toplu işlem seçimi
    const bulkCheckboxes = document.querySelectorAll('.bulk-select-all');
    bulkCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const table = this.closest('table');
            const checkboxes = table.querySelectorAll('.bulk-select-item');
            checkboxes.forEach(item => {
                item.checked = this.checked;
            });
            updateBulkActionButtons();
        });
    });

    // Tekil seçimleri izle
    document.querySelectorAll('.bulk-select-item').forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActionButtons);
    });

    // Tarih formatlama
    document.querySelectorAll('.format-date').forEach(element => {
        const date = new Date(element.textContent);
        element.textContent = new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    });

    // Para formatlama
    document.querySelectorAll('.format-price').forEach(element => {
        const price = parseFloat(element.textContent);
        element.textContent = new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(price);
    });

    // Tooltip ve Popover'ları etkinleştir
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});

// Yardımcı Fonksiyonlar

// Tablo sıralama fonksiyonu
function sortTable(table, column, order) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.querySelector(`td[data-${column}]`)?.dataset[column] || 
                      a.querySelector(`td:nth-child(${parseInt(column) + 1})`)?.textContent;
        const bValue = b.querySelector(`td[data-${column}]`)?.dataset[column] || 
                      b.querySelector(`td:nth-child(${parseInt(column) + 1})`)?.textContent;
        
        if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    rows.forEach(row => tbody.appendChild(row));
}

// Toplu işlem butonlarını güncelle
function updateBulkActionButtons() {
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

// AJAX isteği gönder
async function sendRequest(url, method = 'GET', data = null) {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
            },
            body: data ? JSON.stringify(data) : null
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Request error:', error);
        showToast('Bir hata oluştu', 'error');
        throw error;
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
