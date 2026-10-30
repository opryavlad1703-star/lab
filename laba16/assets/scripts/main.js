let globalStoreProducts = [];

const THEME_STORAGE_KEY = 'techshop_theme';
const CART_STORAGE_KEY = 'techshop_cart';
const FAVORITES_STORAGE_KEY = 'techshop_favorites';
const DRAFT_ORDER_KEY = 'techshop_order_draft';

function applyTheme(themeName) {
    const themeIcon = document.querySelector('.theme-icon');
    const themeText = document.querySelector('.theme-text');

    if (themeName === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Світла тема';
    } else {
        document.body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Темна тема';
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
    const rawData = localStorage.getItem(CART_STORAGE_KEY);
    if (!rawData) {
        return [];
    }
    try {
        const parsedCart = JSON.parse(rawData);
        if (Array.isArray(parsedCart)) {
            return parsedCart;
        }
        return [];
    } catch (error) {
        console.error('Помилка парсингу кошика з localStorage:', error);
        localStorage.removeItem(CART_STORAGE_KEY);
        return [];
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('Помилка збереження кошика у Web Storage:', error);
    }
}

let cart = loadCartFromStorage();

function loadFavoritesFromStorage() {
    const rawData = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!rawData) return [];
    try {
        const parsed = JSON.parse(rawData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Помилка завантаження Favorites:', error);
        return [];
    }
}

function saveFavoritesToStorage() {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteProductIds));
}

let favoriteProductIds = loadFavoritesFromStorage();

async function fetchProducts() {
    try {
        const response = await fetch("https://fakestoreapi.com/products?limit=8");
        if (!response.ok) {
            throw new Error(`HTTP помилка: ${response.status}`);
        }
        const realProducts = await response.json();
        return realProducts;
    } catch (error) {
        throw error;
    }
}

function renderProducts(products) {
    const container = document.querySelector('.products-grid');
    if (!products || products.length === 0) {
        container.innerHTML = '<p class="no-products">Товарів не знайдено</p>';
        return;
    }
    container.innerHTML = products.map(product => `
        <article class="product-card" draggable="true" data-id="${product.id}">
            <img src="${product.image}" alt="${product.title}" draggable="false">
            <h3>${product.title}</h3>
            <p class="price">$${product.price}</p>
            <button class="btn btn-buy" data-id="${product.id}">Купити</button>
        </article>
    `).join('');
}

function updateCartSummary() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const cartBadge = document.getElementById('cartCountBadge');
    const modalTotalElement = document.getElementById('cartTotalSum');

    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }
    if (modalTotalElement) {
        modalTotalElement.textContent = `${subtotalSum.toFixed(2)} грн`;
    }

    saveCartToStorage();
    return subtotalSum;
}

function renderCartModalItems() {
    const container = document.getElementById("cartItemsContainer");

    if (cart.length === 0) {
        container.innerHTML = "<p>Кошик порожній.</p>";
        updateCartSummary();
        return;
    }

    let html = "";
    cart.forEach(item => {
        html += `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <strong>${item.title}</strong><br>
                    $${item.price} x ${item.quantity}
                </div>
                <div>
                    <button onclick="window.changeCartQuantity(${item.id}, 1)">+</button>
                    <button onclick="window.changeCartQuantity(${item.id}, -1)">-</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
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
    if (typeof renderCartModalItems === 'function') {
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
        favoritesZone.innerHTML = '<p>Перетягніть сюди товари в Улюблене</p>';
        return;
    }

    const favoriteItems = globalStoreProducts.filter(product => favoriteProductIds.includes(product.id));

    favoritesZone.innerHTML = `
        <h4>Обрані товари (${favoriteItems.length})</h4>
        <div class="fav-chips-container">
            ${favoriteItems.map(item => `
                <div class="fav-chip">
                    <span>${item.title.substring(0, 18)}...</span>
                    <button class="btn-remove-fav" data-id="${item.id}">×</button>
                </div>
            `).join('')}
        </div>
    `;
}

async function initShop() {
    const loader = document.getElementById("loader");
    const container = document.querySelector(".products-grid");

    loader.classList.remove("hidden");
    container.innerHTML = "";

    try {
        const data = await fetchProducts();
        globalStoreProducts = data;
        loader.classList.add("hidden");
        renderProducts(data);
        updateCartSummary();
        renderFavoritesZone();
        restoreOrderFormDraft();
    } catch (error) {
        loader.classList.add("hidden");
        container.innerHTML = `<p class="error">Помилка завантаження: ${error.message}</p>`;
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

        if (searchQuery.length > 0) {
            searchResultCount.textContent = `Знайдено товарів: ${matchedProducts.length}`;
        } else {
            searchResultCount.textContent = '';
        }

        renderProducts(matchedProducts);
    });
}

const productsContainer = document.querySelector(".products-grid");

productsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-buy")) {
        const productId = event.target.dataset.id;
        window.addToCart(productId);
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
    if (card) {
        card.classList.remove("dragging");
    }
});

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
    cartOverlay.classList.remove("hidden");
    renderCartModalItems();
}

function closeCartModal() {
    cartOverlay.classList.add("hidden");
}

if (cartButton) cartButton.addEventListener("click", openCartModal);
if (closeBtn) closeBtn.addEventListener("click", closeCartModal);

if (cartOverlay) {
    cartOverlay.addEventListener("click", (event) => {
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
    } catch (error) {
        console.error('Помилка відновлення чернетки замовлення:', error);
    }
}

if (orderForm) {
    orderForm.addEventListener('input', () => {
        saveOrderFormDraft();
    });
}

function validateCheckoutForm(name, phone, email) {
    let isValid = true;

    document.getElementById('nameError').textContent = '';
    document.getElementById('phoneError').textContent = '';
    document.getElementById('emailError').textContent = '';

    const words = name.split(' ').filter(Boolean);
    if (words.length < 2 || name.length < 5) {
        document.getElementById('nameError').textContent = "Введіть повне ім'я та прізвище (щонайменше 2 слова).";
        isValid = false;
    }

    const phonePattern = /^\+?380\d{9}$/;
    if (!phonePattern.test(phone)) {
        document.getElementById('phoneError').textContent = "Введіть коректний номер у форматі +380XXXXXXXXX.";
        isValid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        document.getElementById('emailError').textContent = "Введіть дійсну поштову адресу (наприклад, user@mail.com).";
        isValid = false;
    }

    return isValid;
}

function completeCheckoutProcess(name, phone, email, promo) {
    if (cart.length === 0) {
        alert("Ваш кошик порожній! Спочатку додайте товари до кошика.");
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discountPercent = 0;
    if (promo === 'SALE10') {
        discountPercent = 10;
    }

    const discountAmount = Math.round(subtotal * (discountPercent / 100));
    const finalAmount = Math.max(0, subtotal - discountAmount);

    const orderData = {
        customer: { name, phone, email },
        items: cart.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            cost: Number((item.price * item.quantity).toFixed(2))
        })),
        promoCode: promo || null,
        discountAmount,
        totalToPay: Number(finalAmount.toFixed(2)),
        createdAt: new Date().toISOString()
    };

    console.log("Замовлення сформовано (JSON Payload):", orderData);
    alert(`Дякуємо, ${name}! Замовлення на суму $${finalAmount.toFixed(2)} успішно прийнято.`);

    cart = [];
    saveCartToStorage();
    updateCartSummary();
    orderForm.reset();
    sessionStorage.removeItem(DRAFT_ORDER_KEY);

    if (typeof closeCartModal === 'function') {
        closeCartModal();
    }
}

if (orderForm) {
    orderForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(orderForm);
        const rawName = formData.get('clientName') || '';
        const rawPhone = formData.get('clientPhone') || '';
        const rawEmail = formData.get('clientEmail') || '';
        const rawPromo = formData.get('orderPromo') || '';

        const cleanName = rawName.trim().replace(/\s+/g, ' ');
        const cleanPhone = rawPhone.replaceAll(/[\s\(\)\-]/g, '');
        const cleanEmail = rawEmail.trim().toLowerCase();
        const cleanPromo = rawPromo.trim().toUpperCase();

        const isFormValid = validateCheckoutForm(cleanName, cleanPhone, cleanEmail);
        if (!isFormValid) {
            return;
        }

        completeCheckoutProcess(cleanName, cleanPhone, cleanEmail, cleanPromo);
    });
}

window.addEventListener('storage', (event) => {
    if (event.key === CART_STORAGE_KEY) {
        cart = loadCartFromStorage();
        updateCartSummary();
        if (typeof renderCartModalItems === 'function' && !document.getElementById('cartOverlay').classList.contains('hidden')) {
            renderCartModalItems();
        }
    }

    if (event.key === THEME_STORAGE_KEY) {
        applyTheme(event.newValue || 'light');
    }

    if (event.key === FAVORITES_STORAGE_KEY) {
        favoriteProductIds = loadFavoritesFromStorage();
        renderFavoritesZone();
    }
});

initShop();