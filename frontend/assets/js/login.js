// ========== CONFIGURATION ==========
const CONFIG = {
    apiBaseUrl: 'http://localhost:4567/api'
};

// ========== API SERVICE ==========
const ApiService = {
    // Login doctor
    loginDoctor: async function(email, password) {
        const response = await fetch(`${CONFIG.apiBaseUrl}/login/doctor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    },
    
    // Login patient
    loginPatient: async function(email, password) {
        const response = await fetch(`${CONFIG.apiBaseUrl}/login/patient`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    },
    
    // Check session
    checkSession: async function() {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) return { valid: false };
        
        const response = await fetch(`${CONFIG.apiBaseUrl}/check-session`, {
            method: 'GET',
            headers: {
                'Session-ID': sessionId
            }
        });
        return await response.json();
    },
    
    // Logout
    logout: async function() {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            await fetch(`${CONFIG.apiBaseUrl}/logout`, {
                method: 'POST',
                headers: {
                    'Session-ID': sessionId
                }
            });
        }
        localStorage.removeItem('sessionId');
        localStorage.removeItem('currentUser');
    }
};

// ========== AUTH CONTROLLER (UPDATED) ==========
const AuthController = {
    // Validate login via backend API
    validateLogin: async function(email, password, type) {
        try {
            let response;
            if (type === 'patient') {
                response = await ApiService.loginPatient(email, password);
            } else if (type === 'doctor') {
                response = await ApiService.loginDoctor(email, password);
            }
            
            if (response.success) {
                // Store session and user data
                localStorage.setItem('sessionId', response.user.sessionId);
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                return {
                    success: true,
                    user: response.user,
                    redirect: response.redirect
                };
            } else {
                return {
                    success: false,
                    message: response.message || 'Invalid credentials'
                };
            }
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                message: 'Connection error. Please try again.'
            };
        }
    },
    
    // Show error message
    showError: function(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-overlay').style.display = 'flex';
        
        setTimeout(() => {
            this.hideError();
        }, 5000);
    },
    
    // Hide error overlay
    hideError: function() {
        document.getElementById('error-overlay').style.display = 'none';
    },
    
    // Show success notification
    notifySuccess: function(message) {
        alert(message);
    },
    
    // Store user session (compatibility with existing code)
    storeUserSession: function(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    }
};

// ========== TAB SWITCHING ==========
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-button").forEach(button => {
        button.classList.remove("active");
    });
    event.target.classList.add("active");
    
    // Update tab content
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });
    document.getElementById(tabName).classList.add("active");
}

// ========== LOGIN HANDLING (UPDATED) ==========
async function handleLogin(event, type) {
    event.preventDefault();
    
    const email = document.getElementById(`${type}-email`).value;
    const password = document.getElementById(`${type}-password`).value;
    
    // Basic validation
    if (!email || !password) {
        AuthController.showError("Please fill in all fields");
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('.login-button');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        // Validate against backend API
        const result = await AuthController.validateLogin(email, password, type);
        
        if (result.success) {
            AuthController.notifySuccess(`Login successful! Welcome, ${result.user.firstName}!`);
            
            // Redirect to correct dashboard
            window.location.href = result.redirect || 
                (type === 'patient' ? 'patientdashboard.html' : 'doctordashboard.html');
        } else {
            AuthController.showError(result.message || `Invalid email or password for ${type}. Please try again.`);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        AuthController.showError('Login failed. Please check your connection and try again.');
        
    } finally {
        // Restore button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = button.getAttribute('data-tab');
            switchTab.call(button, tabName);
        });
    });
    
    // Form submissions
    document.getElementById('patient-form').addEventListener('submit', (e) => {
        handleLogin(e, 'patient');
    });
    
    document.getElementById('doctor-form').addEventListener('submit', (e) => {
        handleLogin(e, 'doctor');
    });
    
    // Home button
    document.getElementById('homeBtn').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    // Register links
    document.querySelectorAll('a[id^="registerLink"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    });
    
    // Error overlay click to dismiss
    document.getElementById('error-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'error-overlay') {
            AuthController.hideError();
        }
    });
    
    // Check for existing session on load
    checkExistingSession();
}

// ========== SESSION MANAGEMENT ==========
async function checkExistingSession() {
    const response = await ApiService.checkSession();
    if (response.valid && response.user) {
        console.log('User already logged in:', response.user.name);
        // Auto-redirect if on login page
        if (window.location.pathname.includes('login.html')) {
            if (response.user.type === 'patient') {
                window.location.href = 'patientdashboard.html';
            } else if (response.user.type === 'doctor') {
                window.location.href = 'doctordashboard.html';
            }
        }
    }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    // Clear session for testing (comment out in production)
    // localStorage.removeItem('sessionId');
    // localStorage.removeItem('currentUser');
});
