const products = [
    {
        id: 1,
        title: "Ноутбук Apple MacBook Pro 16",
        price: 99999,
        category: "laptops",
        image: "https://images.pexels.com/photos/7624782/pexels-photo-7624782.jpeg"
    },
    {
        id: 2,
        title: "Смартфон Samsung Galaxy S24",
        price: 39999,
        category: "smartphones",
        image: "https://images.pexels.com/photos/30466739/pexels-photo-30466739.jpeg"
    },
    {
        id: 3,
        title: "Планшет Apple iPad Air",
        price: 28999,
        category: "tablets",
        image: "https://images.pexels.com/photos/1334598/pexels-photo-1334598.jpeg"
    },
    {
        id: 4,
        title: "Навушники Sony WH-1000XM5",
        price: 15499,
        category: "audio",
        image: "https://images.pexels.com/photos/5382359/pexels-photo-5382359.jpeg"
    }
];

function fetchProducts() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(products);
        }, 1500);
    });
}

async function initShop() {
    const loader = document.getElementById("loader");
    const container = document.querySelector(".products-grid");

    loader.classList.remove("hidden");
    container.innerHTML = "";

    try {
        const data = await fetchProducts();
        loader.classList.add("hidden");

        const htmlString = data
            .map(
                (product) => `
                <article class="product-card">
                    <img src="${product.image}" alt="${product.title}">
                    <h3>${product.title}</h3>
                    <p class="price">${product.price} грн</p>
                    <button class="btn btn-buy" data-id="${product.id}">Купити</button>
                </article>
            `
            )
            .join("");

        container.innerHTML = htmlString;
    } catch (error) {
        loader.classList.add("hidden");
        container.innerHTML = `<p class="error">Помилка завантаження: ${error.message}</p>`;
    }
}

initShop();