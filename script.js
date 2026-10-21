
"use strict";

/* =========================================
   C3 BITES - WEBSITE JAVASCRIPT
========================================= */

/*
  IMPORTANT:
  Verify the restaurant's WhatsApp number before publishing.
  Use country code 91 and digits only.
*/
const RESTAURANT_WHATSAPP = "917551193400";

/*
  Replace this with the restaurant's REAL UPI ID.
  Example format: restaurant@bank
*/
const RESTAURANT_UPI_ID = "YOUR_UPI_ID_HERE";
const RESTAURANT_UPI_NAME = "C3 Bites";

/* All menu items and prices are sample values. */
const products = {
  burger: {
    id: "burger",
    name: "Classic Burger",
    price: 99
  },
  pizza: {
    id: "pizza",
    name: "Cheese Pizza",
    price: 149
  },
  fries: {
    id: "fries",
    name: "Crispy Fries",
    price: 79
  },
  sandwich: {
    id: "sandwich",
    name: "Grilled Sandwich",
    price: 89
  }
};

/* Store selected products and their quantities. */
const cart = new Map();

/* Select HTML elements. */
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const subtotalElement = document.getElementById("subtotal");
const totalElement = document.getElementById("total");
const qrAmount = document.getElementById("qrAmount");
const qrContainer = document.getElementById("qrContainer");
const toast = document.getElementById("toast");

let toastTimer;

/* Format amounts in Indian Rupees. */
function rupees(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

/* Show a small notification on the screen. */
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* Calculate the total number of food items. */
function getItemCount() {
  let count = 0;

  cart.forEach((item) => {
    count += item.quantity;
  });

  return count;
}

/* Calculate the total food bill. */
function getTotal() {
  let amount = 0;

  cart.forEach((item) => {
    amount += item.price * item.quantity;
  });

  return amount;
}

/* Add an item to the cart. */
function addToCart(id) {
  const product = products[id];

  if (!product) return;

  if (cart.has(id)) {
    cart.get(id).quantity += 1;
  } else {
    cart.set(id, {
      ...product,
      quantity: 1
    });
  }

  renderCart();

  showToast(product.name + " added to cart!");
}

/* Increase or decrease quantity. */
function updateQuantity(id, change) {
  const item = cart.get(id);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart.delete(id);
  }

  renderCart();
}

/* Remove an entire product from the cart. */
function removeFromCart(id) {
  const item = cart.get(id);

  if (!item) return;

  cart.delete(id);

  renderCart();

  showToast(item.name + " removed from cart.");
}

/* Display the cart and update the total bill. */
function renderCart() {
  const count = getItemCount();
  const amount = getTotal();

  cartCount.textContent = count;
  subtotalElement.textContent = rupees(amount);
  totalElement.textContent = rupees(amount);
  qrAmount.textContent = rupees(amount);

  if (cart.size === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <span>🛍️</span>
        <h3>Your cart is empty</h3>
        <p>Add your favourite food from the menu.</p>
        <a href="#menu" class="text-link">Browse menu →</a>
      </div>
    `;

    return;
  }

  cartItems.innerHTML = "";

  cart.forEach((item) => {
    const article = document.createElement("article");

    article.className = "cart-item";

    article.innerHTML = `
      <div>
        <h3>${item.name}</h3>
        <p>
          ${rupees(item.price)} each ·
          ${rupees(item.price * item.quantity)} total
        </p>
      </div>

      <div class="quantity-control">
        <button
          type="button"
          data-action="decrease"
          data-id="${item.id}"
          aria-label="Decrease quantity"
        >−</button>

        <strong>${item.quantity}</strong>

        <button
          type="button"
          data-action="increase"
          data-id="${item.id}"
          aria-label="Increase quantity"
        >+</button>
      </div>

      <button
        class="remove-item"
        type="button"
        data-action="remove"
        data-id="${item.id}"
      >Remove</button>
    `;

    cartItems.appendChild(article);
  });
}

/* Build the complete WhatsApp order message. */
function buildOrderMessage() {
  const name = document
    .getElementById("customerName")
    .value.trim();

  const address = document
    .getElementById("deliveryAddress")
    .value.trim();

  const message = [
    "Hello C3 Bites! I would like to place an order:",
    ""
  ];

  cart.forEach((item) => {
    message.push(
      `${item.name} x ${item.quantity} = ${
        rupees(item.price * item.quantity)
      }`
    );
  });

  message.push("");
  message.push("Food Total: " + rupees(getTotal()));

  if (name) {
    message.push("Customer Name: " + name);
  }

  if (address) {
    message.push("Delivery Address: " + address);
  }

  message.push("");
  message.push(
    "Please confirm item availability, delivery charges " +
    "and the final payable amount. Thank you!"
  );

  return message.join("\n");
}

/* Open WhatsApp with the prepared order. */
function orderOnWhatsApp() {
  if (cart.size === 0) {
    showToast("Please add food items to your cart first.");

    document.getElementById("menu").scrollIntoView({
      behavior: "smooth"
    });

    return;
  }

  const phone = RESTAURANT_WHATSAPP.replace(/\D/g, "");

  if (phone.length < 10) {
    showToast("Please configure the restaurant WhatsApp number.");
    return;
  }

  const message = encodeURIComponent(buildOrderMessage());

  const whatsappURL =
    "https://wa.me/" + phone + "?text=" + message;

  window.open(
    whatsappURL,
    "_blank",
    "noopener,noreferrer"
  );
}

/* Check whether a real UPI ID has been configured. */
function isValidUPIConfigured() {
  const upi = RESTAURANT_UPI_ID.trim();

  return (
    upi !== "" &&
    !upi.includes("YOUR_UPI_ID") &&
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(upi)
  );
}

/* Create the payment link using the current cart amount. */
function createUPILink() {
  const params = new URLSearchParams({
    pa: RESTAURANT_UPI_ID,
    pn: RESTAURANT_UPI_NAME,
    am: getTotal().toFixed(2),
    cu: "INR",
    tn: "C3 Bites food order"
  });

  return "upi://pay?" + params.toString();
}

/* Display a QR code once the real UPI ID is configured. */
function updateQRCode() {
  if (!isValidUPIConfigured()) {
    qrContainer.innerHTML = `
      <div class="qr-placeholder">UPI</div>
      <strong>QR code will appear here</strong>
      <small>Configure the real UPI ID in script.js</small>
    `;

    return;
  }

  const paymentLink = encodeURIComponent(createUPILink());

  /*
    This QR image uses an external QR service.
    Internet access is needed to load the QR image.
  */
  const qrURL =
    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=240x240&data=" + paymentLink;

  qrContainer.innerHTML = `
    <img src="${qrURL}" alt="C3 Bites UPI payment QR code">
    <strong>Scan using a UPI app</strong>
    <small>Verify payee name and amount before paying.</small>
  `;
}

/* Add products from the menu cards. */
document.querySelectorAll(".add-btn").forEach((button) => {
  button.addEventListener("click", () => {
    addToCart(button.dataset.id);
  });
});

/* Handle cart quantity buttons and remove buttons. */
cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "increase") {
    updateQuantity(id, 1);
  }

  if (action === "decrease") {
    updateQuantity(id, -1);
  }

  if (action === "remove") {
    removeFromCart(id);
  }
});

/* Checkout button. */
document
  .getElementById("checkoutBtn")
  .addEventListener("click", orderOnWhatsApp);

/* Navbar WhatsApp order button. */
document
  .getElementById("navOrder")
  .addEventListener("click", orderOnWhatsApp);

/* UPI payment buttons. */
document.querySelectorAll(".payment-btn").forEach((button) => {
  button.addEventListener("click", () => {
    if (cart.size === 0) {
      showToast("Add items to your cart before paying.");
      document.getElementById("menu").scrollIntoView({
        behavior: "smooth"
      });

      return;
    }

    if (!isValidUPIConfigured()) {
      showToast("Restaurant UPI ID has not been configured.");
      return;
    }

    /*
      A UPI intent asks the device to open a compatible
      payment app. It does not guarantee a specific app opens.
    */
    window.location.href = createUPILink();
  });
});

/* Mobile hamburger menu. */
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  hamburger.setAttribute("aria-expanded", String(isOpen));
  hamburger.textContent = isOpen ? "✕" : "☰";
});

/* Close the mobile menu after selecting a navigation link. */
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.textContent = "☰";
  });
});

/* Automatically show the current year in the footer. */
document.getElementById("year").textContent =
  new Date().getFullYear();

/* Initial page setup. */
renderCart();
updateQRCode();
