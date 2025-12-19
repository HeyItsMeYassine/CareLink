// ========== CONFIGURATION ==========
const CONFIG = {
    csvPaths: {
        doctors: '../../backend/data/doctors.csv',
        appointments: '../../backend/data/appointments.csv',
        patients: '../../backend/data/patients.csv'
    }
};

// ========== DATA STORAGE ==========
let doctorsData = [];
let appointmentsData = [];
let patientsData = [];
let currentPatientId = '';

// ========== CSV PARSING FUNCTIONS ==========

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

async function loadAllData() {
    doctorsData = await loadCSV(CONFIG.csvPaths.doctors);
    appointmentsData = await loadCSV(CONFIG.csvPaths.appointments);
    patientsData = await loadCSV(CONFIG.csvPaths.patients);
    return { doctorsData, appointmentsData, patientsData };
}

function getPatientById(patientId) {
    const patientNumber = patientId.replace('p', '');
    const patientCsvId = `ID${patientNumber.padStart(2, '0')}`;
    
    return patientsData.find(patient => patient.ID === patientCsvId);
}

function getDoctorById(doctorId) {
    const doctorNumber = doctorId.replace('d', '');
    const doctorCsvId = `ID${doctorNumber.padStart(3, '0')}`;
    
    return doctorsData.find(doctor => doctor.ID === doctorCsvId);
}

function getPatientAppointments(patientId) {
    return appointmentsData.filter(appointment => appointment.patientId === patientId);
}

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

function getStatusClass(status) {
    switch(status) {
        case 'SCHEDULED':
        case 'RESCHEDULED':
            return 'status-upcoming';
        case 'COMPLETED':
            return 'status-completed';
        case 'CANCELLED':
            return 'status-cancelled';
        default:
            return 'status-upcoming';
    }
}

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

function updateWelcomeMessage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const welcomeElement = document.getElementById('welcomeMessage');
    
    if (currentUser && currentUser.patientId && welcomeElement) {
        const patient = getPatientById(currentUser.patientId);
        if (patient) {
            welcomeElement.textContent = `Welcome, ${patient['First Name']}!`;
        } else {
            welcomeElement.textContent = `Welcome, ${currentUser.name || 'Patient'}!`;
        }
    } else if (welcomeElement) {
        welcomeElement.textContent = 'Welcome to CareLink!';
    }
}

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

function toggleLocation(appointmentId) {
    const locationContainer = document.getElementById(`location-${appointmentId}`);
    if (locationContainer) {
        locationContainer.classList.toggle('show');
    }
}

function cancelAppointment(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const appointmentIndex = appointmentsData.findIndex(app => app.id === appointmentId);
        if (appointmentIndex !== -1) {
            appointmentsData[appointmentIndex].status = 'CANCELLED';
            
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
            
            updateStats();
        }
    }
}

// ========== NAVIGATION FUNCTIONS ==========

function goToProfile() {
    window.location.href = 'patient-profile.html';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

function goToHome() {
    window.location.href = '../index.html';
}

function goToNewAppointment() {
    window.location.href = 'main.html';
}

// ========== EVENT LISTENERS SETUP ==========

function setupEventListeners() {
    document.getElementById('profileBtn')?.addEventListener('click', toggleProfileDropdown);
    document.getElementById('editProfileBtn')?.addEventListener('click', goToProfile);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('homeBtn')?.addEventListener('click', goToHome);
    document.getElementById('newAppointmentBtn')?.addEventListener('click', goToNewAppointment);
    
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
    document.querySelectorAll('.btn-location').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-appointment-id');
            toggleLocation(appointmentId);
        });
    });
    
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
        document.body.classList.add('loading');
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.patientId) {
            window.location.href = 'login.html';
            return;
        }
        
        currentPatientId = currentUser.patientId;
        
        await loadAllData();
        
        const patient = getPatientById(currentPatientId);
        if (!patient) {
            console.error('Patient not found:', currentPatientId);
            alert('Patient data not found. Please contact support.');
            return;
        }
        
        updateWelcomeMessage();
        updateStats();
        renderAppointments();
        setupEventListeners();
        
        console.log('Patient Dashboard initialized for patient:', patient['First Name']);
        
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        alert('Failed to load dashboard data. Please refresh the page.');
        
    } finally {
        document.body.classList.remove('loading');
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', initializeDashboard);
