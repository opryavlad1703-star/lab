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
    const product = globalStoreProducts.find(p => p.id === productId);
    if (!product) return;

    const cartItem = cart.find(item => item.id === productId);
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
            <article class="product-card">
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p class="price">$${product.price}</p>
                <button class="btn btn-buy" onclick="window.addToCart(${product.id})">Купити</button>
            </article>
        `).join("");

        container.innerHTML = htmlString;
    } catch (error) {
        loader.classList.add("hidden");
        container.innerHTML = `<p class="error">Помилка завантаження: ${error.message}</p>`;
    }
}

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