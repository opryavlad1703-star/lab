let globalStoreProducts = [];

const THEME_STORAGE_KEY = 'techshop_theme';
const CART_STORAGE_KEY = 'techshop_cart';
const FAVORITES_STORAGE_KEY = 'techshop_favorites';
const DRAFT_ORDER_KEY = 'techshop_order_draft';

function applyTheme(themeName) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeName === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }
}
initTheme();

const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isCurrentlyDark = document.body.classList.contains('dark-theme');
        const newTheme = isCurrentlyDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    });
}

function loadCartFromStorage() {
    try {
        const rawData = localStorage.getItem(CART_STORAGE_KEY);
        if (!rawData) return [];
        const parsedCart = JSON.parse(rawData);
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return [];
    }
}

function saveCartToStorage() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

let cart = loadCartFromStorage();

function loadFavoritesFromStorage() {
    try {
        const rawData = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!rawData) return [];
        const parsed = JSON.parse(rawData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function saveFavoritesToStorage() {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteProductIds));
}

let favoriteProductIds = loadFavoritesFromStorage();

async function fetchProducts() {
    const response = await fetch("https://fakestoreapi.com/products?limit=12");
    if (!response.ok) {
        throw new Error(`HTTP помилка: ${response.status}`);
    }
    return await response.json();
}

function renderProducts(products) {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Товарів не знайдено</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <article class="product-card" draggable="true" data-id="${product.id}">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.title}" draggable="false">
            </div>
            <div class="product-category">${product.category}</div>
            <h3>${product.title}</h3>
            <div class="product-bottom">
                <span class="price">$${product.price.toFixed(2)}</span>
                <button class="btn btn-primary btn-buy" data-id="${product.id}">Купити</button>
            </div>
        </article>
    `).join('');
}

function updateCartSummary() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const cartBadge = document.getElementById('cartCountBadge');
    const modalTotalElement = document.getElementById('cartTotalSum');

    if (cartBadge) cartBadge.textContent = totalItems;
    if (modalTotalElement) modalTotalElement.textContent = subtotalSum.toFixed(2);

    saveCartToStorage();
}

function renderCartModalItems() {
    const container = document.getElementById("cartItemsContainer");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg" style="text-align:center; color:var(--text-muted);">Кошик порожній.</p>';
        updateCartSummary();
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <div>
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="window.changeCartQuantity(${item.id}, -1)">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="window.changeCartQuantity(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join('');
    
    updateCartSummary();
}

window.addToCart = function(productId) {
    const product = globalStoreProducts.find(p => p.id === Number(productId));
    if (!product) return;

    const cartItem = cart.find(item => item.id === Number(productId));
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartSummary();
    const overlay = document.getElementById('cartOverlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        renderCartModalItems();
    }
};

window.changeCartQuantity = function(productId, delta) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    renderCartModalItems();
    updateCartSummary();
};

function renderFavoritesZone() {
    const favoritesZone = document.getElementById('favoritesZone');
    if (!favoritesZone) return;

    if (favoriteProductIds.length === 0) {
        favoritesZone.innerHTML = `
            <div class="fav-placeholder">
                <span class="fav-icon">❤️</span>
                <p>Перетягніть сюди товари в Улюблене</p>
            </div>
        `;
        return;
    }

    const favoriteItems = globalStoreProducts.filter(product => favoriteProductIds.includes(product.id));

    favoritesZone.innerHTML = `
        <h4 style="margin-top:0; margin-bottom:15px;">Обрані товари (${favoriteItems.length})</h4>
        <div class="fav-chips-container">
            ${favoriteItems.map(item => `
                <div class="fav-chip">
                    <span>${item.title.substring(0, 20)}...</span>
                    <button class="btn-remove-fav" data-id="${item.id}">×</button>
                </div>
            `).join('')}
        </div>
    `;
}

async function initShop() {
    const loader = document.getElementById("loader");
    const container = document.getElementById("products-grid");

    if (loader) loader.classList.remove("hidden");

    try {
        const data = await fetchProducts();
        globalStoreProducts = data;
        if (loader) loader.classList.add("hidden");
        
        renderProducts(data);
        updateCartSummary();
        renderFavoritesZone();
        restoreOrderFormDraft();
    } catch (error) {
        if (loader) loader.classList.add("hidden");
        if (container) container.innerHTML = `<p style="color:red; text-align:center;">Помилка: ${error.message}</p>`;
    }
}

const searchInput = document.getElementById('searchInput');
const searchResultCount = document.getElementById('searchResultCount');

if (searchInput) {
    searchInput.addEventListener('input', (event) => {
        const searchQuery = event.target.value.trim().toLowerCase();
        const matchedProducts = globalStoreProducts.filter(product => {
            return product.title.toLowerCase().includes(searchQuery);
        });

        if (searchResultCount) {
            searchResultCount.textContent = searchQuery.length > 0 ? `Знайдено: ${matchedProducts.length}` : '';
        }
        renderProducts(matchedProducts);
    });
}

const productsContainer = document.getElementById("products-grid");
if (productsContainer) {
    productsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("btn-buy")) {
            window.addToCart(event.target.dataset.id);
        }
    });

    productsContainer.addEventListener("dragstart", (event) => {
        const card = event.target.closest(".product-card");
        if (card) {
            event.dataTransfer.setData("text/plain", card.dataset.id);
            card.classList.add("dragging");
        }
    });

    productsContainer.addEventListener("dragend", (event) => {
        const card = event.target.closest(".product-card");
        if (card) card.classList.remove("dragging");
    });
}

const favoritesZone = document.getElementById("favoritesZone");
if (favoritesZone) {
    favoritesZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        favoritesZone.classList.add("drag-over");
    });

    favoritesZone.addEventListener("dragleave", () => {
        favoritesZone.classList.remove("drag-over");
    });

    favoritesZone.addEventListener("drop", (event) => {
        event.preventDefault();
        favoritesZone.classList.remove("drag-over");
        
        const productId = Number(event.dataTransfer.getData("text/plain"));
        if (productId && !favoriteProductIds.includes(productId)) {
            favoriteProductIds.push(productId);
            saveFavoritesToStorage();
            renderFavoritesZone();
        }
    });

    favoritesZone.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-remove-fav')) {
            const idToRemove = Number(event.target.dataset.id);
            favoriteProductIds = favoriteProductIds.filter(id => id !== idToRemove);
            saveFavoritesToStorage();
            renderFavoritesZone();
        }
    });
}

const cartButton = document.getElementById("openCartBtn");
const cartOverlay = document.getElementById("cartOverlay");
const closeBtn = document.getElementById("closeCartBtn");

function openCartModal() {
    if (cartOverlay) cartOverlay.classList.remove("hidden");
    renderCartModalItems();
}

function closeCartModal() {
    if (cartOverlay) cartOverlay.classList.add("hidden");
}

if (cartButton) cartButton.addEventListener("click", openCartModal);
if (closeBtn) closeBtn.addEventListener("click", closeCartModal);

if (cartOverlay) {
    cartOverlay.addEventListener("mousedown", (event) => {
        if (event.target === cartOverlay) {
            closeCartModal();
        }
    });
}

const orderForm = document.getElementById('checkoutOrderForm');

function saveOrderFormDraft() {
    if (!orderForm) return;
    const draftData = {
        clientName: document.getElementById('clientName')?.value || '',
        clientPhone: document.getElementById('clientPhone')?.value || '',
        clientEmail: document.getElementById('clientEmail')?.value || '',
        orderPromo: document.getElementById('orderPromo')?.value || ''
    };
    sessionStorage.setItem(DRAFT_ORDER_KEY, JSON.stringify(draftData));
}

function restoreOrderFormDraft() {
    const rawDraft = sessionStorage.getItem(DRAFT_ORDER_KEY);
    if (!rawDraft || !orderForm) return;
    try {
        const draft = JSON.parse(rawDraft);
        if (draft.clientName) document.getElementById('clientName').value = draft.clientName;
        if (draft.clientPhone) document.getElementById('clientPhone').value = draft.clientPhone;
        if (draft.clientEmail) document.getElementById('clientEmail').value = draft.clientEmail;
        if (draft.orderPromo) document.getElementById('orderPromo').value = draft.orderPromo;
    } catch (error) {}
}

if (orderForm) {
    orderForm.addEventListener('input', saveOrderFormDraft);
}

function validateCheckoutForm(name, phone, email) {
    let isValid = true;
    document.getElementById('nameError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('emailError').textContent = '';

    const words = name.split(' ').filter(Boolean);
    if (words.length < 2 || name.length < 5) {
        document.getElementById('nameError').textContent = "Введіть повне ім'я та прізвище";
        isValid = false;
    }

    if (!/^\+?380\d{9}$/.test(phone)) {
        document.getElementById('phoneError').textContent = "Формат: +380XXXXXXXXX";
        isValid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('emailError').textContent = "Некоректний email";
        isValid = false;
    }

    return isValid;
}

if (orderForm) {
    orderForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(orderForm);
        const name = formData.get('clientName').trim().replace(/\s+/g, ' ');
        const phone = formData.get('clientPhone').replace(/[\s\(\)\-]/g, '');
        const email = formData.get('clientEmail').trim().toLowerCase();
        const promo = formData.get('orderPromo').trim().toUpperCase();

        if (!validateCheckoutForm(name, phone, email)) return;

        if (cart.length === 0) {
            alert("Кошик порожній!");
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = promo === 'SALE10' ? 10 : 0;
        const total = Math.max(0, subtotal - Math.round(subtotal * (discount / 100)));

        alert(`Дякуємо, ${name}! Замовлення на суму $${total.toFixed(2)} прийнято.`);

        cart = [];
        saveCartToStorage();
        updateCartSummary();
        orderForm.reset();
        sessionStorage.removeItem(DRAFT_ORDER_KEY);
        closeCartModal();
    });
}

window.addEventListener('storage', (event) => {
    if (event.key === CART_STORAGE_KEY) {
        cart = loadCartFromStorage();
        updateCartSummary();
        const overlay = document.getElementById('cartOverlay');
        if (overlay && !overlay.classList.contains('hidden')) renderCartModalItems();
    }
    if (event.key === THEME_STORAGE_KEY) applyTheme(event.newValue || 'light');
    if (event.key === FAVORITES_STORAGE_KEY) {
        favoriteProductIds = loadFavoritesFromStorage();
        renderFavoritesZone();
    }
});

initShop();