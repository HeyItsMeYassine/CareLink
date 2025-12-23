// doctordashboard.js - Pending flow (Confirm + Reschedule + Cancel + Complete)

document.addEventListener('DOMContentLoaded', function () {

    loadDashboardData();
    loadAppointments();
    loadCurrentDoctorHeader();

    // Auto-refresh
    setInterval(() => {
        loadDashboardData();
        loadAppointments();
    }, 30000);

    // Profile dropdown
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.style.display =
                profileDropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-container')) {
                profileDropdown.style.display = 'none';
            }
        });
    }

    // Navigation
    document.getElementById('editProfileBtn')?.addEventListener('click', () => {
        window.location.href = '/doctor/profile';
    });

    document.getElementById('homeBtn')?.addEventListener('click', () => {
        window.location.href = '/doctor/dashboard';
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        try {
            await fetch('/api/session/logout', { method: 'GET' });
        } finally {
            window.location.href = '/login';
        }
    });

    // Delegated click handling
    document.addEventListener('click', function (e) {
        const confirmBtn = e.target.closest('.confirm-btn');
        const cancelBtn = e.target.closest('.cancel-btn');
        const rescheduleBtn = e.target.closest('.reschedule-btn');
        const completeBtn = e.target.closest('.complete-btn');

        if (confirmBtn) {
            confirmAppointment(confirmBtn.dataset.id);
            return;
        }
        if (rescheduleBtn) {
            openRescheduleModal(rescheduleBtn.dataset.id);
            return;
        }
        if (completeBtn) {
            completeAppointment(completeBtn.dataset.id);
            return;
        }
        if (cancelBtn) {
            cancelAppointment(cancelBtn.dataset.id);
            return;
        }
    });

    // Reschedule form submit
    document.getElementById('reschedule-form')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        await rescheduleAppointment();
    });

    // ========= HEADER / STATS =========
    async function loadCurrentDoctorHeader() {
        try {
            const res = await fetch('/api/doctor/profile');
            if (!res.ok) return;
            const doctor = await res.json();

            if (doctor?.firstName || doctor?.lastName) {
                document.getElementById('welcomeMessage').textContent =
                    `Welcome, Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
            }
            if (doctor?.speciality) {
                document.getElementById('specialtyText').textContent = `Specialty: ${doctor.speciality}`;
            }
        } catch (e) {
            console.error('Error loading doctor profile header:', e);
        }
    }

    async function loadDashboardData() {
        try {
            const response = await fetch('/api/doctor/stats');
            if (!response.ok) return;

            const data = await response.json();
            document.getElementById('todayAppointments').textContent = data.todayAppointments || 0;
            document.getElementById('pendingAppointments').textContent = data.pendingAppointments || 0;
            document.getElementById('totalPatients').textContent = data.totalPatients || 0;
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    // ========= APPOINTMENTS =========
    const patientInfoCache = new Map();

    async function getPatientInfo(patientId) {
        if (!patientId) return { name: 'Patient', phone: '' };
        if (patientInfoCache.has(patientId)) return patientInfoCache.get(patientId);

        const fallback = { name: `Patient (${patientId})`, phone: '' };

        try {
            const res = await fetch(`/api/patient/${encodeURIComponent(patientId)}`);
            if (!res.ok) {
                patientInfoCache.set(patientId, fallback);
                return fallback;
            }

            const p = await res.json();
            const name =
                (`${p.firstName || ''} ${p.lastName || ''}`.trim()) ||
                p.name ||
                fallback.name;

            const phone = (p.phone || p.phoneNumber || p.mobile || '').toString().trim();
            const info = { name, phone };
            patientInfoCache.set(patientId, info);
            return info;
        } catch (e) {
            patientInfoCache.set(patientId, fallback);
            return fallback;
        }
    }

    async function loadAppointments() {
        try {
            const response = await fetch('/api/doctor/appointments');
            if (!response.ok) throw new Error('Failed to fetch doctor appointments');

            const appointments = await response.json();
            await displayAppointments(appointments);
        } catch (error) {
            console.error('Error loading appointments:', error);
            document.getElementById('appointmentsContainer').innerHTML =
                '<div class="loading-message">Error loading appointments</div>';
        }
    }

    async function displayAppointments(appointments) {
        const container = document.getElementById('appointmentsContainer');

        if (!appointments || appointments.length === 0) {
            container.innerHTML = '<div class="loading-message">No appointments found.</div>';
            return;
        }

        const cards = await Promise.all(appointments.map(async (apt) => {
            const dt = parseDateTime(apt.dateTime);
            const dateStr = dt ? dt.toLocaleDateString() : '—';
            const timeStr = dt ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

            const status = (apt.status || 'UNKNOWN').toUpperCase();
            const patientInfo = await getPatientInfo(apt.patientId);

            const badge = statusBadge(status);

            const canCancel = status !== 'CANCELLED' && status !== 'COMPLETED';
            const canConfirm = status === 'PENDING' || status === 'RESCHEDULED';
            const canReschedule = status === 'PENDING';

            // ✅ NEW: only after accepted
            const canComplete = status === 'CONFIRMED' || status === 'RESCHEDULED' || status === 'SCHEDULED';

            const actionsHtml = (canConfirm || canReschedule || canComplete || canCancel) ? `
                <div class="btn-group">
                    ${canConfirm ? `
                        <button class="btn btn-success btn-sm confirm-btn" data-id="${apt.id}">
                            Confirm
                        </button>` : ``}
                    ${canReschedule ? `
                        <button class="btn btn-warning btn-sm reschedule-btn" data-id="${apt.id}">
                            Reschedule
                        </button>` : ``}
                    ${canComplete ? `
                        <button class="btn btn-secondary btn-sm complete-btn" data-id="${apt.id}">
                            Complete
                        </button>` : ``}
                    ${canCancel ? `
                        <button class="btn btn-danger btn-sm cancel-btn" data-id="${apt.id}">
                            Cancel
                        </button>` : ``}
                </div>
            ` : '';

            const hint = status === 'PENDING'
                ? `<div class="mt-2 text-muted small">This is a new request — please confirm, reschedule, or cancel.</div>`
                : status === 'RESCHEDULED'
                    ? `<div class="mt-2 text-muted small">Rescheduled — you may confirm it now or mark it completed after visit.</div>`
                    : status === 'CONFIRMED'
                        ? `<div class="mt-2 text-muted small">Confirmed — after the visit, mark it as completed.</div>`
                        : '';

            return `
                <div class="card mb-3 appointment-item" data-status="${status}" data-appointment-id="${apt.id}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div style="flex:1;">
                                <div class="patient-block">
                                    <div class="patient-name">${escapeHtml(patientInfo.name)}</div>
                                    ${patientInfo.phone ? `<div class="patient-phone">${escapeHtml(patientInfo.phone)}</div>` : ``}
                                </div>

                                <div class="mb-1 mt-2"><strong>Date:</strong> ${escapeHtml(dateStr)}</div>
                                <div class="mb-1"><strong>Time:</strong> ${escapeHtml(timeStr)}</div>
                                <div class="mb-2">
                                    <span class="badge ${badge.className}">${escapeHtml(badge.label)}</span>
                                </div>
                                ${hint}
                            </div>
                            ${actionsHtml}
                        </div>
                    </div>
                </div>
            `;
        }));

        container.innerHTML = cards.join('');
    }

    function parseDateTime(dateTimeStr) {
        if (!dateTimeStr) return null;
        const dt = new Date(dateTimeStr);
        return isNaN(dt.getTime()) ? null : dt;
    }

    function statusBadge(status) {
        switch (status) {
            case 'PENDING': return { className: 'bg-warning text-dark', label: 'PENDING' };
            case 'CONFIRMED': return { className: 'bg-success', label: 'CONFIRMED' };
            case 'SCHEDULED': return { className: 'bg-primary', label: 'SCHEDULED' };
            case 'RESCHEDULED': return { className: 'bg-info text-dark', label: 'RESCHEDULED' };
            case 'CANCELLED': return { className: 'bg-danger', label: 'CANCELLED' };
            case 'COMPLETED': return { className: 'bg-secondary', label: 'COMPLETED' };
            default: return { className: 'bg-secondary', label: status || 'UNKNOWN' };
        }
    }

    // ========= ACTIONS =========
    async function confirmAppointment(appointmentId) {
        if (!appointmentId) return;
        if (!confirm('Confirm this appointment?')) return;

        try {
            const response = await fetch(`/api/appointments/${encodeURIComponent(appointmentId)}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();
            if (result.success) {
                showToast('Appointment confirmed', 'success');
                loadAppointments();
                loadDashboardData();
            } else {
                showToast(result.message || 'Failed to confirm appointment', 'danger');
            }
        } catch (error) {
            console.error('Error confirming appointment:', error);
            showToast('Error confirming appointment', 'danger');
        }
    }

    async function completeAppointment(appointmentId) {
        if (!appointmentId) return;
        if (!confirm('Mark this appointment as completed?')) return;

        try {
            const response = await fetch(`/api/appointments/${encodeURIComponent(appointmentId)}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();
            if (result.success) {
                showToast('Appointment marked as completed', 'success');
                loadAppointments();
                loadDashboardData();
            } else {
                showToast(result.message || 'Failed to complete appointment', 'danger');
            }
        } catch (error) {
            console.error('Error completing appointment:', error);
            showToast('Error completing appointment', 'danger');
        }
    }

    async function cancelAppointment(appointmentId) {
        if (!appointmentId) return;
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            const response = await fetch(`/api/appointments/${encodeURIComponent(appointmentId)}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();
            if (result.success) {
                showToast('Appointment cancelled', 'success');
                loadAppointments();
                loadDashboardData();
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
                showToast('Appointment rescheduled', 'success');
                bootstrap.Modal.getInstance(document.getElementById('rescheduleModal'))?.hide();
                loadAppointments();
                loadDashboardData();
            } else {
                showToast(result.message || 'Failed to reschedule appointment', 'danger');
            }
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            showToast('Error rescheduling appointment', 'danger');
        }
    }

    // ========= TOAST + HELPERS =========
    function showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
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

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
});
