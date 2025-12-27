// static/assets/js/patientdashboard.js
// Tableau de bord patient : vérification session, stats, liste des rendez-vous, actions (annuler / reprogrammer) et notifications.

document.addEventListener('DOMContentLoaded', function () {

    /* =======================
       Démarrage
       ======================= */
    checkUserSession();

    loadPatientDashboard();
    loadCurrentUser();

    /* =======================
       Menu profil
       ======================= */
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

    /* =======================
       Navigation
       ======================= */
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

    /* =======================
       Actions sur rendez-vous
       ======================= */
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        // Annulation
        if (btn.classList.contains('cancel-btn')) {
            const appointmentId = btn.dataset.id;
            const status = (btn.dataset.status || '').toUpperCase();

            // Règle : on ne peut pas annuler si c'est encore en attente
            if (status === 'PENDING') {
                showToast('Veuillez attendre la réponse du médecin avant d’annuler.', 'warning');
                return;
            }
            cancelAppointment(appointmentId);
        }

        // Reprogrammation
        if (btn.classList.contains('reschedule-btn')) {
            const appointmentId = btn.dataset.id;
            const status = (btn.dataset.status || '').toUpperCase();

            // Règle : on ne peut pas reprogrammer si c'est encore en attente
            if (status === 'PENDING') {
                showToast('Veuillez attendre la réponse du médecin avant de reprogrammer.', 'warning');
                return;
            }
            openRescheduleModal(appointmentId);
        }
    });

    // Soumission du formulaire de reprogrammation
    const rescheduleForm = document.getElementById('reschedule-form');
    if (rescheduleForm) {
        rescheduleForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            await rescheduleAppointment();
        });
    }

    // Actualisation automatique (toutes les 30s)
    setInterval(() => {
        loadAppointments();
    }, 30000);
});

/* =======================
   Session utilisateur
   ======================= */
async function checkUserSession() {
    try {
        const response = await fetch('/api/session/current');

        if (response.ok) {
            const user = await response.json();

            // Redirection si l’utilisateur n’est pas un patient
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
        console.error('Erreur vérification session :', error);
        window.location.href = '/login';
    }
}

async function loadCurrentUser() {
    try {
        const response = await fetch('/api/session/current');
        if (!response.ok) return;

        const user = await response.json();
        if (user.userType === 'patient' && user.name) {
            document.getElementById('welcomeMessage').textContent = `Bienvenue, ${user.name} !`;
        }
    } catch (error) {
        console.error('Erreur chargement utilisateur :', error);
    }
}

async function logout() {
    try {
        await fetch('/api/session/logout');
        window.location.href = '/login';
    } catch (error) {
        console.error('Erreur logout :', error);
        window.location.href = '/login';
    }
}

/* =======================
   Données dashboard
   ======================= */
async function loadPatientDashboard() {
    await Promise.all([
        loadPatientStats(),
        loadAppointments()
    ]);
}

async function loadPatientStats() {
    try {
        const response = await fetch('/api/patient/stats');
        if (!response.ok) return;

        const data = await response.json();

        if (data.upcomingAppointments !== undefined) {
            document.getElementById('upcomingCount').textContent = data.upcomingAppointments;
        }
        if (data.completedAppointments !== undefined) {
            document.getElementById('completedCount').textContent = data.completedAppointments;
        }
    } catch (error) {
        console.error('Erreur chargement stats patient :', error);
    }
}

async function loadAppointments() {
    try {
        const response = await fetch('/api/patient/appointments');
        const appointments = await response.json();
        await displayAppointments(appointments);
    } catch (error) {
        console.error('Erreur chargement rendez-vous :', error);
        showToast('Impossible de charger les rendez-vous', 'danger');
    }
}

/* =======================
   Infos médecin (cache)
   ======================= */
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
            name: name || 'Médecin inconnu',
            speciality: d.speciality || '',
            phone: d.phone || ''
        };

        doctorCache.set(doctorId, info);
        return info;
    } catch (e) {
        console.error('Erreur chargement infos médecin :', e);
        doctorCache.set(doctorId, null);
        return null;
    }
}

/* =======================
   Affichage (UI)
   ======================= */
async function displayAppointments(appointments) {
    const container = document.getElementById('appointmentsContainer');

    if (!appointments || appointments.length === 0) {
        container.innerHTML = `
            <div class="no-appointments">
                <p>Vous n’avez aucun rendez-vous.</p>
                <button class="btn-app" onclick="window.location.href='/appointment'">
                    <i class="bi bi-plus-circle"></i>
                    Prendre un premier rendez-vous
                </button>
            </div>
        `;
        return;
    }

    const cards = await Promise.all(appointments.map(async (appointment) => {
        const status = (appointment.status || 'PENDING').toUpperCase();

        // Lecture robuste de la date/heure (selon les champs disponibles)
        const raw = appointment.dateTime || appointment.dateTimeString || appointment.date;
        const dt = raw ? new Date(raw) : null;
        const dateStr = dt ? dt.toLocaleDateString() : (appointment.date || '—');
        const timeStr = dt ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (appointment.time || '—');

        // Infos médecin (selon différentes clés possibles)
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

        // Si l’API ne renvoie pas les infos, on les récupère via doctorId
        const doctorId = appointment.doctorId || appointment.doctorID;
        const missingDoctorInfo =
            (!doctorName || doctorName.toLowerCase().includes('unknown')) ||
            (!doctorSpeciality && !doctorPhone);

        if (missingDoctorInfo) {
            const info = await getDoctorInfoById(doctorId);
            if (info) {
                doctorName = doctorName || info.name;
                doctorSpeciality = doctorSpeciality || info.speciality;
                doctorPhone = doctorPhone || info.phone;
            }
        }

        doctorName = doctorName || 'Médecin inconnu';

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
                                    <strong><i class="bi bi-calendar-event"></i> Date :</strong> ${escapeHtml(dateStr)}
                                </div>
                                <div class="mb-1">
                                    <strong><i class="bi bi-clock"></i> Heure :</strong> ${escapeHtml(timeStr)}
                                </div>

                                <div class="mt-2">
                                    <span class="badge ${statusClass}">${escapeHtml(status)}</span>
                                </div>

                                ${status === 'PENDING' ? `
                                    <div class="appointment-waiting">
                                        <i class="bi bi-hourglass-split"></i> En attente de réponse du médecin...
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        ${canPatientModify ? `
                            <div class="btn-group">
                                <button class="btn btn-outline-warning btn-sm reschedule-btn"
                                        data-id="${escapeHtml(appointment.id)}"
                                        data-status="${escapeHtml(status)}">
                                    <i class="bi bi-arrow-repeat"></i> Reprogrammer
                                </button>
                                <button class="btn btn-outline-danger btn-sm cancel-btn"
                                        data-id="${escapeHtml(appointment.id)}"
                                        data-status="${escapeHtml(status)}">
                                    <i class="bi bi-x-circle"></i> Annuler
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

/* =======================
   Actions rendez-vous
   ======================= */
async function cancelAppointment(appointmentId) {
    if (!confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) return;

    try {
        const response = await fetch(`/api/appointments/${encodeURIComponent(appointmentId)}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (result.success) {
            showToast('Rendez-vous annulé', 'success');
            loadPatientStats();
            loadAppointments();
        } else {
            showToast(result.message || 'Impossible d’annuler le rendez-vous', 'danger');
        }
    } catch (error) {
        console.error('Erreur annulation :', error);
        showToast('Erreur lors de l’annulation', 'danger');
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
        showToast('Veuillez choisir la date et l’heure', 'warning');
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
            showToast('Rendez-vous reprogrammé', 'success');

            const modal = bootstrap.Modal.getInstance(document.getElementById('rescheduleModal'));
            if (modal) modal.hide();

            loadPatientStats();
            loadAppointments();
        } else {
            showToast(result.message || 'Impossible de reprogrammer le rendez-vous', 'danger');
        }
    } catch (error) {
        console.error('Erreur reprogrammation :', error);
        showToast('Erreur lors de la reprogrammation', 'danger');
    }
}

/* =======================
   Règles / helpers
   ======================= */
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
        case 'PENDING': return 'bg-warning text-dark';
        case 'CONFIRMED': return 'bg-success';
        case 'SCHEDULED': return 'bg-primary';
        case 'RESCHEDULED': return 'bg-info text-dark';
        case 'COMPLETED': return 'bg-success';
        case 'CANCELLED': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

/* =======================
   Toast Bootstrap
   ======================= */
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

/* =======================
   Sécurité HTML
   ======================= */
function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
}

/* Fonctions accessibles si besoin depuis le HTML */
window.cancelAppointment = cancelAppointment;
window.openRescheduleModal = openRescheduleModal;
