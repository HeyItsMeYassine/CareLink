// ========== CONFIGURATION ==========
const CONFIG = {
    csvPaths: {
        patients: '../../backend/data/patients.csv',
        doctors: '../../backend/data/doctors.csv'
    }
};

// ========== CSV PARSING FUNCTIONS ==========

/**
 * Parse CSV string into array of objects
 */
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });
}

/**
 * Load and parse CSV file
 */
async function loadCSV(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}`);
        }
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        return [];
    }
}

/**
 * Convert CSV ID to dashboard ID format
 * ID01 → p1, ID001 → d1
 */
function convertToDashboardId(csvId, type) {
    if (type === 'patient') {
        // ID01 → p1
        const number = csvId.replace('ID', '');
        return `p${parseInt(number)}`;
    } else if (type === 'doctor') {
        // ID001 → d1
        const number = csvId.replace('ID', '');
        return `d${parseInt(number)}`;
    }
    return csvId;
}

// ========== AUTH CONTROLLER ==========
const AuthController = {
    // Load patients data
    loadPatientsData: async function() {
        return await loadCSV(CONFIG.csvPaths.patients);
    },
    
    // Load doctors data
    loadDoctorsData: async function() {
        return await loadCSV(CONFIG.csvPaths.doctors);
    },
    
    // Validate patient login
    validatePatientLogin: async function(email, password) {
        const patients = await this.loadPatientsData();
        const patient = patients.find(p => 
            p.Email === email && p.Password === password
        );
        
        if (patient) {
            return {
                success: true,
                user: {
                    name: `${patient['First Name']} ${patient['Last Name']}`,
                    firstName: patient['First Name'],
                    id: convertToDashboardId(patient.ID, 'patient'),
                    email: patient.Email,
                    type: 'patient',
                    wilaya: patient.Wilaya,
                    city: patient.City,
                    phone: patient['Phone Number'],
                    sex: patient.Sexe
                }
            };
        }
        return { success: false };
    },
    
    // Validate doctor login
    validateDoctorLogin: async function(email, password) {
        const doctors = await this.loadDoctorsData();
        const doctor = doctors.find(d => 
            d.Email === email && d.Password === password
        );
        
        if (doctor) {
            return {
                success: true,
                user: {
                    name: `Dr. ${doctor.First_Name} ${doctor.Last_Name}`,
                    firstName: doctor.First_Name,
                    id: convertToDashboardId(doctor.ID, 'doctor'),
                    email: doctor.Email,
                    type: 'doctor',
                    wilaya: doctor.Wilaya,
                    city: doctor.City,
                    phone: doctor['Phone Number'],
                    sex: doctor.Sexe,
                    specialty: doctor.Speciality,
                    locationLink: doctor.Location_Link
                }
            };
        }
        return { success: false };
    },
    
    // Validate login based on type
    validateLogin: async function(email, password, type) {
        if (type === 'patient') {
            return await this.validatePatientLogin(email, password);
        } else if (type === 'doctor') {
            return await this.validateDoctorLogin(email, password);
        }
        return { success: false };
    },
    
    // Store user session
    storeUserSession: function(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
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
        alert(message);
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
        // Validate against CSV data
        const result = await AuthController.validateLogin(email, password, type);
        
        if (result.success) {
            // Store user session
            AuthController.storeUserSession(result.user);
            
            AuthController.notifySuccess(`Login successful! Welcome, ${result.user.firstName}!`);
            
            // Redirect to correct dashboard
            if (type === 'patient') {
                window.location.href = 'patientdashboard.html';
            } else if (type === 'doctor') {
                window.location.href = 'doctordashboard.html'; // You'll need to create this
            }
        } else {
            AuthController.showError(`Invalid email or password for ${type}. Please try again.`);
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
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    // Clear any existing session (for testing)
    // localStorage.removeItem('currentUser');
    
    // You can keep demo users for testing, but CSV is now primary
    if (!localStorage.getItem('users')) {
        const demoUsers = [
            { email: 'aminemohamed@gmail.com', password: 'BkFrm731', type: 'patient' },
            { email: 'zoubirfarid@gmail.com', password: 'VqRzE749', type: 'doctor' }
        ];
        localStorage.setItem('users', JSON.stringify(demoUsers));
    }
});
