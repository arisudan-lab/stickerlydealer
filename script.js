const PRICE = 10;
let products = [];
let cart = [];

// DOM Elements
const grid = document.getElementById("sticker-grid");
const cartBtn = document.getElementById("cart-btn");
const cartCount = document.getElementById("cart-count");
const cartModal = document.getElementById("cart-modal");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const previewModal = document.getElementById("preview-modal");
const previewImg = document.getElementById("preview-img");
const previewTitle = document.getElementById("preview-title");
const previewPrice = document.getElementById("preview-price");
const previewAddBtn = document.getElementById("preview-add-btn");
const closePreview = document.getElementById("close-preview");

// LOAD PRODUCTS
fetch("./products.json")
    .then(r => r.json())
    .then(data => {
        products = data;
        renderProducts();
    })
    .catch(err => console.error("Error loading products. Ensure you are running on a local server.", err));

// RENDER PRODUCTS
function renderProducts() {
    grid.innerHTML = "";
    products.forEach(p => {
        grid.innerHTML += `
    <div class="sticker-card">
        <img src="${p.image}" onclick="openPreview(${p.id})" style="cursor: pointer;">
        <h3>${p.name}</h3>
        <p class="price">₹${PRICE}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
    </div>
    `;
    });
}

// ADD TO CART
function addToCart(id) {
    let item = cart.find(i => i.id === id);
    if (item) item.qty++;
    else cart.push({
        ...products.find(p => p.id === id),
        qty: 1
    });
    updateCount();
}

function updateCount() {
    cartCount.textContent = cart.reduce((a, b) => a + b.qty, 0);
}

// CART MODAL
cartBtn.onclick = () => {
    renderCart();
    cartModal.classList.remove("hidden");
};

// CLOSE MODAL LOGIC

// 1. Close when clicking the "X"
document.getElementById("close-modal-x").onclick = () => {
    cartModal.classList.add("hidden");
};

// 2. Close when clicking outside the modal box
cartModal.onclick = (event) => {
    // If the element clicked IS the dark overlay (and not the white box inside)
    if (event.target === cartModal) {
        cartModal.classList.add("hidden");
    }
};

// RENDER CART 
function renderCart() {
    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p style='text-align:center; color:#888;'>Cart is empty</p>";
        cartTotal.textContent = "Total: ₹0";
        return;
    }

    cart.forEach(i => {
        total += i.qty * PRICE;
        cartItems.innerHTML += `
    <li>
        <div class="cart-item-info">
            <span>${i.name} <small style="color:#666">x${i.qty}</small></span>
        </div>
        <div class="cart-item-actions">
            <strong>₹${i.qty * PRICE}</strong>
            <button class="remove-btn" onclick="removeFromCart(${i.id})" title="Remove Item">×</button>
        </div>
    </li>
    `;
    });

    cartTotal.textContent = `Total: ₹${total}`;
}

// REMOVE SINGLE ITEM 
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);

    updateCount();
    renderCart();
}


document.getElementById("clear-cart-btn").onclick = () => {
    if (confirm("Are you sure you want to empty the cart?")) {
        cart = [];
        updateCount();
        renderCart();
    }
};

// SHARE CART AS LINK
document.getElementById("whatsapp-btn").onclick = () => {
    if (!cart.length) return alert("Cart empty");
    const data = btoa(JSON.stringify(cart));
    const link = `${window.location.origin}/cart.html?c=${data}`; // Adjusted for better relative linking
    window.open(`https://wa.me/?text=${encodeURIComponent(link)}`);
};

// OPEN PREVIEW MODAL
function openPreview(id) {
    const product = products.find(p => p.id === id);

    // Fill data
    previewImg.src = product.image;
    previewTitle.textContent = product.name;
    previewPrice.textContent = PRICE;

    // Set the "Add to Cart" button action inside the modal
    previewAddBtn.onclick = () => {
        addToCart(id);
        previewModal.classList.add("hidden"); // Optional: Close modal after adding
    };

    previewModal.classList.remove("hidden");
}

// CLOSE PREVIEW MODAL
closePreview.onclick = () => {
    previewModal.classList.add("hidden");
};

// Close modal if clicking outside the white box
window.onclick = (event) => {
    if (event.target == previewModal) {
        previewModal.classList.add("hidden");
    }
    if (event.target == cartModal) {
        cartModal.classList.add("hidden");
    }
};
