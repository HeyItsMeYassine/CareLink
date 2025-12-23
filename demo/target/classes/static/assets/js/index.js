// static/assets/js/index.js
document.addEventListener('DOMContentLoaded', () => {
  const go = (path) => (window.location.href = path);

  // Buttons (if present)
  document.getElementById('loginBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    go('/login');
  });

  document.getElementById('registerBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    go('/register');
  });

  document.getElementById('heroLoginBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    go('/login');
  });

  document.getElementById('heroRegisterBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    go('/register');
  });

  // Clickable logo (if you want it clickable like dashboard)
  document.getElementById('brandHome')?.addEventListener('click', () => go('/'));
});
