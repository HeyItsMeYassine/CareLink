// Form submission handler
function saveProfile(event) {
    event.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password && password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Get form data
    const formData = new FormData(event.target);
    const profileData = Object.fromEntries(formData.entries());
    
    // Remove empty password fields
    if (!profileData.password) {
        delete profileData.password;
    }
    delete profileData.confirmPassword;
    
    // Save to localStorage (in a real app, this would be sent to a server)
    localStorage.setItem('patientProfile', JSON.stringify(profileData));
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide success message after 3 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Load saved profile data on page load
function loadProfileData() {
    const savedProfile = localStorage.getItem('patientProfile');
    if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        
        // Populate form fields
        Object.keys(profileData).forEach(key => {
            const field = document.getElementById(key);
            if (field && !field.disabled) {
                field.value = profileData[key];
            }
        });
    }
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved profile data
    loadProfileData();
    
    // Add form submit event listener
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
    
    // Add back button functionality
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'patient-dashboard.html';
        });
    }
    
    // Add cancel button functionality
    const cancelBtn = document.querySelector('.btn-secondary');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'patient-dashboard.html';
        });
    }
});
