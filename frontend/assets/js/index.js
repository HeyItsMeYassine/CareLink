// Add click handlers for buttons
document.addEventListener("DOMContentLoaded", () => {
  // Get all buttons
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const heroLoginBtn = document.getElementById("heroLoginBtn");
  const heroRegisterBtn = document.getElementById("heroRegisterBtn");

  // Navigation function
  const navigateTo = (page) => {
    console.log(`Navigating to: pages/${page}`);
    window.location.href = `pages/${page}`;
  };

  // Add event listeners
  if (loginBtn) {
    loginBtn.addEventListener("click", () => navigateTo("login.html"));
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => navigateTo("register.html"));
  }

  if (heroLoginBtn) {
    heroLoginBtn.addEventListener("click", () => navigateTo("login.html"));
  }

  if (heroRegisterBtn) {
    heroRegisterBtn.addEventListener("click", () => navigateTo("register.html"));
  }

  // Log initialization
  console.log("CareLink Home Page initialized successfully");
});
