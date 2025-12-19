// ========== AUTH CONTROLLER ==========
const AuthController = {
    // Singleton for data storage
    getStorage: function() {
        if (!this.storage) {
            this.storage = {
                users: JSON.parse(localStorage.getItem('users')) || []
            };
        }
        return this.storage;
    },
    
    // Login validation strategy
    validateLogin: function(email, password, type) {
        const storage = this.getStorage();
        const user = storage.users.find(u => u.email === email && u.type === type);
        return user && user.password === password;
    },
    
    // Show styled error message
    showError: function(message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-overlay').style.display = 'flex';
        
        // Auto-hide after 5 seconds
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
        alert(message); // Could be replaced with a styled success overlay
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

// ========== LOGIN HANDLING ==========
function handleLogin(event, type) {
    event.preventDefault();
    
    const email = document.getElementById(`${type}-email`).value;
    const password = document.getElementById(`${type}-password`).value;
    
    // Basic validation
    if (!email || !password) {
        AuthController.showError("Please fill in all fields");
        return;
    }
    
    if (AuthController.validateLogin(email, password, type)) {
        AuthController.notifySuccess(`Login successful as ${type}!`);
        
        // Redirect to dashboard (you'll need to create these pages)
        if (type === 'patient') {
            window.location.href = 'PatientDashboard.html';
        } else if (type === 'doctor') {
            window.location.href = 'DoctorDashboard.html';
        }
    } else {
        AuthController.showError(`Invalid credentials for ${type}. Please try again.`);
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
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    // Initialize storage with some demo users (remove in production)
    if (!localStorage.getItem('users')) {
        const demoUsers = [
            { email: 'patient@example.com', password: 'password123', type: 'patient' },
            { email: 'doctor@example.com', password: 'password123', type: 'doctor' }
        ];
        localStorage.setItem('users', JSON.stringify(demoUsers));
    }
});
