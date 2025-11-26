/* ================================== */
/* ==  GLOBAL LOGIC (FOR ALL PAGES) == */
/* ================================== */

// --- 1. GLOBAL HELPERS ---
function showToast(title, message, type = 'success') {
  // This global function uses the 'app-toast'
  const toastEl = document.getElementById('app-toast');
  if (!toastEl) return;
  const toastHeader = toastEl.querySelector('.toast-header');
  const toastTitle = toastEl.querySelector('.toast-title');
  const toastBody = toastEl.querySelector('.toast-body');

  toastTitle.textContent = title;
  toastBody.textContent = message;

  if (type === 'success') {
    toastHeader.classList.remove('bg-danger', 'text-white');
    toastHeader.classList.add('bg-primary', 'text-dark');
  } else if (type === 'error') {
    toastHeader.classList.remove('bg-primary', 'text-dark');
    toastHeader.classList.add('bg-danger', 'text-white');
  }

  const bsToast = new bootstrap.Toast(toastEl);
  bsToast.show();
}

// --- 2. GLOBAL NAVBAR & SESSION LOGIC ---
function checkLoginState() {
  const session = JSON.parse(localStorage.getItem('neoUserSession'));
  const navLoginBtn = document.getElementById('nav-login-btn');
  const navUserDropdown = document.getElementById('nav-user-dropdown');
  const navUserName = document.getElementById('nav-user-name');
  const navUserIcon = document.getElementById('nav-user-icon');
  const navLogoutBtn = document.getElementById('nav-logout-btn');

  if (session) {
    // Logged In
    if (navLoginBtn) navLoginBtn.style.display = 'none';
    if (navUserDropdown) navUserDropdown.style.display = 'block';
    if (navUserName) navUserName.textContent = `Welcome, ${session.name}`;
    if (navUserIcon) {
      navUserIcon.href = '#'; // TODO: Link to account.html
      navUserIcon.title = 'My Account';
    }
  } else {
    // Logged Out
    if (navLoginBtn) navLoginBtn.style.display = 'block';
    if (navUserDropdown) navUserDropdown.style.display = 'none';
    if (navUserIcon) {
      navUserIcon.href = 'login.html';
      navUserIcon.title = 'Login';
    }
  }

  if (navLogoutBtn) {
    navLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('neoUserSession');
      showToast('Logged Out', 'You have been successfully logged out.', 'success');
      setTimeout(() => {
        window.location.href = 'index.html'; // Reload homepage
      }, 1500);
    });
  }
}

// --- 3. GLOBAL CART COUNTER ---
function updateCartCount() {
  const cartCountIcon = document.getElementById('cart-item-count');
  if (!cartCountIcon) return;

  const cart = JSON.parse(localStorage.getItem('neoCart')) || [];
  let totalItems = 0;
  cart.forEach((item) => {
    totalItems += item.quantity;
  });

  if (totalItems > 0) {
    cartCountIcon.textContent = totalItems;
    cartCountIcon.style.display = 'block';
  } else {
    cartCountIcon.style.display = 'none';
  }
}

// --- 4. GLOBAL DUMMY ACCOUNTS (Run once) ---
function initializeDummyAccounts() {
  if (!localStorage.getItem('neoUserDatabase')) {
    const users = [
      {
        name: 'Yusuf',
        email: 'yusuf@gmail.com',
        password: 'pass123',
      },
      {
        name: 'Test User',
        email: 'user@example.com',
        password: 'password',
      },
    ];
    localStorage.setItem('neoUserDatabase', JSON.stringify(users));
  }
}

/* ================================== */
/* == PAGE-SPECIFIC LOGIC (PRODUCTS) = */
/* ================================== */
function initPageLogic() {
  // --- Initialize Page-Specific Toasts ---
  const cartToastEl = document.getElementById('add-to-cart-toast');
  const cartToast = new bootstrap.Toast(cartToastEl);

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

  // --- Quick View Modal Logic ---
  const quickViewModal = document.getElementById('quickViewModal');
  if (quickViewModal) {
    quickViewModal.addEventListener('show.bs.modal', function (event) {
      const button = event.relatedTarget;
      const card = button.closest('.product-card-v2') || button.closest('.modal-body')._sourceCard;

      if (!card) return;

      const title = card.querySelector('.product-quick-view-title').textContent;
      const imageSrc = card.querySelector('.product-quick-view-image').src;
      const priceHTML = card.querySelector('.product-quick-view-price').innerHTML;
      const specsHTML = card.querySelector('.product-quick-view-specs').innerHTML;

      const modalTitle = quickViewModal.querySelector('#modal-title');
      const modalImage = quickViewModal.querySelector('#modal-image');
      const modalPrice = quickViewModal.querySelector('#modal-price');
      const modalSpecs = quickViewModal.querySelector('#modal-specs');
      const modalAddToCartBtn = quickViewModal.querySelector('.add-to-cart-btn');

      modalTitle.textContent = title;
      modalImage.src = imageSrc;
      modalPrice.innerHTML = priceHTML;
      modalSpecs.innerHTML = specsHTML;

      modalAddToCartBtn._sourceCard = card;
      quickViewModal.querySelector('.modal-body')._sourceCard = card;
    });
  }

  // --- Sidebar Filter Logic ---
  const filterCheckboxes = document.querySelectorAll('.brand-filter');
  const filterTags = document.querySelectorAll('.filter-tags .badge');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const allProductSections = document.querySelectorAll('.product-grid-main > section');
  const noProductsMessage = document.getElementById('no-products-message');

  filterTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('active');
      applyFilters();
    });
  });

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', applyFilters);
  });

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      filterCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
      filterTags.forEach((tag) => {
        tag.classList.remove('active');
      });
      applyFilters();
    });
  }

  function applyFilters() {
    const checkedBrands = Array.from(filterCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    const checkedRAM = Array.from(filterTags)
      .filter((tag) => tag.closest('[data-filter-type="ram"]') && tag.classList.contains('active'))
      .map((tag) => tag.dataset.value);

    const checkedGPU = Array.from(filterTags)
      .filter((tag) => tag.closest('[data-filter-type="gpu"]') && tag.classList.contains('active'))
      .map((tag) => tag.dataset.value);

    let totalVisibleProducts = 0;

    allProductSections.forEach((section) => {
      let productsVisibleInSection = 0;
      const productsInThisSection = section.querySelectorAll('[class*="col-"]');

      productsInThisSection.forEach((cardWrapper) => {
        const card = cardWrapper.querySelector('.product-card-v2');
        if (!card) return;

        const cardBrand = card.closest('[data-brand]').dataset.brand;
        const cardRAM = card.closest('[data-ram]').dataset.ram;
        const cardGPU = card.closest('[data-gpu]').dataset.gpu;

        const brandMatch = checkedBrands.length === 0 || checkedBrands.includes(cardBrand);
        const ramMatch = checkedRAM.length === 0 || checkedRAM.includes(cardRAM);
        const gpuMatch = checkedGPU.length === 0 || checkedGPU.includes(cardGPU);

        if (brandMatch && ramMatch && gpuMatch) {
          cardWrapper.style.display = 'block';
          productsVisibleInSection++;
        } else {
          cardWrapper.style.display = 'none';
        }
      });

      if (productsVisibleInSection > 0) {
        section.style.display = 'block';
        totalVisibleProducts += productsVisibleInSection;
      } else {
        section.style.display = 'none';
      }
    });

    if (totalVisibleProducts === 0) {
      noProductsMessage.style.display = 'block';
    } else {
      noProductsMessage.style.display = 'none';
    }
  }

  // --- Add to Cart Logic ---
  const cartButtons = document.querySelectorAll('.add-to-cart-btn');

  cartButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      const card = e.currentTarget._sourceCard || e.currentTarget.closest('.product-card-v2');
      if (!card) return;

      const title = card.querySelector('.product-quick-view-title').textContent;
      const imageSrc = card.querySelector('.product-quick-view-image').src;
      const priceText = card.querySelector('.current-price').textContent;
      const numericPrice = parseFloat(priceText.replace('₹', '').replace(/,/g, ''));

      const specs = card.querySelector('.product-quick-view-specs li').textContent;

      const product = {
        title: title,
        image: imageSrc,
        price: numericPrice,
        specs: specs,
        quantity: 1,
      };

      let cart = JSON.parse(localStorage.getItem('neoCart')) || [];

      const existingProductIndex = cart.findIndex((item) => item.title === product.title);

      if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
      } else {
        cart.push(product);
      }

      localStorage.setItem('neoCart', JSON.stringify(cart));

      updateCartCount(); // This is the GLOBAL function

      document.getElementById(
        'toast-body-message',
      ).textContent = `"${title}" was added to your cart.`;
      cartToast.show(); // This shows the PAGE-SPECIFIC toast
    });
  });
}

// --- RUN ALL LOGIC ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', function () {
  // Global functions
  initializeDummyAccounts();
  checkLoginState();
  updateCartCount();

  // Page-specific functions
  initPageLogic();
});
