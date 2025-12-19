// Global variables
let currentStep = 1;
let selectedWilaya = '';
let selectedCity = '';
let selectedDoctor = null;
let selectedDate = null;
let selectedTime = '';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Data variables
let doctorsData = [];
let citiesData = [];
let appointmentsData = [];
let wilayaCityMap = {};

// Time slots
const timeSlots = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

// Fetch CSV data
async function fetchCSVData() {
    try {
        // Fetch doctor data
        const doctorResponse = await fetch('../../backend/data/doctor.csv');
        const doctorCSV = await doctorResponse.text();
        
        // Parse doctor CSV
        const doctorRows = doctorCSV.split('\n');
        const doctorHeaders = doctorRows[0].split(',');
        doctorsData = doctorRows.slice(1).filter(row => row.trim()).map(row => {
            const values = row.split(',');
            return doctorHeaders.reduce((obj, header, index) => {
                obj[header.trim()] = values[index] ? values[index].trim() : '';
                return obj;
            }, {});
        });

        // Fetch cities data
        const citiesResponse = await fetch('../../backend/data/cities.csv');
        const citiesCSV = await citiesResponse.text();
        
        // Parse cities CSV
        const cityRows = citiesCSV.split('\n').slice(1);
        citiesData = cityRows.filter(row => row.trim()).map(row => {
            const [wilaya, city] = row.split(',');
            return {
                wilaya: wilaya.trim(),
                city: city.trim()
            };
        });

        // Fetch appointments data
        const appointmentsResponse = await fetch('../../backend/data/appointments.csv');
        const appointmentsCSV = await appointmentsResponse.text();
        
        // Parse appointments CSV
        const appointmentRows = appointmentsCSV.split('\n').slice(1);
        appointmentsData = appointmentRows.filter(row => row.trim()).map(row => {
            const [id, patientId, doctorId, dateTime, status] = row.split(',');
            return {
                id: id.trim(),
                patientId: patientId.trim(),
                doctorId: doctorId.trim(),
                dateTime: dateTime.trim(),
                status: status.trim()
            };
        });

        // Organize cities by wilaya
        wilayaCityMap = citiesData.reduce((map, item) => {
            if (!map[item.wilaya]) {
                map[item.wilaya] = [];
            }
            if (!map[item.wilaya].includes(item.city)) {
                map[item.wilaya].push(item.city);
            }
            return map;
        }, {});

        return true;
    } catch (error) {
        console.error('Error fetching CSV data:', error);
        return false;
    }
}

// Get current patient ID (in a real app, this would come from login session)
function getCurrentPatientId() {
    // For demo, use the first patient ID
    // In production, get from session/localStorage
    return 'p1'; // Default to first patient
}

// Initialize
async function init() {
    try {
        // Add loading state
        document.body.classList.add('loading');
        
        // Fetch CSV data
        const success = await fetchCSVData();
        if (!success) {
            alert('Failed to load data. Please try again.');
            return;
        }
        
        // Populate wilayas dropdown
        populateWilayas();
        
        // Generate time slots
        generateTimeSlots();
        
        // Render calendar
        renderCalendar();
        
        // Setup event listeners
        setupEventListeners();
        
        // Remove loading state
        document.body.classList.remove('loading');
    } catch (error) {
        console.error('Error initializing page:', error);
        document.body.classList.remove('loading');
    }
}

function populateWilayas() {
    const wilayaSelect = document.getElementById('wilaya-select');
    const uniqueWilayas = [...new Set(citiesData.map(item => item.wilaya))].sort();
    
    uniqueWilayas.forEach(wilaya => {
        const option = document.createElement('option');
        option.value = wilaya;
        option.textContent = wilaya;
        wilayaSelect.appendChild(option);
    });
}

function handleWilayaChange() {
    const wilayaSelect = document.getElementById('wilaya-select');
    selectedWilaya = wilayaSelect.value;
    selectedCity = '';
    
    const cityGroup = document.getElementById('city-group');
    const citySelect = document.getElementById('city-select');
    
    if (selectedWilaya) {
        cityGroup.classList.remove('hidden');
        citySelect.innerHTML = '<option value="">Select a city</option>';
        
        if (wilayaCityMap[selectedWilaya]) {
            wilayaCityMap[selectedWilaya].sort().forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        }
    } else {
        cityGroup.classList.add('hidden');
    }
    
    document.getElementById('next-1').disabled = !selectedWilaya || !selectedCity;
}

function handleCityChange() {
    const citySelect = document.getElementById('city-select');
    selectedCity = citySelect.value;
    document.getElementById('next-1').disabled = !selectedCity;
}

function goToStep(step) {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`step-${i}`).classList.add('hidden');
    }
    
    // Show current step
    document.getElementById(`step-${step}`).classList.remove('hidden');
    currentStep = step;
    
    // Update progress bar
    updateProgressBar(step);
    
    // Update card header
    const titles = ['Select Location', 'Choose Doctor', 'Pick Date & Time', 'Confirm Appointment'];
    const descriptions = [
        'First select your wilaya, then choose your city',
        'Select a doctor based on your location',
        'Choose your preferred date and time',
        'Review and confirm your appointment details'
    ];
    document.getElementById('card-title').textContent = titles[step - 1];
    document.getElementById('card-description').textContent = descriptions[step - 1];
    
    // Load step content
    if (step === 2) {
        loadDoctors();
    } else if (step === 4) {
        showConfirmation();
    }
}

function updateProgressBar(step) {
    for (let i = 1; i <= 4; i++) {
        const circle = document.getElementById(`step-${i}-circle`);
        if (i <= step) {
            circle.classList.remove('inactive');
            circle.classList.add('active');
        } else {
            circle.classList.remove('active');
            circle.classList.add('inactive');
        }
        
        if (i < 4) {
            const line = document.getElementById(`line-${i}`);
            if (i < step) {
                line.classList.remove('inactive');
                line.classList.add('active');
            } else {
                line.classList.remove('active');
                line.classList.add('inactive');
            }
        }
    }
}

function loadDoctors() {
    const doctorsList = document.getElementById('doctors-list');
    doctorsList.innerHTML = '';
    
    const doctors = doctorsData.filter(d => d.Wilaya === selectedWilaya && d.City === selectedCity);
    
    if (doctors.length === 0) {
        doctorsList.innerHTML = '<p class="no-doctors">No doctors available in this location. Please select a different city or wilaya.</p>';
        return;
    }
    
    doctors.forEach(doctor => {
        const card = document.createElement('div');
        card.className = 'doctor-card';
        if (selectedDoctor && selectedDoctor.ID === doctor.ID) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <div class="doctor-card-header">
                <div class="doctor-info">
                    <h3>Dr. ${doctor.First_Name} ${doctor.Last_Name}</h3>
                    <p class="doctor-specialty">${doctor.Speciality}</p>
                    <p class="doctor-phone">📞 ${doctor['Phone Number']}</p>
                </div>
                <div class="radio-circle">
                    <svg class="radio-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => selectDoctor(doctor));
        doctorsList.appendChild(card);
    });
}

function selectDoctor(doctor) {
    selectedDoctor = doctor;
    loadDoctors();
    document.getElementById('next-2').disabled = false;
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let html = `
        <div class="calendar-header">
            <button class="calendar-nav" id="prev-month">←</button>
            <span>${monthNames[currentMonth]} ${currentYear}</span>
            <button class="calendar-nav" id="next-month">→</button>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-label">Sun</div>
            <div class="calendar-day-label">Mon</div>
            <div class="calendar-day-label">Tue</div>
            <div class="calendar-day-label">Wed</div>
            <div class="calendar-day-label">Thu</div>
            <div class="calendar-day-label">Fri</div>
            <div class="calendar-day-label">Sat</div>
    `;
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        const isPast = date < today;
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
        const isDisabled = isPast || isWeekend;
        const isSelected = selectedDate && 
            selectedDate.getDate() === day && 
            selectedDate.getMonth() === currentMonth && 
            selectedDate.getFullYear() === currentYear;
        
        let className = 'calendar-day';
        if (isDisabled) className += ' disabled';
        if (isSelected) className += ' selected';
        
        html += `<div class="${className}" data-day="${day}" data-disabled="${isDisabled}">${day}</div>`;
    }
    
    html += '</div>';
    calendar.innerHTML = html;
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function selectDate(day) {
    selectedDate = new Date(currentYear, currentMonth, day);
    renderCalendar();
    
    document.getElementById('time-group').classList.remove('hidden');
    updateNextButton3();
}

function generateTimeSlots() {
    const timeSlotsContainer = document.getElementById('time-slots');
    timeSlotsContainer.innerHTML = '';
    
    timeSlots.forEach(time => {
        const slot = document.createElement('button');
        slot.className = 'time-slot';
        slot.textContent = time;
        slot.dataset.time = time;
        timeSlotsContainer.appendChild(slot);
    });
}

function selectTime(time) {
    selectedTime = time;
    document.querySelectorAll('.time-slot').forEach(slot => {
        if (slot.dataset.time === time) {
            slot.classList.add('selected');
        } else {
            slot.classList.remove('selected');
        }
    });
    updateNextButton3();
}

function updateNextButton3() {
    document.getElementById('next-3').disabled = !selectedDate || !selectedTime;
}

function showConfirmation() {
    const confirmation = document.getElementById('confirmation-details');
    const dateStr = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    confirmation.innerHTML = `
        <h3>Appointment Details</h3>
        <div class="confirmation-item">
            <p class="confirmation-label">Doctor</p>
            <p class="confirmation-value">Dr. ${selectedDoctor.First_Name} ${selectedDoctor.Last_Name}</p>
            <p class="specialty-value">${selectedDoctor.Speciality}</p>
        </div>
        <div class="confirmation-item">
            <p class="confirmation-label">Location</p>
            <p class="confirmation-value">${selectedCity}, ${selectedWilaya}</p>
        </div>
        <div class="confirmation-item">
            <p class="confirmation-label">Date</p>
            <p class="confirmation-value">${dateStr}</p>
        </div>
        <div class="confirmation-item">
            <p class="confirmation-label">Time</p>
            <p class="confirmation-value">${selectedTime}</p>
        </div>
        <div class="confirmation-item">
            <p class="confirmation-label">Contact</p>
            <p class="confirmation-value">${selectedDoctor['Phone Number']}</p>
        </div>
    `;
}

async function confirmAppointment() {
    try {
        // Create appointment data
        const patientId = getCurrentPatientId();
        const dateTimeStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}T${selectedTime}`;
        
        const appointmentData = {
            id: `a${Date.now()}`,
            patientId: patientId,
            doctorId: selectedDoctor.ID,
            dateTime: dateTimeStr,
            status: 'SCHEDULED'
        };
        
        // In a real app, you would send this to the server
        // For now, save to localStorage
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        appointments.push(appointmentData);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        alert('Appointment confirmed successfully!');
        window.location.href = 'patientdashboard.html';
    } catch (error) {
        console.error('Error confirming appointment:', error);
        alert('Failed to confirm appointment. Please try again.');
    }
}

function setupEventListeners() {
    // Wilaya and city select
    document.getElementById('wilaya-select').addEventListener('change', handleWilayaChange);
    document.getElementById('city-select').addEventListener('change', handleCityChange);
    
    // Step navigation buttons
    document.getElementById('next-1').addEventListener('click', () => goToStep(2));
    document.getElementById('back-2').addEventListener('click', () => goToStep(1));
    document.getElementById('next-2').addEventListener('click', () => goToStep(3));
    document.getElementById('back-3').addEventListener('click', () => goToStep(2));
    document.getElementById('next-3').addEventListener('click', () => goToStep(4));
    document.getElementById('back-4').addEventListener('click', () => goToStep(3));
    
    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
    
    // Date selection
    document.getElementById('calendar').addEventListener('click', (e) => {
        const dayElement = e.target.closest('.calendar-day');
        if (dayElement && !dayElement.classList.contains('disabled') && !dayElement.classList.contains('empty')) {
            const day = parseInt(dayElement.dataset.day);
            selectDate(day);
        }
    });
    
    // Time slot selection
    document.getElementById('time-slots').addEventListener('click', (e) => {
        const timeSlot = e.target.closest('.time-slot');
        if (timeSlot) {
            selectTime(timeSlot.dataset.time);
        }
    });
    
    // Confirm appointment
    document.getElementById('confirm-appointment').addEventListener('click', confirmAppointment);
    
    // Back to dashboard button
    document.querySelector('.back-btn').addEventListener('click', () => {
        window.location.href = 'patientdashboard.html';
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
