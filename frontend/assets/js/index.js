// Add click handlers for buttons
document.addEventListener("DOMContentLoaded", () => {
  const loginButtons = document.querySelectorAll(".btn-primary:not(.btn-outline), .btn-ghost")
  const registerButtons = document.querySelectorAll(".btn-outline, .btn-primary")

  loginButtons.forEach((btn) => {
    if (btn.textContent.includes("LOGIN")) {
      btn.addEventListener("click", () => {
        console.log("Login button clicked")
        window.location.href = "pages/login.html"
      })
    }
  })

  registerButtons.forEach((btn) => {
    if (btn.textContent.includes("REGISTER")) {
      btn.addEventListener("click", () => {
        console.log("Register button clicked")
        window.location.href = "pages/register.html"
      })
    }
  })

  // Handle home button if exists
  const homeButtons = document.querySelectorAll(".home-btn")
  homeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Home button clicked")
      window.location.href = "pages/index.html"
    })
  })
})
