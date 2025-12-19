// ========== CONFIGURATION ==========
const CONFIG = {
    csvPaths: {
        cities: '../../backend/data/cities.csv',
        specialties: '../../backend/data/specialities.csv'
    },
    imagePaths: {
        doctor: '../assets/images/DoctorPic.png',
        patient: '../assets/images/PatientPic.png'
    },
    redirectPaths: {
        home: 'WelcomePage/WelcomePage.html',
        login: 'LoginPage/LoginPage.html'
    }
};

// ========== DATA STORAGE ==========
let wilayaData = {}; // Format: { "Alger": ["Alger Centre", "Bab El Oued", ...], "Oran": [...] }
let specialties = []; // Format: ["General Practice", "Pediatrics", ...]

// ========== CSV PARSING FUNCTIONS ==========

/**
 * Parse CSV string into array of objects
 * @param {string} csv - CSV content
 * @returns {Array} Array of objects
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
 * @param {string} filePath - Path to CSV file
 * @returns {Promise} Promise with parsed data
 */
async function loadCSV(filePath) {
    try {
        console.log(`Loading CSV from: ${filePath}`);
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to load ${filePath}`);
        }
        const csvText = await response.text();
        const data = parseCSV(csvText);
        console.log(`Successfully loaded ${data.length} records from ${filePath}`);
        return data;
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        showError(`Failed to load data from ${filePath}. Please check the file path.`);
        return [];
    }
}

/**
 * Load wilaya and city data from CSV
 */
async function loadWilayaCityData() {
    const data = await loadCSV(CONFIG.csvPaths.cities);
    
    if (data.length === 0) {
        console.warn('No wilaya/city data loaded. Using fallback data.');
        return loadFallbackWilayaData();
    }
    
    // Process the data from CSV format: Wilaya,City
    wilayaData = {};
    
    data.forEach(row => {
        const wilaya = row.Wilaya;
        const city = row.City;
        
        if (wilaya && city) {
            if (!wilayaData[wilaya]) {
                wilayaData[wilaya] = [];
            }
            if (!wilayaData[wilaya].includes(city)) {
                wilayaData[wilaya].push(city);
            }
        }
    });
    
    console.log('Loaded wilaya data:', Object.keys(wilayaData).length, 'wilayas');
    return wilayaData;
}

/**
 * Load specialties from CSV
 */
async function loadSpecialties() {
    const data = await loadCSV(CONFIG.csvPaths.specialties);
    
    if (data.length === 0) {
        console.warn('No specialties data loaded. Using fallback data.');
        return loadFallbackSpecialties();
    }
    
    // Process the data from CSV format: id,specialty_name
    specialties = data
        .map(row => row.specialty_name || row.specialty)
        .filter(specialty => specialty && specialty.trim() !== '')
        .sort();
    
    console.log('Loaded specialties:', specialties.length);
    return specialties;
}

/**
 * Fallback wilaya data if CSV fails to load
 */
function loadFallbackWilayaData() {
    wilayaData = {
        "Alger": ["Alger Centre", "Bab El Oued", "Hussein Dey"],
        "Oran": ["Oran", "Es Sénia", "Bir El Djir"],
        "Boumerdès": ["Boumerdès", "Thenia", "Dellys"]
    };
    console.log('Using fallback wilaya data');
    return wilayaData;
}

/**
 * Fallback specialties if CSV fails to load
 */
function loadFallbackSpecialties() {
    specialties = ["General Practice", "Pediatrics", "Cardiology"];
    console.log('Using fallback specialties');
    return specialties;
}

// ========== FORM POPULATION FUNCTIONS ==========

/**
 * Populate wilaya dropdowns
 */
function populateWilayaDropdowns() {
    const wilayaSelects = document.querySelectorAll('select[id$="-wilaya"]');
    const wilayas = Object.keys(wilayaData).sort();
    
    if (wilayas.length === 0) {
        wilayaSelects.forEach(select => {
            select.innerHTML = '<option value="">No wilayas available</option>';
            select.disabled = true;
        });
        return;
    }
    
    wilayaSelects.forEach(select => {
        select.innerHTML = '<option value="">Select Wilaya</option>';
        
        wilayas.forEach(wilaya => {
            const option = document.createElement('option');
            option.value = wilaya;
            option.textContent = wilaya;
            select.appendChild(option);
        });
        
        select.disabled = false;
    });
}

/**
 * Populate city dropdown based on selected wilaya
 * @param {string} formType - 'doctor' or 'patient'
 * @param {string} wilaya - Selected wilaya
 */
function populateCities(formType, wilaya) {
    const citySelect = document.getElementById(`${formType}-city`);
    
    if (!wilaya || !wilayaData[wilaya]) {
        citySelect.innerHTML = '<option value="">Select a Wilaya first</option>';
        citySelect.disabled = true;
        return;
    }
    
    const cities = wilayaData[wilaya].sort();
    citySelect.innerHTML = '<option value="">Select City</option>';
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    citySelect.disabled = false;
}

/**
 * Populate specialties dropdown
 */
function populateSpecialtiesDropdown() {
    const specialtySelect = document.getElementById('doctor-specialty');
    
    if (!specialtySelect) return;
    
    if (specialties.length === 0) {
        specialtySelect.innerHTML = '<option value="">No specialties available</option>';
        specialtySelect.disabled = true;
        return;
    }
    
    specialtySelect.innerHTML = '<option value="">Select Specialty</option>';
    
    specialties.forEach(specialty => {
        const option = document.createElement('option');
        option.value = specialty;
        option.textContent = specialty;
        specialtySelect.appendChild(option);
    });
    
    specialtySelect.disabled = false;
}

// ========== TAB SWITCHING ==========

/**
 * Switch between doctor and patient tabs
 * @param {string} type - 'doctor' or 'patient'
 */
function switchTab(type) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide forms
    document.getElementById('doctor-form').classList.toggle('active', type === 'doctor');
    document.getElementById('patient-form').classList.toggle('active', type === 'patient');
    
    // Show/hide illustrations
    document.getElementById('doctor-illustration').style.display = type === 'doctor' ? 'block' : 'none';
    document.getElementById('patient-illustration').style.display = type === 'patient' ? 'block' : 'none';
}

// ========== FORM VALIDATION ==========

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Algerian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function validatePhone(phone) {
    const phoneRegex = /^(?:\+213|0)(5|6|7)[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Show error message for a field
 * @param {string} fieldId - Field ID
 * @param {string} message - Error message
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = field.nextElementSibling;
    
    field.classList.add('error');
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

/**
 * Clear error message for a field
 * @param {string} fieldId - Field ID
 */
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = field.nextElementSibling;
    
    field.classList.remove('error');
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.classList.remove('show');
    }
}

/**
 * Validate form data
 * @param {Object} formData - Form data object
 * @param {string} userType - 'doctor' or 'patient'
 * @returns {boolean} True if valid
 */
function validateForm(formData, userType) {
    let isValid = true;
    
    // Clear all errors first
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message.show').forEach(el => el.classList.remove('show'));
    
    // Validate required fields
    const requiredFields = ['email', 'password', 'fname', 'lname', 'sex', 'phone', 'wilaya', 'city'];
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            showFieldError(`${userType}-${field}`, `Please fill in the ${field} field`);
            isValid = false;
        } else {
            clearFieldError(`${userType}-${field}`);
        }
    });
    
    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
        showFieldError(`${userType}-email`, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation
    if (formData.phone && !validatePhone(formData.phone)) {
        showFieldError(`${userType}-phone`, 'Please enter a valid Algerian phone number (e.g., 0551234567)');
        isValid = false;
    }
    
    // Additional doctor validations
    if (userType === 'doctor') {
        if (!formData.specialty) {
            showFieldError('doctor-specialty', 'Please select a specialty');
            isValid = false;
        }
        
        if (!formData.diploma) {
            showFieldError('doctor-diploma', 'Please upload your diploma');
            isValid = false;
        }
        
        if (formData.mapLink && !validateURL(formData.mapLink)) {
            showFieldError('doctor-map-link', 'Please enter a valid URL');
            isValid = false;
        }
    }
    
    return isValid;
}

// ========== FORM SUBMISSION ==========

/**
 * Collect form data
 * @param {string} userType - 'doctor' or 'patient'
 * @returns {Object} Form data
 */
function collectFormData(userType) {
    const formData = {
        email: document.getElementById(`${userType}-email`).value,
        password: document.getElementById(`${userType}-password`).value,
        fname: document.getElementById(`${userType}-fname`).value,
        lname: document.getElementById(`${userType}-lname`).value,
        sex: document.getElementById(`${userType}-sex`).value,
        phone: document.getElementById(`${userType}-phone`).value,
        wilaya: document.getElementById(`${userType}-wilaya`).value,
        city: document.getElementById(`${userType}-city`).value,
        userType: userType,
        timestamp: new Date().toISOString()
    };
    
    // Additional doctor fields
    if (userType === 'doctor') {
        formData.specialty = document.getElementById('doctor-specialty').value;
        formData.diploma = document.getElementById('doctor-diploma').files[0];
        formData.mapLink = document.getElementById('doctor-map-link').value;
    }
    
    return formData;
}

/**
 * Handle form submission
 * @param {Event} event - Submit event
 * @param {string} userType - 'doctor' or 'patient'
 */
async function handleSubmit(event, userType) {
    event.preventDefault();
    
    const formData = collectFormData(userType);
    
    if (!validateForm(formData, userType)) {
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;
    
    try {
        // Here you would typically send data to your server
        // For now, we'll simulate a successful registration
        console.log('Registration data:', formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        alert(`Registration successful! Welcome, ${formData.fname}. You will be redirected to login.`);
        
        // Redirect to login page
        window.location.href = CONFIG.redirectPaths.login;
        
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please check your connection and try again.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ========== ERROR HANDLING ==========

/**
 * Show error message to user
 * @param {string} message - Error message
 */
function showError(message) {
    // You can implement a better error display system here
    console.error('User error:', message);
    // For now, we'll just use alert
    if (message.includes('Failed to load')) {
        alert('Warning: Some data could not be loaded. Using fallback data.');
    }
}

// ========== EVENT LISTENERS ==========

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.getAttribute('data-type');
            switchTab(type);
        });
    });
    
    // Wilaya change events
    document.querySelectorAll('select[id$="-wilaya"]').forEach(select => {
        select.addEventListener('change', () => {
            const formType = select.id.split('-')[0]; // 'doctor' or 'patient'
            const wilaya = select.value;
            populateCities(formType, wilaya);
        });
    });
    
    // Form submissions
    document.getElementById('doctor-form').addEventListener('submit', (e) => handleSubmit(e, 'doctor'));
    document.getElementById('patient-form').addEventListener('submit', (e) => handleSubmit(e, 'patient'));
    
    // Navigation buttons
    document.getElementById('homeBtn').addEventListener('click', () => {
        window.location.href = CONFIG.redirectPaths.home;
    });
    
    document.getElementById('loginLink').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = CONFIG.redirectPaths.login;
    });
    
    // Real-time validation
    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('blur', function() {
            const id = this.id;
            if (id.includes('email') && this.value) {
                if (!validateEmail(this.value)) {
                    showFieldError(id, 'Please enter a valid email');
                } else {
                    clearFieldError(id);
                }
            }
            
            if (id.includes('phone') && this.value) {
                if (!validatePhone(this.value)) {
                    showFieldError(id, 'Please enter a valid Algerian phone number');
                } else {
                    clearFieldError(id);
                }
            }
        });
    });
}

// ========== INITIALIZATION ==========

/**
 * Initialize the application
 */
async function initializeApp() {
    console.log('Initializing CareLink Registration Form...');
    
    try {
        // Show loading state
        document.body.classList.add('loading');
        
        // Load data from CSV files
        await Promise.all([
            loadWilayaCityData(),
            loadSpecialties()
        ]);
        
        // Populate form fields
        populateWilayaDropdowns();
        populateSpecialtiesDropdown();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('CareLink Registration Form initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to initialize the application. Please refresh the page.');
        
        // Try to continue with fallback data
        populateWilayaDropdowns();
        populateSpecialtiesDropdown();
        setupEventListeners();
        
    } finally {
        // Remove loading state
        document.body.classList.remove('loading');
    }
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
