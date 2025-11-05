// Authentication JavaScript
// Handles login, register, and token management
// Note: API_BASE_URL is defined in api.js

// ============================================
// Token Management
// ============================================

/**
 * Save JWT token to localStorage
 */
function saveToken(token) {
  localStorage.setItem('auth_token', token);
}

/**
 * Get JWT token from localStorage
 */
function getToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Remove JWT token from localStorage
 */
function removeToken() {
  localStorage.removeItem('auth_token');
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return getToken() !== null;
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * Logout user
 */
function logout() {
  removeToken();
  window.location.href = 'login.html';
}

// ============================================
// UI Helper Functions
// ============================================

/**
 * Show error message
 */
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  
  if (errorDiv && errorText) {
    errorText.textContent = message;
    errorDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorDiv.classList.add('hidden');
    }, 5000);
  }
}

/**
 * Hide error message
 */
function hideError() {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.classList.add('hidden');
  }
}

/**
 * Show success message
 */
function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  const successText = document.getElementById('success-text');
  
  if (successDiv && successText) {
    successText.textContent = message;
    successDiv.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      successDiv.classList.add('hidden');
    }, 5000);
  }
}

/**
 * Set button loading state
 */
function setButtonLoading(buttonId, loading) {
  const btn = document.getElementById(buttonId);
  const btnText = document.getElementById(buttonId + '-text');
  const btnSpinner = document.getElementById(buttonId + '-spinner');
  
  if (btn && btnText && btnSpinner) {
    if (loading) {
      btn.disabled = true;
      btn.classList.add('opacity-75', 'cursor-not-allowed');
      btnSpinner.classList.remove('hidden');
    } else {
      btn.disabled = false;
      btn.classList.remove('opacity-75', 'cursor-not-allowed');
      btnSpinner.classList.add('hidden');
    }
  }
}

// ============================================
// API Functions (use API_BASE_URL from api.js)
// ============================================

/**
 * Register new user
 */
async function registerUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }
  
  return await response.json();
}

/**
 * Login user
 */
async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
  
  return await response.json();
}

/**
 * Get current user info
 */
async function getCurrentUser() {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      window.location.href = 'login.html';
    }
    throw new Error('Failed to get user info');
  }
  
  return await response.json();
}

// ============================================
// Form Handlers
// ============================================

/**
 * Handle login form submission
 */
async function handleLogin(event) {
  event.preventDefault();
  hideError();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  setButtonLoading('login-btn', true);
  
  try {
    const data = await loginUser(email, password);
    
    // Save token
    saveToken(data.access_token);
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
    
  } catch (error) {
    showError(error.message);
    setButtonLoading('login-btn', false);
  }
}

/**
 * Handle register form submission
 */
async function handleRegister(event) {
  event.preventDefault();
  hideError();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // Validate passwords match
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }
  
  // Validate password length
  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }
  
  setButtonLoading('register-btn', true);
  
  try {
    await registerUser(email, password);
    
    // Show success message
    showSuccess('Account created successfully! Redirecting to login...');
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    
  } catch (error) {
    showError(error.message);
    setButtonLoading('register-btn', false);
  }
}

// ============================================
// Auto-redirect if already logged in
// ============================================

/**
 * Redirect to dashboard if already authenticated (for login/register pages)
 */
function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = 'dashboard.html';
  }
}

// Check on page load (only for login/register pages)
if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
  redirectIfAuthenticated();
}