// ==========================================
// 1. ГЛОБАЛЬНИЙ ОБ'ЄКТ СТАНУ ТА URL API
// ==========================================
const catalogState = {
  q: '',
  category: 'all',
  sort: 'default',
  price: 400,
  page: 1,
  perPage: 6 
};

function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);

  catalogState.q = params.get('q') || '';
  catalogState.category = params.get('category') || 'all';
  catalogState.sort = params.get('sort') || 'default';
  catalogState.price = parseInt(params.get('price'), 10) || 400;
  catalogState.page = parseInt(params.get('page'), 10) || 1;
}

function updateURL(isReplace = false) {
  const params = new URLSearchParams();

  if (catalogState.q) params.set('q', catalogState.q);
  if (catalogState.category !== 'all') params.set('category', catalogState.category);
  if (catalogState.sort !== 'default') params.set('sort', catalogState.sort);
  if (catalogState.price < 400) params.set('price', catalogState.price);
  if (catalogState.page > 1) params.set('page', catalogState.page);

  const newQuery = params.toString();
  const newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '');

  if (isReplace) {
    history.replaceState(catalogState, '', newUrl);
  } else {
    history.pushState(catalogState, '', newUrl);
  }
}

function syncControlsWithState() {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortSelect');
  const priceRange = document.getElementById('priceRange');
  const priceLimitVal = document.getElementById('priceLimitVal');

  if (searchInput) searchInput.value = catalogState.q;
  if (categoryFilter) categoryFilter.value = catalogState.category;
  if (sortSelect) sortSelect.value = catalogState.sort;
  if (priceRange) priceRange.value = catalogState.price;
  if (priceLimitVal) priceLimitVal.textContent = catalogState.price;
}

// ==========================================
// 2. ДАНІ ТОВАРІВ МАЗИНУ
// ==========================================
const techStoreProducts = [
    { id: 1, title: "Відеокарта Inno3D iChill X4 RTX 3070 8GB", price: 360.00, category: "Комплектуючі", image: "https://content.rozetka.com.ua/goods/images/big/246319969.jpg" },
    { id: 2, title: "Процесор AMD Ryzen 5 7500F AM5", price: 185.50, category: "Комплектуючі", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpRjjPrIAdK_mvILV29l69D2WN_scykkXgP-E-XXMiGYX3gnLYiBTEbR4m&s=10" },
    { id: 3, title: "Оперативна пам'ять Kingston DDR5 32GB 5600MHz", price: 115.00, category: "Комплектуючі", image: "https://content.rozetka.com.ua/goods/images/big/268155791.jpg" },
    { id: 4, title: "SSD накопичувач Kingston KC3000 1TB M.2 NVMe", price: 95.00, category: "Комплектуючі", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH1ptw5pICsUyOuFiv-JsNHA6tGVk9x6J_CWp9Ci8glQ&s" },
    { id: 5, title: "Монітор 27\" Samsung Odyssey G5 165Hz 2K", price: 290.00, category: "Периферія", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSahCMs4GaGBuCLFPIo7Oj2UXE98SNgiI4AHS58n9OBDg&s" },
    { id: 6, title: "Ігрова гарнітура SteelSeries Arctis 3 Black", price: 75.00, category: "Периферія", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0y80ed4zBQVGDs2EFI9fSbClyZikPOeMYPzk8EqBoyA&s" },
    { id: 7, title: "Материнська плата MSI B650 Tomahawk WIFI", price: 210.00, category: "Комплектуючі", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRpAnNEFrYvfxERO7XvTrAFrk1GZ_YXywUW6Z_nIbuZQ&s=10" },
    { id: 8, title: "Блок живлення DeepCool PK750D 750W 80+", price: 85.00, category: "Комплектуючі", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxw6anM-afgdFZeumt77K_i0dmTJ65ECTavrm6tJEMwXZlU1uzIkhMsGsl&s=10" },
    { id: 9, title: "Бездротова миша Logitech G Pro X Superlight", price: 130.00, category: "Периферія", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZUvEgUxh1IrNKMR98ayhiqk-83B5GOui9jN_oHoZGno2iyI5cr6YV2ZUK&s=10" },
    { id: 10, title: "Ігрова механічна клавіатура Keychron K8 Pro", price: 110.00, category: "Периферія", image: "https://i.moyo.ua/img/products/5478/23_1500.jpg" },
    { id: 11, title: "Портативна колонка JBL Charge 5 Black", price: 160.00, category: "Гаджети", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9Xe_AIwuIjpyrav9ffuP42cGntPGffat2mM0bF57X_Ysvl7odgkVs70Lj&s=10" },
    { id: 12, title: "Смарт-годинник Garmin Forerunner 265", price: 350.00, category: "Гаджети", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2_FsxyokBIa08_fE580QsiT9SgbNBBT5qf5Z6A_6ARQ&s" }
];

let globalStoreProducts = techStoreProducts;

// ==========================================
// 3. КЕРУВАННЯ ТЕМОЮ ТА LOCAL STORAGE
// ==========================================
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

// ==========================================
// 4. КОШИК ТА ОБРАНЕ (FAVORITES)
// ==========================================
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
                <button type="button" class="qty-btn" onclick="window.changeCartQuantity(${item.id}, -1)">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button type="button" class="qty-btn" onclick="window.changeCartQuantity(${item.id}, 1)">+</button>
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
                    <span>${item.title.substring(0, 22)}...</span>
                    <button type="button" class="btn-remove-fav" data-id="${item.id}">×</button>
                </div>
            `).join('')}
        </div>
    `;
}

// ==========================================
// 5. ВІДОБРАЖЕННЯ ТОВАРІВ ТА ПАГІНАЦІЯ
// ==========================================
function renderProducts(products) {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p class="no-products" style="grid-column: 1/-1; text-align: center; padding: 20px;">Товарів за вашими критеріями не знайдено</p>';
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
                <button type="button" class="btn btn-primary btn-buy" data-id="${product.id}">Купити</button>
            </div>
        </article>
    `).join('');
}

function renderPagination(totalItems, totalPages) {
    const catalogInfo = document.getElementById('catalogInfo');
    const paginationContainer = document.getElementById('paginationContainer');

    if (!catalogInfo || !paginationContainer) return;

    if (totalItems === 0) {
        catalogInfo.textContent = 'Нічого не знайдено';
        paginationContainer.innerHTML = '';
        return;
    }

    const startNum = (catalogState.page - 1) * catalogState.perPage + 1;
    const endNum = Math.min(catalogState.page * catalogState.perPage, totalItems);
    catalogInfo.textContent = `Показано ${startNum}–${endNum} з ${totalItems} товарів`;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = `<button type="button" class="pagination-btn" ${catalogState.page === 1 ? 'disabled' : ''} onclick="changePage(${catalogState.page - 1})">← Назад</button>`;

    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === catalogState.page ? 'active' : '';
        html += `<button type="button" class="pagination-btn ${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `<button type="button" class="pagination-btn" ${catalogState.page === totalPages ? 'disabled' : ''} onclick="changePage(${catalogState.page + 1})">Вперед →</button>`;

    paginationContainer.innerHTML = html;
}

window.changePage = function(newPage) {
    catalogState.page = newPage;
    updateURL(false);
    applyAllFilters();
};

// ==========================================
// 6. ГОЛОВНИЙ КОНВЕЄР ФІЛЬТРАЦІЇ КАТАЛОГУ
// ==========================================
function applyAllFilters() {
    const priceLimitVal = document.getElementById('priceLimitVal');
    if (priceLimitVal) priceLimitVal.textContent = catalogState.price;

    // 1. Фільтрація
    let filtered = globalStoreProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(catalogState.q.toLowerCase());
        const matchesCategory = catalogState.category === 'all' || product.category === catalogState.category;
        const matchesPrice = product.price <= catalogState.price;
        return matchesSearch && matchesCategory && matchesPrice;
    });

    // 2. Сортування
    if (catalogState.sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (catalogState.sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (catalogState.sort === 'title_asc') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (catalogState.sort === 'rating_desc') {
        filtered.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
    }

    // 3. Пагінація (slice)
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / catalogState.perPage) || 1;

    if (catalogState.page > totalPages) {
        catalogState.page = 1;
    }

    const start = (catalogState.page - 1) * catalogState.perPage;
    const end = start + catalogState.perPage;
    const paginatedProducts = filtered.slice(start, end);

    const searchResultCount = document.getElementById('searchResultCount');
    if (searchResultCount) {
        searchResultCount.textContent = `Знайдено: ${totalItems}`;
    }

    renderProducts(paginatedProducts);
    renderPagination(totalItems, totalPages);
}

// ==========================================
// 7. СЛУХАЧІ ПОДІЙ ЕЛЕМЕНТІВ КЕРУВАННЯ
// ==========================================
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const priceRange = document.getElementById('priceRange');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        catalogState.q = e.target.value.trim();
        catalogState.page = 1;
        updateURL(true);
        applyAllFilters();
    });
}

if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
        catalogState.category = e.target.value;
        catalogState.page = 1;
        updateURL(false);
        applyAllFilters();
    });
}

if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        catalogState.sort = e.target.value;
        catalogState.page = 1;
        updateURL(false);
        applyAllFilters();
    });
}

if (priceRange) {
    priceRange.addEventListener('input', (e) => {
        catalogState.price = Number(e.target.value);
        catalogState.page = 1;
        updateURL(true);
        applyAllFilters();
    });
}

const resetFiltersBtn = document.getElementById('resetFiltersBtn');
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
        catalogState.q = '';
        catalogState.category = 'all';
        catalogState.sort = 'default';
        catalogState.price = 400;
        catalogState.page = 1;

        syncControlsWithState();
        updateURL(false);
        applyAllFilters();
    });
}

const shareLinkBtn = document.getElementById('shareLinkBtn');
if (shareLinkBtn) {
    shareLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert('Посилання на поточний фільтр скопійовано!'))
            .catch(() => alert('Помилка копіювання'));
    });
}

// Drag & Drop і покупка товарів
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

// Модальне вікно кошика
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

// Форма оформлення замовлення
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

// Синхронізація між вкладками та кнопками «Назад / Вперед»
window.addEventListener('popstate', () => {
    loadStateFromURL();
    syncControlsWithState();
    applyAllFilters();
});

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

// Навігація стрілками клавіатури
document.addEventListener('keydown', (event) => {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT' || activeElement.tagName === 'TEXTAREA';

    if (isInputFocused) return;

    if (event.key === 'ArrowLeft' && catalogState.page > 1) {
        changePage(catalogState.page - 1);
    } else if (event.key === 'ArrowRight') {
        const totalPages = Math.ceil(globalStoreProducts.length / catalogState.perPage);
        if (catalogState.page < totalPages) {
            changePage(catalogState.page + 1);
        }
    }
});

// ==========================================
// 8. ПЕРВИННИЙ ЗАПУСК
// ==========================================
loadStateFromURL();
syncControlsWithState();
applyAllFilters();
updateCartSummary();
renderFavoritesZone();
restoreOrderFormDraft();