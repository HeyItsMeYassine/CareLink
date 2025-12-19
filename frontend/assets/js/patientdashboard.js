// ========== CONFIGURATION ==========
const CONFIG = {
    csvPaths: {
        doctors: '../../backend/data/doctors.csv',
        appointments: '../../backend/data/appointments.csv'
    }
};

// ========== DATA STORAGE ==========
let doctorsData = [];
let appointmentsData = [];
let currentPatientId = 'p1'; // Default - you should set this based on logged-in user

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
        return [];
    }
}

// ========== DATA LOADING FUNCTIONS ==========

/**
 * Load doctors data
 */
async function loadDoctorsData() {
    doctorsData = await loadCSV(CONFIG.csvPaths.doctors);
    return doctorsData;
}

/**
 * Load appointments data
 */
async function loadAppointmentsData() {
    appointmentsData = await loadCSV(CONFIG.csvPaths.appointments);
    return appointmentsData;
}

/**
 * Get doctor info by ID
 * @param {string} doctorId - Doctor ID (e.g., "d1", "d2")
 * @returns {Object} Doctor object
 */
function getDoctorById(doctorId) {
    // Convert doctorId like "d1" to "ID001" format
    const doctorNumber = doctorId.replace('d', '');
    const doctorCsvId = `ID${doctorNumber.padStart(3, '0')}`;
    
    return doctorsData.find(doctor => doctor.ID === doctorCsvId);
}

/**
 * Get patient appointments
 * @param {string} patientId - Patient ID
 * @returns {Array} Filtered appointments
 */
function getPatientAppointments(patientId) {
    return appointmentsData.filter(appointment => appointment.patientId === patientId);
}

/**
 * Format date for display
 * @param {string} dateTime - ISO date string
 * @returns {Object} Formatted date and time
 */
function formatAppointmentDateTime(dateTime) {
    const date = new Date(dateTime);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    return {
        date: date.toLocaleDateString('en-US', options),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
}

/**
 * Get status badge class
 * @param {string} status - Appointment status
 * @returns {string} CSS class for status badge
 */
function getStatusClass(status) {
    switch(status) {
        case 'SCHEDULED':
            return 'status-upcoming';
        case 'COMPLETED':
            return 'status-completed';
        case 'CANCELLED':
            return 'status-cancelled';
        case 'RESCHEDULED':
            return 'status-upcoming';
        default:
            return 'status-upcoming';
    }
}

/**
 * Get status display text
 * @param {string} status - Appointment status
 * @returns {string} Display text
 */
function getStatusText(status) {
    switch(status) {
        case 'SCHEDULED':
            return 'Upcoming';
        case 'COMPLETED':
            return 'Completed';
        case 'CANCELLED':
            return 'Cancelled';
        case 'RESCHEDULED':
            return 'Rescheduled';
        default:
            return status;
    }
}

// ========== UI RENDERING FUNCTIONS ==========

/**
 * Update welcome message
 */
function updateWelcomeMessage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const welcomeElement = document.getElementById('welcomeMessage');
    
    if (currentUser && currentUser.name && welcomeElement) {
        welcomeElement.textContent = `Welcome, ${currentUser.name}!`;
    }
}

/**
 * Update stats counters
 */
function updateStats() {
    const patientAppointments = getPatientAppointments(currentPatientId);
    
    const upcomingCount = patientAppointments.filter(app => 
        app.status === 'SCHEDULED' || app.status === 'RESCHEDULED'
    ).length;
    
    const completedCount = patientAppointments.filter(app => 
        app.status === 'COMPLETED'
    ).length;
    
    document.getElementById('upcomingCount').textContent = upcomingCount;
    document.getElementById('completedCount').textContent = completedCount;
}

/**
 * Render appointments
 */
function renderAppointments() {
    const container = document.getElementById('appointmentsContainer');
    const patientAppointments = getPatientAppointments(currentPatientId);
    
    if (patientAppointments.length === 0) {
        container.innerHTML = `
            <div class="no-appointments">
                <p>You don't have any appointments yet.</p>
                <button class="btn-primary" id="bookFirstAppointmentBtn">Book your first appointment</button>
            </div>
        `;
        
        document.getElementById('bookFirstAppointmentBtn')?.addEventListener('click', goToNewAppointment);
        return;
    }
    
    let html = '';
    
    patientAppointments.forEach(appointment => {
        const doctor = getDoctorById(appointment.doctorId);
        if (!doctor) return;
        
        const { date, time } = formatAppointmentDateTime(appointment.dateTime);
        const statusClass = getStatusClass(appointment.status);
        const statusText = getStatusText(appointment.status);
        
        html += `
            <div class="appointment-card" data-appointment-id="${appointment.id}">
                <div class="appointment-header">
                    <div class="doctor-info">
                        <h3>Dr. ${doctor.First_Name} ${doctor.Last_Name}</h3>
                        <p>${doctor.Speciality}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>

                <div class="appointment-details">
                    <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <span>${date}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">🕐</span>
                        <span>${time}</span>
                    </div>
                </div>

                <div class="appointment-address">
                    📍 ${doctor.City}, ${doctor.Wilaya}
                </div>

                ${appointment.status === 'SCHEDULED' || appointment.status === 'RESCHEDULED' ? `
                    <div class="appointment-actions">
                        <button class="btn btn-location" data-appointment-id="${appointment.id}">View Location</button>
                        <button class="btn btn-cancel" data-appointment-id="${appointment.id}">Cancel</button>
                    </div>

                    <div class="location-link-container" id="location-${appointment.id}">
                        <a href="${doctor.Location_Link}" target="_blank" class="location-link">${doctor.Location_Link}</a>
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    setupAppointmentEventListeners();
}

// ========== APPOINTMENT MANAGEMENT FUNCTIONS ==========

/**
 * Toggle location display
 * @param {string} appointmentId - Appointment ID
 */
function toggleLocation(appointmentId) {
    const locationContainer = document.getElementById(`location-${appointmentId}`);
    if (locationContainer) {
        locationContainer.classList.toggle('show');
    }
}

/**
 * Cancel appointment
 * @param {string} appointmentId - Appointment ID
 */
function cancelAppointment(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        // Find and update the appointment in local data
        const appointmentIndex = appointmentsData.findIndex(app => app.id === appointmentId);
        if (appointmentIndex !== -1) {
            appointmentsData[appointmentIndex].status = 'CANCELLED';
            
            // Update UI
            const card = document.querySelector(`[data-appointment-id="${appointmentId}"]`);
            if (card) {
                const statusBadge = card.querySelector('.status-badge');
                statusBadge.textContent = 'Cancelled';
                statusBadge.className = 'status-badge status-cancelled';

                const actionsContainer = card.querySelector('.appointment-actions');
                if (actionsContainer) {
                    actionsContainer.innerHTML = '<p style="color: #64748b;">This appointment has been cancelled</p>';
                }
            }
            
            // Update stats
            updateStats();
        }
    }
}

// ========== NAVIGATION FUNCTIONS ==========

function goToProfile() {
    window.location.href = 'patient-profile.html';
}

function logout() {
    // Clear session data
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

function goToHome() {
    window.location.href = '../index.html';
}

function goToNewAppointment() {
    window.location.href = 'main.html'; // Or your appointment booking page
}

// ========== EVENT LISTENERS SETUP ==========

function setupEventListeners() {
    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', toggleProfileDropdown);
    }
    
    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', goToProfile);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Home button
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', goToHome);
    }
    
    // New appointment button
    const newAppointmentBtn = document.getElementById('newAppointmentBtn');
    if (newAppointmentBtn) {
        newAppointmentBtn.addEventListener('click', goToNewAppointment);
    }
    
    // Close dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (!event.target.closest('.profile-container')) {
            const dropdown = document.getElementById('profileDropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }
    });
}

function setupAppointmentEventListeners() {
    // Location buttons
    document.querySelectorAll('.btn-location').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-appointment-id');
            toggleLocation(appointmentId);
        });
    });
    
    // Cancel buttons
    document.querySelectorAll('.btn-cancel').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-appointment-id');
            cancelAppointment(appointmentId);
        });
    });
}

// ========== DASHBOARD INITIALIZATION ==========

async function initializeDashboard() {
    console.log('Initializing Patient Dashboard...');
    
    try {
        // Show loading state
        document.body.classList.add('loading');
        
        // Load data from CSV files
        await Promise.all([
            loadDoctorsData(),
            loadAppointmentsData()
        ]);
        
        // Update current patient ID (you should get this from session/localStorage)
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.patientId) {
            currentPatientId = currentUser.patientId;
        }
        
        // Update UI
        updateWelcomeMessage();
        updateStats();
        renderAppointments();
        setupEventListeners();
        
        console.log('Patient Dashboard initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        alert('Failed to load dashboard data. Please refresh the page.');
        
    } finally {
        // Remove loading state
        document.body.classList.remove('loading');
    }
}

// Toggle profile dropdown
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('show');
}

// Start the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);
