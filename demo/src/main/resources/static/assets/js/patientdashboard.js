// patientdashboard.js (UPDATED)
// - Blue/White/Green UI friendly
// - Uses Bootstrap Icons in generated buttons
// - Fixes "Unknown Doctor" by fetching doctor info when API doesn't return it
//   (uses /api/doctor/{id} and caches results)

document.addEventListener('DOMContentLoaded', function () {
    console.log('Patient dashboard loaded');

    checkUserSession();

    loadPatientDashboard();
    loadCurrentUser();

    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.style.display =
                profileDropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
            profileDropdown.style.display = 'none';
        });
    }

    // Navigation
    document.getElementById('editProfileBtn')?.addEventListener('click', () => {
        window.location.href = '/patient/profile';
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await logout();
    });

    document.getElementById('homeBtn')?.addEventListener('click', () => {
        window.location.href = '/patient/dashboard';
    });

    document.getElementById('newAppointmentBtn')?.addEventListener('click', () => {
        window.location.href = '/appointment';
    });

    // Handle appointment actions (Cancel / Reschedule)
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.classList.contains('cancel-btn')) {
            const appointmentId = btn.dataset.id;
            const status = (btn.dataset.status || '').toUpperCase();

            if (status === 'PENDING') {
                showToast('You must wait for the doctor response before cancelling.', 'warning');
                return;
            }
            cancelAppointment(appointmentId);
        }

        if (btn.classList.contains('reschedule-btn')) {
            const appointmentId = btn.dataset.id;
            const status = (btn.dataset.status || '').toUpperCase();

            if (status === 'PENDING') {
                showToast('You must wait for the doctor response before rescheduling.', 'warning');
                return;
            }
            openRescheduleModal(appointmentId);
        }
    });

    // Handle reschedule form submission
    const rescheduleForm = document.getElementById('reschedule-form');
    if (rescheduleForm) {
        rescheduleForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await rescheduleAppointment();
        });
    }

    // Auto-refresh appointments every 30 seconds
    setInterval(() => {
        loadAppointments();
    }, 30000);
});

// ========== USER SESSION FUNCTIONS ==========

async function checkUserSession() {
    try {
        const response = await fetch('/api/session/current');
        if (response.ok) {
            const user = await response.json();

            if (user.userType !== 'patient') {
                if (user.userType === 'doctor') {
                    window.location.href = '/doctor/dashboard';
                } else {
                    window.location.href = '/login';
                }
            }
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error checking session:', error);
        window.location.href = '/login';
    }
}

async function loadCurrentUser() {
    try {
        const response = await fetch('/api/session/current');
        if (response.ok) {
            const user = await response.json();
            if (user.userType === 'patient' && user.name) {
                document.getElementById('welcomeMessage').textContent = `Welcome, ${user.name}!`;
            }
        }
    } catch (error) {
        console.error('Error loading current user:', error);
    }
}

async function logout() {
    try {
        await fetch('/api/session/logout');
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login';
    }
}

// ========== DASHBOARD DATA FUNCTIONS ==========

async function loadPatientDashboard() {
    await Promise.all([
        loadPatientStats(),
        loadAppointments()
    ]);
}

async function loadPatientStats() {
    try {
        const response = await fetch('/api/patient/stats');
        if (response.ok) {
            const data = await response.json();

            if (data.upcomingAppointments !== undefined) {
                document.getElementById('upcomingCount').textContent = data.upcomingAppointments;
            }
            if (data.completedAppointments !== undefined) {
                document.getElementById('completedCount').textContent = data.completedAppointments;
            }
        }
    } catch (error) {
        console.error('Error loading patient stats:', error);
    }
}

async function loadAppointments() {
    try {
        const response = await fetch('/api/patient/appointments');
        const appointments = await response.json();
        await displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        showToast('Failed to load appointments', 'danger');
    }
}

// ========== DOCTOR INFO LOOKUP (Fix Unknown Doctor) ==========

const doctorCache = new Map(); // doctorId -> { name, speciality, phone }

async function getDoctorInfoById(doctorId) {
    if (!doctorId) return null;
    if (doctorCache.has(doctorId)) return doctorCache.get(doctorId);

    try {
        const res = await fetch(`/api/doctor/${encodeURIComponent(doctorId)}`);
        if (!res.ok) {
            doctorCache.set(doctorId, null);
            return null;
        }
        const d = await res.json();

        const name = `${d.firstName || ''} ${d.lastName || ''}`.trim();
        const info = {
            name: name || 'Unknown Doctor',
            speciality: d.speciality || '',
            phone: d.phone || ''
        };

        doctorCache.set(doctorId, info);
        return info;
    } catch (e) {
        console.error('Error loading doctor info:', e);
        doctorCache.set(doctorId, null);
        return null;
    }
}

// ========== UI RENDERING ==========

async function displayAppointments(appointments) {
    const container = document.getElementById('appointmentsContainer');

    if (!appointments || appointments.length === 0) {
        container.innerHTML = `
            <div class="no-appointments">
                <p>You don't have any appointments scheduled.</p>
                <button class="btn-app" onclick="window.location.href='/appointment'">
                    <i class="bi bi-plus-circle"></i>
                    Book Your First Appointment
                </button>
            </div>
        `;
        return;
    }

    const cards = await Promise.all(appointments.map(async (appointment) => {
        const status = (appointment.status || 'PENDING').toUpperCase();

        // Parse date/time robustly
        const raw = appointment.dateTime || appointment.dateTimeString || appointment.date;
        const dt = raw ? new Date(raw) : null;
        const dateStr = dt ? dt.toLocaleDateString() : (appointment.date || '—');
        const timeStr = dt ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (appointment.time || '—');

        // Doctor info (support multiple possible keys)
        let doctorName =
            appointment.doctorName ||
            appointment.doctorFullName ||
            [appointment.doctorFirstName, appointment.doctorLastName].filter(Boolean).join(' ') ||
            '';

        let doctorSpeciality =
            appointment.doctorSpeciality ||
            appointment.doctorSpecialty ||
            appointment.speciality ||
            appointment.specialty ||
            '';

        let doctorPhone =
            appointment.doctorPhone ||
            appointment.doctorPhoneNumber ||
            appointment.phone ||
            '';

        // If API didn't return doctor info, fetch it using doctorId
        const doctorId = appointment.doctorId || appointment.doctorID;
        if ((!doctorName || doctorName.toLowerCase().includes('unknown')) || (!doctorSpeciality && !doctorPhone)) {
            const info = await getDoctorInfoById(doctorId);
            if (info) {
                doctorName = doctorName || info.name;
                doctorSpeciality = doctorSpeciality || info.speciality;
                doctorPhone = doctorPhone || info.phone;
            }
        }

        doctorName = doctorName || 'Unknown Doctor';

        const statusClass = getStatusClass(status);
        const canPatientModify = canPatientModifyAppointment(status);

        return `
            <div class="card mb-3 appointment-card" data-appointment-id="${escapeHtml(appointment.id)}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div style="flex: 1;">

                            <div class="doctor-block">
                                <div class="doctor-name">${escapeHtml(doctorName)}</div>
                                ${doctorSpeciality ? `<div class="doctor-speciality"><i class="bi bi-award"></i> ${escapeHtml(doctorSpeciality)}</div>` : ''}
                                ${doctorPhone ? `<div class="doctor-phone"><i class="bi bi-telephone"></i> ${escapeHtml(doctorPhone)}</div>` : ''}
                            </div>

                            <div class="appointment-details mt-2">
                                <div class="mb-1">
                                    <strong><i class="bi bi-calendar-event"></i> Date:</strong> ${escapeHtml(dateStr)}
                                </div>
                                <div class="mb-1">
                                    <strong><i class="bi bi-clock"></i> Time:</strong> ${escapeHtml(timeStr)}
                                </div>

                                <div class="mt-2">
                                    <span class="badge ${statusClass}">${escapeHtml(status)}</span>
                                </div>

                                ${status === 'PENDING' ? `
                                    <div class="appointment-waiting">
                                        <i class="bi bi-hourglass-split"></i> Waiting for doctor response...
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        ${canPatientModify ? `
                            <div class="btn-group">
                                <button class="btn btn-outline-warning btn-sm reschedule-btn"
                                        data-id="${escapeHtml(appointment.id)}"
                                        data-status="${escapeHtml(status)}">
                                    <i class="bi bi-arrow-repeat"></i> Reschedule
                                </button>
                                <button class="btn btn-outline-danger btn-sm cancel-btn"
                                        data-id="${escapeHtml(appointment.id)}"
                                        data-status="${escapeHtml(status)}">
                                    <i class="bi bi-x-circle"></i> Cancel
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }));

    container.innerHTML = cards.join('');
}

// ========== APPOINTMENT ACTIONS ==========

async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
        const response = await fetch(`/api/appointments/${encodeURIComponent(appointmentId)}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            showToast('Appointment cancelled successfully', 'success');
            loadPatientStats();
            loadAppointments();
        } else {
            showToast(result.message || 'Failed to cancel appointment', 'danger');
        }
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showToast('Error cancelling appointment', 'danger');
    }
}

function openRescheduleModal(appointmentId) {
    document.getElementById('reschedule-appointment-id').value = appointmentId;

    const dateInput = document.getElementById('new-appointment-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;

    const timeInput = document.getElementById('new-appointment-time');
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);
    timeInput.value = `${String(nextHour.getHours()).padStart(2, '0')}:00`;

    const pendingInfo = document.getElementById('pendingInfoBox');
    if (pendingInfo) pendingInfo.style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('rescheduleModal'));
    modal.show();
}

async function rescheduleAppointment() {
    const appointmentId = document.getElementById('reschedule-appointment-id').value;
    const newDate = document.getElementById('new-appointment-date').value;
    const newTime = document.getElementById('new-appointment-time').value;

    if (!newDate || !newTime) {
        showToast('Please select both date and time', 'warning');
        return;
    }

    try {
        const response = await fetch(`/api/appointments/${encodeURIComponent(appointmentId)}/reschedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newDate, newTime })
        });

        const result = await response.json();

        if (result.success) {
            showToast('Appointment rescheduled successfully', 'success');

            const modal = bootstrap.Modal.getInstance(document.getElementById('rescheduleModal'));
            if (modal) modal.hide();

            loadPatientStats();
            loadAppointments();
        } else {
            showToast(result.message || 'Failed to reschedule appointment', 'danger');
        }
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        showToast('Error rescheduling appointment', 'danger');
    }
}

// ========== RULES HELPERS ==========

function canPatientModifyAppointment(status) {
    const s = (status || '').toUpperCase();

    if (s === 'PENDING') return false;
    if (s === 'CANCELLED' || s === 'COMPLETED') return false;

    if (s === 'CONFIRMED' || s === 'RESCHEDULED') return true;
    if (s === 'SCHEDULED') return true;

    return false;
}

function getStatusClass(status) {
    if (!status) return 'bg-secondary';

    switch (status.toUpperCase()) {
        case 'PENDING':
            return 'bg-warning text-dark';
        case 'CONFIRMED':
            return 'bg-success';
        case 'SCHEDULED':
            return 'bg-primary';
        case 'RESCHEDULED':
            return 'bg-info text-dark';
        case 'COMPLETED':
            return 'bg-success';
        case 'CANCELLED':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// ========== TOAST ==========

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${escapeHtml(message)}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    container.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', function () {
        this.remove();
    });
}

// Safe HTML output in cards
function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
}

// globals if needed
window.cancelAppointment = cancelAppointment;
window.openRescheduleModal = openRescheduleModal;
