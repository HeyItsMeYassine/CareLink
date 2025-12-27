// static/assets/js/index.js
// Gestion de la navigation sur la page d’accueil (login / register).

document.addEventListener('DOMContentLoaded', () => {

  /* Fonction utilitaire pour rediriger vers une page */
  const go = (path) => (window.location.href = path);

  /* =======================
     Boutons d’authentification
     ======================= */

  // Bouton "Login"
  document.getElementById('loginBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    go('/login');
  });

  // Bouton "Register"
  document.getElementById('registerBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    go('/register');
  });

  // Bouton Login dans la section hero
  document.getElementById('heroLoginBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    go('/login');
  });

  // Bouton Register dans la section hero
  document.getElementById('heroRegisterBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    go('/register');
  });

  /* =======================
     Logo cliquable
     ======================= */

  // Redirection vers la page d’accueil via le logo
  document.getElementById('brandHome')?.addEventListener('click', () => go('/'));
});
