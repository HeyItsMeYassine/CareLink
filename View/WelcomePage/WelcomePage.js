// Add click handlers for buttons
document.addEventListener("DOMContentLoaded", () => {
  const loginButtons = document.querySelectorAll(".btn-primary:not(.btn-outline), .btn-ghost")
  const registerButtons = document.querySelectorAll(".btn-outline, .btn-primary")

  loginButtons.forEach((btn) => {
    if (btn.textContent.includes("LOGIN")) {
      btn.addEventListener("click", () => {
        console.log("Login button clicked")
        // Add your login logic here
      })
    }
  })

  registerButtons.forEach((btn) => {
    if (btn.textContent.includes("REGISTER")) {
      btn.addEventListener("click", () => {
        console.log("Register button clicked")
        // Add your register logic here
      })
    }
  })
})
