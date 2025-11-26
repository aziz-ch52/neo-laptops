/* ================================== */
/* ==  GLOBAL LOGIC (FOR ALL PAGES) == */
/* ================================== */

// --- 1. GLOBAL HELPERS ---
function showToast(title, message, type = 'success') {
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
      { name: 'Yusuf', email: 'yusuf@gmail.com', password: 'pass123' },
      { name: 'Test User', email: 'user@example.com', password: 'password' },
    ];
    localStorage.setItem('neoUserDatabase', JSON.stringify(users));
  }
}

/* ================================== */
/* ==  PAGE-SPECIFIC LOGIC (ABOUT)  == */
/* ================================== */
function initPageAnimations() {
  const sectionsToAnimate = document.querySelectorAll('.fade-in-section');

  if (!sectionsToAnimate) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1, // Triggers when 10% of the element is visible
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

// --- RUN ALL LOGIC ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', function () {
  // Global functions
  initializeDummyAccounts();
  checkLoginState();
  updateCartCount();

  // Page-specific functions
  initPageAnimations();
});
