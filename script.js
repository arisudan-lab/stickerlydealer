let products = [];
let cart = [];

// DOM Elements
const grid = document.getElementById("sticker-grid");
const cartBtn = document.getElementById("cart-btn");
const cartCount = document.getElementById("cart-count");
const cartModal = document.getElementById("cart-modal");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

// Modal/Slider Elements
const slider = document.getElementById("cart-slider");
const nextBtn = document.getElementById("go-to-info-btn");
const backBtn = document.getElementById("back-to-items");
const receiptUrlInput = document.getElementById("receipt-url-display");

// Preview Elements
const previewModal = document.getElementById("preview-modal");
const previewImg = document.getElementById("preview-img");
const previewTitle = document.getElementById("preview-title");
const previewPrice = document.getElementById("preview-price");
const previewAddBtn = document.getElementById("preview-add-btn");

// 1. LOAD PRODUCTS
fetch("./products.json")
    .then(r => r.json())
    .then(data => {
        products = data;
        renderProducts();
    })
    .catch(err => console.error("Error loading products:", err));

// 2. RENDER PRODUCTS
function renderProducts() {
    grid.innerHTML = "";
    products.forEach(p => {
        grid.innerHTML += `
        <div class="sticker-card" onclick="openPreview(${p.id})">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p class="price">₹${p.price}</p> 
            <button onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
        </div>`;
    });
}

// 3. CART LOGIC
function addToCart(id) {
    let item = cart.find(i => i.id === id);
    if (item) item.qty++;
    else {
        const p = products.find(p => p.id === id);
        cart.push({ ...p, qty: 1 });
    }
    updateCount();
}

function updateCount() {
    cartCount.textContent = cart.reduce((a, b) => a + b.qty, 0);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCount();
    renderCart();
}

function renderCart() {
    cartItems.innerHTML = "";
    let total = 0;
    if (cart.length === 0) {
        cartItems.innerHTML = "<p style='text-align:center; color:#888;'>Cart is empty</p>";
        cartTotal.textContent = "Total: ₹0";
        return;
    }
    cart.forEach(i => {
        const itemTotal = i.qty * i.price;
        total += itemTotal;
        cartItems.innerHTML += `
        <li>
            <div class="cart-item-info">
                <span>${i.name} <small style="color:#666">x${i.qty}</small></span>
            </div>
            <div class="cart-item-actions">
                <strong>₹${itemTotal}</strong>
                <button class="remove-btn" onclick="removeFromCart(${i.id})">×</button>
            </div>
        </li>`;
    });
    cartTotal.textContent = `Total: ₹${total}`;
}

// 4. NAVIGATION & SLIDER LOGIC
cartBtn.onclick = () => {
    renderCart();
    slider.classList.remove("slide-active");
    cartModal.classList.remove("hidden");
};

nextBtn.onclick = () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    slider.classList.add("slide-active");
    updateReceiptLink();
};

backBtn.onclick = () => {
    slider.classList.remove("slide-active");
};

// 5. RECEIPT & SHARING LOGIC
// ... [Previous code for Sections 1-4 remains the same] ...

// --- SECTION 5: RECEIPT, VALIDATION & SHARING LOGIC ---

// 1. Select the box we want to lock/unlock
const receiptBox = document.querySelector(".receipt-share-box");

// 2. Lock it by default (Run this immediately)
function lockReceiptBox() {
    receiptBox.style.opacity = "0.5";              // Dim it to look disabled
    receiptBox.style.pointerEvents = "none";       // Make it unclickable (cursor none)
    receiptBox.style.cursor = "not-allowed";
}
lockReceiptBox(); // Call it on load

// 3. Helper: Unlock it
function unlockReceiptBox() {
    receiptBox.style.opacity = "1";
    receiptBox.style.pointerEvents = "auto";
    receiptBox.style.cursor = "default";
}

function updateReceiptLink() {
    // Get values safely
    const name = document.getElementById("customer-name")?.value.trim() || "";
    const phone = document.getElementById("customer-phone")?.value.trim() || "";
    const email = document.getElementById("customer-email")?.value.trim() || "";
    const address = document.getElementById("customer-address")?.value.trim() || "";
    const coupon = document.getElementById("customer-coupon")?.value.trim() || "";

    const cartData = btoa(JSON.stringify(cart));

    // Construct link
    const link = `${window.location.origin}/cart.html?c=${cartData}` +
        `&name=${encodeURIComponent(name || "Customer")}` +
        `&phone=${encodeURIComponent(phone || "Not Provided")}` +
        `&email=${encodeURIComponent(email)}` +
        `&address=${encodeURIComponent(address)}` +
        `&coupon=${encodeURIComponent(coupon)}`;

    if (receiptUrlInput) {
        receiptUrlInput.value = link;
    }
    return link;
}


document.getElementById("place-order-btn").onclick = () => {
    if (cart.length === 0) return alert("Cart is empty!");

    // --- VALIDATION: Make fields important ---
    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const email = document.getElementById("customer-email").value.trim();
    const address = document.getElementById("customer-address").value.trim();
    // Coupon is usually optional, so we skip it in the "Required" check.
    // If you strictly want Coupon mandatory too, add: || !document.getElementById("customer-coupon").value.trim()

    if (!name || !phone || !email || !address) {
        alert("⚠️ Please fill in all required fields (Name, Phone, Email, Address) to place the order.");
        return; // Stop here if validation fails
    }

    // --- IF VALID: Generate Link & Unlock ---
    const freshLink = updateReceiptLink();
    unlockReceiptBox(); // <--- THIS ENABLES THE COPY/SHARE BUTTONS

    alert("🚀 Order Placed Successfully! \nYou can now copy or share the receipt link below.");

    console.log("Admin Payload:", {
        customer: { name, phone, email, address, coupon: document.getElementById("customer-coupon").value },
        items: cart,
        receiptUrl: freshLink
    });
};

document.getElementById("whatsapp-btn").onclick = async () => {
    const link = updateReceiptLink();
    const name = document.getElementById("customer-name").value || "Customer";

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Stikies Order',
                text: `📦 New Order from ${name}\n`,
                url: link
            });
        } catch (err) { console.log("Share cancelled"); }
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(link)}`);
    }
};

document.getElementById("copy-link-btn").onclick = async () => {
    const link = updateReceiptLink();
    try {
        await navigator.clipboard.writeText(link);
        alert("📋 Link copied to clipboard!");
    } catch (err) {
        alert("Failed to copy link.");
    }
};

nextBtn.onclick = () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    slider.classList.add("slide-active");
    lockReceiptBox(); // Reset to locked state every time they enter the info screen
    updateReceiptLink();
};

// 6. MODAL CLOSING LOGIC
document.getElementById("close-modal-x").onclick = () => cartModal.classList.add("hidden");

window.onclick = (event) => {
    if (event.target == cartModal) cartModal.classList.add("hidden");
    if (event.target == previewModal) previewModal.classList.add("hidden");
};

// 7. PREVIEW MODAL
function openPreview(id) {
    const product = products.find(p => p.id === id);
    previewImg.src = product.image;
    previewTitle.textContent = product.name;
    previewPrice.textContent = product.price;
    previewAddBtn.onclick = () => {
        addToCart(id);
        previewModal.classList.add("hidden");
    };
    previewModal.classList.remove("hidden");
}

document.getElementById("close-preview").onclick = () => previewModal.classList.add("hidden");

document.getElementById("clear-cart-btn").onclick = () => {
    if (confirm("Empty cart?")) {
        cart = [];
        updateCount();
        renderCart();
    }
};