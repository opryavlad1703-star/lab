let globalStoreProducts = [];
let cart = [];

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

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
}

function updateUI() {
    const cartCountSpan = document.getElementById("cartCount");
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountSpan) {
        cartCountSpan.textContent = totalCount;
    }
}

function renderCartItems() {
    const container = document.getElementById("cartItemsContainer");
    const totalSumSpan = document.getElementById("cartTotalSum");

    if (cart.length === 0) {
        container.innerHTML = "<p>Кошик порожній.</p>";
        totalSumSpan.textContent = "0";
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
                    <button onclick="window.changeQuantity(${item.id}, 1)">+</button>
                    <button onclick="window.changeQuantity(${item.id}, -1)">-</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    totalSumSpan.textContent = calculateTotal();
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
    updateUI();
};

window.changeQuantity = function(productId, delta) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    renderCartItems();
    updateUI();
};

async function initShop() {
    const loader = document.getElementById("loader");
    const container = document.querySelector(".products-grid");

    loader.classList.remove("hidden");
    container.innerHTML = "";

    try {
        const data = await fetchProducts();
        globalStoreProducts = data;
        loader.classList.add("hidden");

        const htmlString = data.map((product) => `
            <article class="product-card" draggable="true" data-id="${product.id}">
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p class="price">$${product.price}</p>
                <button class="btn btn-buy" data-id="${product.id}">Купити</button>
            </article>
        `).join("");

        container.innerHTML = htmlString;
    } catch (error) {
        loader.classList.add("hidden");
        container.innerHTML = `<p class="error">Помилка завантаження: ${error.message}</p>`;
    }
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
    
    const productId = event.dataTransfer.getData("text/plain");
    const product = globalStoreProducts.find(p => p.id === Number(productId));
    
    if (product) {
        favoritesZone.innerHTML += `<div class="fav-item">${product.title}</div>`;
    }
});

const cartButton = document.getElementById("openCartBtn");
const cartOverlay = document.getElementById("cartOverlay");
const closeBtn = document.getElementById("closeCartBtn");

function openCartModal() {
    cartOverlay.classList.remove("hidden");
    renderCartItems();
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

initShop();