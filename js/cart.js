document.addEventListener('DOMContentLoaded', function () {
  // --- Fade-in Section Animation ---
  const sectionsToAnimate = document.querySelectorAll('.fade-in-section');
  if (sectionsToAnimate) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };
    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    };
    const sectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    sectionsToAnimate.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  // --- CART LOADING & DYNAMIC LOGIC ---

  const cartContainer = document.getElementById('cart-items-container');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const cartHeader = document.getElementById('cart-header');
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  const taxEl = document.getElementById('cart-tax');
  const totalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const cartCountIcon = document.getElementById('cart-item-count');
  const checkoutModal = document.getElementById('checkoutModal');

  const SHIPPING_FEE = 150.0;
  const TAX_RATE = 0.18; // 18% GST

  // Function to format number as Indian Rupees
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Function to update the totals in the summary card
  function updateSummary(subtotal) {
    let totalItems = 0;
    let cart = JSON.parse(localStorage.getItem('neoCart')) || [];
    cart.forEach((item) => {
      totalItems += item.quantity;
    });

    if (subtotal > 0) {
      const tax = subtotal * TAX_RATE;
      const total = subtotal + SHIPPING_FEE + tax;

      subtotalEl.textContent = formatCurrency(subtotal);
      shippingEl.textContent = formatCurrency(SHIPPING_FEE);
      taxEl.textContent = formatCurrency(tax);
      totalEl.textContent = formatCurrency(total);
      checkoutBtn.disabled = false; // Enable checkout
      cartHeader.textContent = `Your Items (${totalItems})`;
      cartCountIcon.textContent = totalItems;
      cartCountIcon.style.display = 'block';
    } else {
      // Reset if cart is empty
      subtotalEl.textContent = formatCurrency(0);
      shippingEl.textContent = formatCurrency(0);
      taxEl.textContent = formatCurrency(0);
      totalEl.textContent = formatCurrency(0);
      checkoutBtn.disabled = true; // Disable checkout
      cartHeader.textContent = 'Your Items (0)';
      cartCountIcon.style.display = 'none';
    }
  }

  // Function to render the cart items on the page
  function renderCart() {
    const cart = JSON.parse(localStorage.getItem('neoCart')) || [];

    // Clear current cart items
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
      // Show "empty" message
      cartContainer.appendChild(emptyCartMessage);
      emptyCartMessage.style.display = 'block';
      updateSummary(0);
      return;
    }

    emptyCartMessage.style.display = 'none';

    let subtotal = 0;

    cart.forEach((item, index) => {
      // item.price is now a number
      const itemLineTotal = item.price * item.quantity;
      subtotal += itemLineTotal;

      // Create the HTML for the cart item
      const itemRow = document.createElement('div');
      itemRow.className = 'row g-3 align-items-center mb-3 pb-3 border-bottom';
      itemRow.innerHTML = `
                        <div class="col-2 col-md-2">
                            <img src="${item.image}" alt="${
        item.title
      }" class="cart-item-img img-fluid">
                        </div>
                        <div class="col-5 col-md-4">
                            <h6 class="text-white mb-0">${item.title}</h6>
                            <p class="small mb-0 d-none d-md-block">${item.specs}</p>
                        </div>
                        <div class="col-2 col-md-2">
                            <input type="number" class="form-control form-control-sm quantity-input" value="${
                              item.quantity
                            }" min="1" data-index="${index}">
                        </div>
                        <div class="col-3 col-md-2">
                            <h6 class="text-white mb-0">${formatCurrency(itemLineTotal)}</h6>
                        </div>
                        <div class="col-12 col-md-2 text-md-end">
                            <button class="btn btn-sm btn-remove" data-index="${index}" title="Remove item">
                                <i class="bi bi-trash-fill"></i> <span class="d-none d-md-inline">Remove</span>
                            </button>
                        </div>
                    `;
      cartContainer.appendChild(itemRow);
    });

    // Add "Remove" button event listeners
    document.querySelectorAll('.btn-remove').forEach((button) => {
      button.addEventListener('click', (e) => {
        const indexToRemove = parseInt(e.currentTarget.getAttribute('data-index'));
        removeItemFromCart(indexToRemove);
      });
    });

    // Add "Quantity" change event listeners
    document.querySelectorAll('.quantity-input').forEach((input) => {
      input.addEventListener('change', (e) => {
        const indexToUpdate = parseInt(e.currentTarget.getAttribute('data-index'));
        const newQuantity = parseInt(e.currentTarget.value);
        if (newQuantity >= 1) {
          updateItemQuantity(indexToUpdate, newQuantity);
        } else {
          // Failsafe, reset to 1 if invalid
          e.currentTarget.value = 1;
          updateItemQuantity(indexToUpdate, 1);
        }
      });
    });

    updateSummary(subtotal);
  }

  // Function to remove an item from the cart
  function removeItemFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('neoCart')) || [];
    cart.splice(index, 1); // Remove the item at the specific index
    localStorage.setItem('neoCart', JSON.stringify(cart));
    renderCart(); // Re-render the cart
  }

  // NEW: Function to update an item's quantity
  function updateItemQuantity(index, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('neoCart')) || [];
    if (cart[index]) {
      cart[index].quantity = newQuantity;
      localStorage.setItem('neoCart', JSON.stringify(cart));
      renderCart(); // Re-render the cart to update totals
    }
  }

  // NEW: Checkout Modal Logic
  if (checkoutModal) {
    checkoutModal.addEventListener('show.bs.modal', function () {
      const cart = JSON.parse(localStorage.getItem('neoCart')) || [];
      const itemList = document.getElementById('checkout-item-list');
      const totalsList = document.getElementById('checkout-totals-list');

      itemList.innerHTML = ''; // Clear previous list
      totalsList.innerHTML = ''; // Clear previous totals

      let subtotal = 0;
      cart.forEach((item) => {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;
        itemList.innerHTML += `
                            <li class="list-group-item bg-transparent text-white d-flex justify-content-between">
                                <span>${item.title} (Qty: ${item.quantity})</span>
                                <strong>${formatCurrency(lineTotal)}</strong>
                            </li>
                        `;
      });

      const tax = subtotal * TAX_RATE;
      const total = subtotal + SHIPPING_FEE + tax;

      totalsList.innerHTML = `
                        <li class="d-flex justify-content-between mb-1"><span>Subtotal:</span> <strong>${formatCurrency(
                          subtotal,
                        )}</strong></li>
                        <li class="d-flex justify-content-between mb-1"><span>Shipping:</span> <strong>${formatCurrency(
                          SHIPPING_FEE,
                        )}</strong></li>
                        <li class="d-flex justify-content-between mb-2"><span>Taxes (18% GST):</span> <strong>${formatCurrency(
                          tax,
                        )}</strong></li>
                        <li class="d-flex justify-content-between h4 text-primary mt-2 pt-2 border-top"><span>Total Due:</span> <strong>${formatCurrency(
                          total,
                        )}</strong></li>
                    `;
    });

    document.getElementById('confirm-payment-btn').addEventListener('click', function () {
      alert('Payment Confirmed! (This is a demo). Your cart will now be cleared.');
      // Clear the cart
      localStorage.removeItem('neoCart');
      // Hide the modal
      bootstrap.Modal.getInstance(checkoutModal).hide();
      // Re-render the empty cart
      renderCart();
    });
  }

  // Initial load of the cart
  renderCart();
});
