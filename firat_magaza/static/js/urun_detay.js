// Ürün Detay Sayfası JavaScript İşlevleri

document.addEventListener('DOMContentLoaded', function() {
    // Miktar kontrolü
    const quantityInput = document.querySelector('input[name="miktar"]');
    if (quantityInput) {
        initQuantityControl(quantityInput);
    }

    // Sepete ekle formu
    const addToCartForm = document.querySelector('form[action*="sepete-ekle"]');
    if (addToCartForm) {
        initAddToCartForm(addToCartForm);
    }

    // İndirim hesaplama
    updateDiscountedPrice();
});

// Miktar kontrolü başlatma
function initQuantityControl(input) {
    const max = parseInt(input.getAttribute('max'));
    const min = parseInt(input.getAttribute('min'));

    // Miktar artırma/azaltma butonları
    const decreaseBtn = document.createElement('button');
    decreaseBtn.type = 'button';
    decreaseBtn.className = 'btn btn-outline-secondary';
    decreaseBtn.innerHTML = '<i class="fas fa-minus"></i>';
    
    const increaseBtn = document.createElement('button');
    increaseBtn.type = 'button';
    increaseBtn.className = 'btn btn-outline-secondary';
    increaseBtn.innerHTML = '<i class="fas fa-plus"></i>';

    // Input grubunu oluştur
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group';
    input.parentNode.replaceChild(inputGroup, input);
    
    inputGroup.appendChild(decreaseBtn);
    inputGroup.appendChild(input);
    inputGroup.appendChild(increaseBtn);

    // Event listeners
    decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value);
        if (currentValue > min) {
            input.value = currentValue - 1;
            updateTotalPrice();
        }
    });

    increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(input.value);
        if (currentValue < max) {
            input.value = currentValue + 1;
            updateTotalPrice();
        }
    });

    input.addEventListener('change', function() {
        let value = parseInt(this.value);
        
        if (isNaN(value) || value < min) {
            value = min;
        } else if (value > max) {
            value = max;
        }
        
        this.value = value;
        updateTotalPrice();
    });

    // Başlangıç fiyatını güncelle
    updateTotalPrice();
}

// Sepete ekleme formu başlatma
function initAddToCartForm(form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        try {
            // Butonu loading durumuna getir
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Ekleniyor...';

            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            const data = await response.json();

            if (data.success) {
                showToast('Ürün sepete eklendi', 'success');
                updateCartCount(data.cart_count);
                
                // Mini sepet önizlemesini güncelle
                if (data.cart_preview) {
                    updateCartPreview(data.cart_preview);
                }
            } else {
                throw new Error(data.message || 'Bir hata oluştu');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            // Butonu eski haline getir
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
}

// Toplam fiyat güncelleme
function updateTotalPrice() {
    const quantity = parseInt(document.querySelector('input[name="miktar"]').value);
    const basePrice = parseFloat(document.getElementById('basePrice').dataset.price);
    const totalPriceElement = document.getElementById('totalPrice');
    
    if (totalPriceElement) {
        const total = quantity * basePrice;
        totalPriceElement.textContent = formatPrice(total);
        updateDiscountedPrice(total);
    }
}

// İndirimli fiyat güncelleme
function updateDiscountedPrice(total = null) {
    const discountElement = document.getElementById('discountRate');
    const discountedPriceElement = document.getElementById('discountedPrice');
    
    if (discountElement && discountedPriceElement) {
        const discountRate = parseFloat(discountElement.dataset.rate);
        if (!total) {
            total = parseFloat(document.getElementById('totalPrice').dataset.price);
        }
        
        if (discountRate > 0) {
            const discountedPrice = total * (1 - discountRate);
            discountedPriceElement.textContent = formatPrice(discountedPrice);
            discountedPriceElement.parentElement.classList.remove('d-none');
        }
    }
}

// Para formatı
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}

// Sepet sayacını güncelle
function updateCartCount(count) {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = count;
        if (count > 0) {
            cartCountElement.classList.remove('d-none');
        } else {
            cartCountElement.classList.add('d-none');
        }
    }
}

// Mini sepet önizlemesini güncelle
function updateCartPreview(html) {
    const cartPreview = document.querySelector('.cart-preview');
    if (cartPreview) {
        cartPreview.innerHTML = html;
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
