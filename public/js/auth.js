// ============ VARIABLES GLOBALES ============
let token = localStorage.getItem('token');
let currentUser = null;

// Vérifier la connexion au chargement
document.addEventListener('DOMContentLoaded', verifyToken);

// ============ VÉRIFIER LE TOKEN ============
async function verifyToken() {
  if (!token) {
    showAuthButtons();
    return;
  }

  try {
    const response = await fetch('/api/auth/verify', {
      headers: { 'authorization': token }
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      showUserSection();
    } else {
      token = null;
      localStorage.removeItem('token');
      showAuthButtons();
    }
  } catch (error) {
    console.error('Erreur vérification token:', error);
    showAuthButtons();
  }
}

// ============ AFFICHAGE UI ============
function showAuthButtons() {
  document.getElementById('auth-buttons').classList.remove('hidden');
  document.getElementById('user-section').classList.add('hidden');
}

function showUserSection() {
  document.getElementById('auth-buttons').classList.add('hidden');
  document.getElementById('user-section').classList.remove('hidden');
  document.getElementById('username-display').textContent = currentUser.username;
}

// ============ MODALES ============
function openLoginModal() {
  document.getElementById('login-modal').classList.remove('hidden');
  document.getElementById('register-modal').classList.add('hidden');
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.add('hidden');
}

function openRegisterModal() {
  document.getElementById('register-modal').classList.remove('hidden');
  document.getElementById('login-modal').classList.add('hidden');
}

function closeRegisterModal() {
  document.getElementById('register-modal').classList.add('hidden');
}

function switchToLogin() {
  closeRegisterModal();
  openLoginModal();
}

function switchToRegister() {
  closeLoginModal();
  openRegisterModal();
}

// ============ INSCRIPTION ============
document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorDiv = document.getElementById('register-error');

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('token', token);
      
      closeRegisterModal();
      showUserSection();
      alert('✓ Inscription réussie! Bienvenue ' + username);
      document.getElementById('form-register').reset();
      window.location.reload();
    } else {
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = data.error || 'Erreur d\'inscription';
    }
  } catch (error) {
    console.error('Erreur:', error);
    errorDiv.classList.remove('hidden');
    errorDiv.textContent = 'Erreur serveur';
  }
});

// ============ CONNEXION ============
document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('token', token);
      
      closeLoginModal();
      showUserSection();
      alert('✓ Connexion réussie! Bienvenue ' + currentUser.username);
      document.getElementById('form-login').reset();
      window.location.reload();
    } else {
      errorDiv.classList.remove('hidden');
      errorDiv.textContent = data.error || 'Erreur de connexion';
    }
  } catch (error) {
    console.error('Erreur:', error);
    errorDiv.classList.remove('hidden');
    errorDiv.textContent = 'Erreur serveur';
  }
});

// ============ DÉCONNEXION ============
function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  showAuthButtons();
  alert('✓ Vous avez été déconnecté');
  location.reload();
}