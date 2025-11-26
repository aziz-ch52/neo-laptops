// --- 1. GLOBAL SESSION MANAGEMENT ---
// This runs immediately to check if the user is logged in

const session = JSON.parse(localStorage.getItem('neoUserSession'));

if (session) {
  // User is logged in
  // Redirect them away from login.html to the homepage
  window.location.href = 'index.html';
}

// Function to update navbar based on login state
// (This will be called on other pages too)
function checkLoginState() {
  const session = JSON.parse(localStorage.getItem('neoUserSession'));
  const navLoginBtn = document.getElementById('nav-login-btn');
  const navUserDropdown = document.getElementById('nav-user-dropdown');
  const navUserName = document.getElementById('nav-user-name');
  const navUserIcon = document.getElementById('nav-user-icon');
  const navLogoutBtn = document.getElementById('nav-logout-btn');

  if (session) {
    // Logged In
    navLoginBtn.style.display = 'none';
    navUserDropdown.style.display = 'block';
    navUserName.textContent = `Welcome, ${session.name}`;
    navUserIcon.href = '#'; // Would go to account.html
    navUserIcon.title = 'My Account';
  } else {
    // Logged Out
    navLoginBtn.style.display = 'block';
    navUserDropdown.style.display = 'none';
    navUserIcon.href = 'login.html';
    navUserIcon.title = 'Login';
  }

  if (navLogoutBtn) {
    navLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('neoUserSession');
      // Show toast notification for logout
      showToast('Logged Out', 'You have been successfully logged out.', 'success');
      // Wait for toast to be seen, then reload
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    });
  }
}

// Function to initialize dummy accounts (run once)
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

// --- 2. INITIALIZE ---
document.addEventListener('DOMContentLoaded', function () {
  // Initialize dummy accounts on first load
  initializeDummyAccounts();

  // Run on every page load to set navbar
  checkLoginState();

  // Get Toast elements
  const appToastEl = document.getElementById('app-toast');
  const appToast = new bootstrap.Toast(appToastEl);
  const toastHeader = document.getElementById('toast-header');
  const toastTitle = document.getElementById('toast-title');
  const toastBody = document.getElementById('toast-body');

  // Helper function to show toasts
  function showToast(title, message, type = 'success') {
    toastTitle.textContent = title;
    toastBody.textContent = message;

    // Change color based on type
    if (type === 'success') {
      toastHeader.classList.remove('bg-danger');
      toastHeader.classList.add('bg-primary');
    } else if (type === 'error') {
      toastHeader.classList.remove('bg-primary');
      toastHeader.classList.add('bg-danger');
    }
    appToast.show();
  }

  // --- 3. PAGE LOGIC (LOGIN/REGISTER) ---

  // Login Form
  const loginForm = document.getElementById('loginForm');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const loginErrorMsg = document.getElementById('login-error-message');

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      loginErrorMsg.style.display = 'none'; // Hide old errors

      // Show loading spinner
      const btnSpinner = loginSubmitBtn.querySelector('.spinner-border');
      const btnText = loginSubmitBtn.querySelector('.btn-text');
      btnText.textContent = 'Logging in...';
      btnSpinner.style.display = 'inline-block';
      loginSubmitBtn.disabled = true;

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Simulate server delay
      setTimeout(() => {
        // Get user "database"
        const users = JSON.parse(localStorage.getItem('neoUserDatabase')) || [];

        // Find user
        const user = users.find((u) => u.email === email && u.password === password);

        // Reset button
        btnText.textContent = 'Login';
        btnSpinner.style.display = 'none';
        loginSubmitBtn.disabled = false;

        if (user) {
          // --- LOGIN SUCCESS ---
          // Create a session
          localStorage.setItem(
            'neoUserSession',
            JSON.stringify({ name: user.name, email: user.email }),
          );
          // Show success toast
          showToast('Login Successful', `Welcome back, ${user.name}! Redirecting...`, 'success');
          // Redirect to homepage
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        } else {
          // --- LOGIN FAILURE ---
          loginErrorMsg.textContent = 'Invalid email or password. Please try again.';
          loginErrorMsg.style.display = 'block';
        }
      }, 1500);
    });
  }

  // Register Form
  const registerForm = document.getElementById('registerForm');
  const registerSubmitBtn = document.getElementById('registerSubmitBtn');
  const registerErrorMsg = document.getElementById('register-error-message');

  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      registerErrorMsg.style.display = 'none';

      // Show loading spinner
      const btnSpinner = registerSubmitBtn.querySelector('.spinner-border');
      const btnText = registerSubmitBtn.querySelector('.btn-text');
      btnText.textContent = 'Creating...';
      btnSpinner.style.display = 'inline-block';
      registerSubmitBtn.disabled = true;

      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;

      // Simulate server delay
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('neoUserDatabase')) || [];

        // Check if user already exists
        const existingUser = users.find((u) => u.email === email);

        // Reset button
        btnText.textContent = 'Create Account';
        btnSpinner.style.display = 'none';
        registerSubmitBtn.disabled = false;

        if (existingUser) {
          registerErrorMsg.textContent = 'An account with this email already exists.';
          registerErrorMsg.style.display = 'block';
        } else {
          // --- REGISTER SUCCESS ---
          users.push({ name, email, password });
          localStorage.setItem('neoUserDatabase', JSON.stringify(users));

          // Close modal and show success toast
          bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
          showToast('Account Created!', 'You can now log in with your new account.', 'success');
          registerForm.reset();
        }
      }, 1500);
    });
  }

  // Forgot Password Form (Demo)
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', function (e) {
      e.preventDefault();
      bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal')).hide();
      showToast(
        'Reset Link Sent',
        'A (demo) password reset link has been sent to your email.',
        'success',
      );
      forgotPasswordForm.reset();
    });
  }

  // --- 4. ANIMATIONS & CART ---
  const sectionsToAnimate = document.querySelectorAll('.fade-in-section');
  if (sectionsToAnimate.length > 0) {
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

  // Cart Counter (for header consistency)
  const cartCountIcon = document.getElementById('cart-item-count');
  function updateCartCount() {
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
  updateCartCount(); // Run on page load
});
