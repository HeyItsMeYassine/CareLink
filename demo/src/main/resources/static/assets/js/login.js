// static/assets/js/login.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Check if user is already logged in
    checkCurrentSession();
    
    // Get tab elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const patientTab = document.getElementById('patient');
    const doctorTab = document.getElementById('doctor');
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            console.log('Switching to tab:', tabId);
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Hide all tab content
            patientTab.style.display = 'none';
            doctorTab.style.display = 'none';
            
            // Show selected tab content
            if (tabId === 'patient') {
                patientTab.style.display = 'flex';
                patientTab.classList.add('active');
                doctorTab.classList.remove('active');
            } else if (tabId === 'doctor') {
                doctorTab.style.display = 'flex';
                doctorTab.classList.add('active');
                patientTab.classList.remove('active');
            }
        });
    });
    
    // Handle patient login - FIXED: Using correct form ID
    const patientForm = document.getElementById('patient-form');
    if (patientForm) {
        patientForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Patient login form submitted');
            
            const email = document.getElementById('patient-email').value;
            const password = document.getElementById('patient-password').value;
            
            console.log('Attempting patient login with:', { email, password: '***' });
            
            try {
                const response = await fetch('/api/session/patient', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                console.log('Response status:', response.status);
                const result = await response.json();
                console.log('Response data:', result);
                
                if (result.success) {
                    console.log('Login successful, redirecting to patient dashboard');
                    // Clear form
                    patientForm.reset();
                    // Redirect to dashboard
                    window.location.href = '/patient/dashboard';
                } else {
                    console.log('Login failed:', result.message);
                    showError(result.message || 'Invalid email or password');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('Login failed. Please try again.');
            }
        });
    }
    
    // Handle doctor login - FIXED: Using correct form ID
    const doctorForm = document.getElementById('doctor-form');
    if (doctorForm) {
        doctorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Doctor login form submitted');
            
            const email = document.getElementById('doctor-email').value;
            const password = document.getElementById('doctor-password').value;
            
            console.log('Attempting doctor login with:', { email, password: '***' });
            
            try {
                const response = await fetch('/api/session/doctor', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                console.log('Response status:', response.status);
                const result = await response.json();
                console.log('Response data:', result);
                
                if (result.success) {
                    console.log('Login successful, redirecting to doctor dashboard');
                    // Clear form
                    doctorForm.reset();
                    // Redirect to dashboard
                    window.location.href = '/doctor/dashboard';
                } else {
                    console.log('Login failed:', result.message);
                    showError(result.message || 'Invalid email or password');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('Login failed. Please try again.');
            }
        });
    }
    
    // Home button handler
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            window.location.href = '/';
        });
    }
});

async function checkCurrentSession() {
    try {
        console.log('Checking current session...');
        const response = await fetch('/api/session/current');
        if (response.ok) {
            const user = await response.json();
            console.log('Current user:', user);
            
            if (user.userType === 'patient') {
                console.log('Already logged in as patient, redirecting');
                window.location.href = '/patient/dashboard';
            } else if (user.userType === 'doctor') {
                console.log('Already logged in as doctor, redirecting');
                window.location.href = '/doctor/dashboard';
            }
        }
    } catch (error) {
        console.log('No active session or error:', error);
    }
}

function showError(message) {
    console.log('Showing error:', message);
    
    // Use the existing error overlay
    const errorOverlay = document.getElementById('error-overlay');
    const errorMessage = document.getElementById('error-message');
    
    if (errorOverlay && errorMessage) {
        errorMessage.textContent = message;
        errorOverlay.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(hideError, 5000);
    } else {
        // Fallback: create a simple alert
        alert('Error: ' + message);
    }
}

function hideError() {
    const errorOverlay = document.getElementById('error-overlay');
    if (errorOverlay) {
        errorOverlay.style.display = 'none';
    }
}

// Make hideError function available globally
window.hideError = hideError;