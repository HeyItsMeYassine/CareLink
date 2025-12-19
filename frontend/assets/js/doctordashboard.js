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
let currentDoctorId = '';

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

// ========== DATA LOADING FUNCTIONS ==========

async function loadAllData() {
    doctorsData = await loadCSV(CONFIG.csvPaths.doctors);
    appointmentsData = await loadCSV(CONFIG.csvPaths.appointments);
    patientsData = await loadCSV(CONFIG.csvPaths.patients);
    return { doctorsData, appointmentsData, patientsData };
}

function getDoctorById(doctorId) {
    const doctorNumber = doctorId.replace('d', '');
    const doctorCsvId = `ID${doctorNumber.padStart(3, '0')}`;
    
    return doctorsData.find(doctor => doctor.ID === doctorCsvId);
}

function getPatientById(patientId) {
    const patientNumber = patientId.replace('p', '');
    const patientCsvId = `ID${patientNumber.padStart(2, '0')}`;
    
    return patientsData.find(patient => patient.ID === patientCsvId);
}

function getDoctorAppointments(doctorId) {
    return appointmentsData.filter(appointment => appointment.doctorId === doctorId);
}

function formatAppointmentDateTime(dateTime) {
    const date = new Date(dateTime);
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    
    return {
        date: date.toLocaleDateString('en-US', options),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        fullDate: date
    };
}

function getStatusClass(status) {
    switch(status) {
        case 'SCHEDULED':
        case 'RESCHEDULED':
            return 'status-pending';
        case 'COMPLETED':
            return 'status-confirmed';
        case 'CANCELLED':
            return 'status-cancelled';
        default:
            return 'status-pending';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'SCHEDULED':
            return 'Scheduled';
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
    const specialtyElement = document.getElementById('specialtyText');
    
    if (currentUser && currentUser.id && welcomeElement) {
        const doctor = getDoctorById(currentUser.id);
        if (doctor) {
            welcomeElement.textContent = `Welcome, Dr. ${doctor.First_Name} ${doctor.Last_Name}!`;
            specialtyElement.textContent = `${doctor.Speciality} | ${doctor.City}, ${doctor.Wilaya}`;
        } else {
            welcomeElement.textContent = `Welcome, Dr. ${currentUser.name || ''}!`;
        }
    }
}

function updateStats() {
    const doctorAppointments = getDoctorAppointments(currentDoctorId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointmentsToday = doctorAppointments.filter(app => {
        const appDate = new Date(app.dateTime);
        appDate.setHours(0, 0, 0, 0);
        return appDate.getTime() === today.getTime() && 
               (app.status === 'SCHEDULED' || app.status === 'RESCHEDULED');
    }).length;
    
    const pendingAppointments = doctorAppointments.filter(app => 
        app.status === 'SCHEDULED' || app.status === 'RESCHEDULED'
    ).length;
    
    const uniquePatients = new Set(
        doctorAppointments.map(app => app.patientId)
    ).size;
    
    document.getElementById('todayAppointments').textContent = appointmentsToday;
    document.getElementById('pendingAppointments').textContent = pendingAppointments;
    document.getElementById('totalPatients').textContent = uniquePatients;
}

function renderAppointments() {
    const container = document.getElementById('appointmentsContainer');
    const doctorAppointments = getDoctorAppointments(currentDoctorId);
    
    // Sort by date
    doctorAppointments.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    
    if (doctorAppointments.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <p>No appointments scheduled yet.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    doctorAppointments.forEach(appointment => {
        const patient = getPatientById(appointment.patientId);
        if (!patient) return;
        
        const { date, time } = formatAppointmentDateTime(appointment.dateTime);
        const statusClass = getStatusClass(appointment.status);
        const statusText = getStatusText(appointment.status);
        
        html += `
            <div class="appointment-item">
                <div class="appointment-details">
                    <h4>${patient['First Name']} ${patient['Last Name']}</h4>
                    <p>${date} at ${time}</p>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="appointment-actions">
                    ${appointment.status === 'SCHEDULED' || appointment.status === 'RESCHEDULED' ? `
                        <button class="btn-small btn-confirm" data-appointment-id="${appointment.id}">Confirm</button>
                        <button class="btn-small btn-cancel" data-appointment-id="${appointment.id}">Cancel</button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    setupAppointmentEventListeners();
}

function renderAvailability() {
    const container = document.getElementById('availabilityContainer');
    
    // Default availability - in a real app, this would come from a database
    const availability = [
        { day: 'Monday', morning: '09:00 - 12:00', afternoon: '14:00 - 18:00' },
        { day: 'Tuesday', morning: '09:00 - 12:00', afternoon: '14:00 - 18:00' },
        { day: 'Wednesday', morning: '09:00 - 12:00', afternoon: '14:00 - 18:00' },
        { day: 'Thursday', morning: '09:00 - 12:00', afternoon: '14:00 - 18:00' },
        { day: 'Friday', morning: '09:00 - 12:00', afternoon: '14:00 - 16:00' }
    ];
    
    let html = '';
    
    availability.forEach(day => {
        html += `
            <div class="day-card">
                <div class="day-header">
                    <h3>${day.day}</h3>
                    <button class="btn-edit" data-day="${day.day.toLowerCase()}">Edit</button>
                </div>
                <div class="time-slots">
                    <div class="time-slot">
                        <h4>Morning</h4>
                        <p>${day.morning}</p>
                    </div>
                    <div class="time-slot">
                        <h4>Afternoon</h4>
                        <p>${day.afternoon}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ========== APPOINTMENT MANAGEMENT FUNCTIONS ==========

function confirmAppointment(appointmentId) {
    if (confirm('Confirm this appointment?')) {
        const appointmentIndex = appointmentsData.findIndex(app => app.id === appointmentId);
        if (appointmentIndex !== -1) {
            appointmentsData[appointmentIndex].status = 'COMPLETED';
            updateStats();
            renderAppointments();
        }
    }
}

function cancelDoctorAppointment(appointmentId) {
    if (confirm('Cancel this appointment?')) {
        const appointmentIndex = appointmentsData.findIndex(app => app.id === appointmentId);
        if (appointmentIndex !== -1) {
            appointmentsData[appointmentIndex].status = 'CANCELLED';
            updateStats();
            renderAppointments();
        }
    }
}

// ========== NAVIGATION FUNCTIONS ==========

function goToProfile() {
    window.location.href = 'doctor-profile.html';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

function goToHome() {
    window.location.href = '../index.html';
}

function goToAddAppointment() {
    window.location.href = 'add-appointment.html';
}

// ========== TAB SWITCHING ==========

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('show');
}

// ========== EVENT LISTENERS SETUP ==========

function setupEventListeners() {
    document.getElementById('profileBtn')?.addEventListener('click', toggleProfileDropdown);
    document.getElementById('editProfileBtn')?.addEventListener('click', goToProfile);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('homeBtn')?.addEventListener('click', goToHome);
    document.getElementById('addAppointmentBtn')?.addEventListener('click', goToAddAppointment);
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = tab.getAttribute('data-tab');
            switchTab.call(tab, tabName);
        });
    });
    
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
    document.querySelectorAll('.btn-confirm').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-appointment-id');
            confirmAppointment(appointmentId);
        });
    });
    
    document.querySelectorAll('.btn-cancel').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-appointment-id');
            cancelDoctorAppointment(appointmentId);
        });
    });
}

// ========== DASHBOARD INITIALIZATION ==========

async function initializeDashboard() {
    console.log('Initializing Doctor Dashboard...');
    
    try {
        document.body.classList.add('loading');
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id || currentUser.type !== 'doctor') {
            window.location.href = 'login.html';
            return;
        }
        
        currentDoctorId = currentUser.id;
        
        await loadAllData();
        
        const doctor = getDoctorById(currentDoctorId);
        if (!doctor) {
            console.error('Doctor not found:', currentDoctorId);
            alert('Doctor data not found. Please contact support.');
            return;
        }
        
        updateWelcomeMessage();
        updateStats();
        renderAppointments();
        renderAvailability();
        setupEventListeners();
        
        console.log('Doctor Dashboard initialized for:', doctor.First_Name);
        
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        alert('Failed to load dashboard data. Please refresh the page.');
        
    } finally {
        document.body.classList.remove('loading');
    }
}

document.addEventListener('DOMContentLoaded', initializeDashboard);
