// doctorprofile.js - Doctor profile (restricted update)
// Read-only: firstName, lastName, sexe, speciality
// Editable: email, phone, wilaya, city, locationLink, password (optional)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profileForm');
    const successMessage = document.getElementById('successMessage');

    const firstNameEl = document.getElementById('firstName');
    const lastNameEl = document.getElementById('lastName');
    const sexeEl = document.getElementById('sexe');
    const specialityEl = document.getElementById('speciality');

    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const wilayaEl = document.getElementById('wilaya');
    const cityEl = document.getElementById('city');
    const locationLinkEl = document.getElementById('locationLink');

    const passwordEl = document.getElementById('password');
    const confirmPasswordEl = document.getElementById('confirmPassword');

    init();

    async function init() {
        setLoading(true);

        try {
            // Load dropdowns first (so we can select values)
            await Promise.all([
                loadWilayas(),
                loadSpecialties()
            ]);

            const doctor = await loadCurrentDoctor();
            if (!doctor) return;

            // Populate read-only
            firstNameEl.value = doctor.firstName || '';
            lastNameEl.value = doctor.lastName || '';
            sexeEl.value = doctor.sexe || '';

            // Populate editable
            emailEl.value = doctor.email || '';
            phoneEl.value = doctor.phone || '';
            locationLinkEl.value = doctor.locationLink || '';

            // Set wilaya/city (city depends on wilaya)
            if (doctor.wilaya) {
                wilayaEl.value = doctor.wilaya;
                await loadCitiesByWilaya(doctor.wilaya);
                cityEl.disabled = false;

                if (doctor.city) cityEl.value = doctor.city;
            } else {
                cityEl.disabled = true;
            }

            // Set speciality (read-only select)
            if (doctor.speciality) {
                specialityEl.value = doctor.speciality;
            }

            // Header
            const fullName = `Dr. ${(doctor.firstName || '').trim()} ${(doctor.lastName || '').trim()}`.trim();
            const doctorNameHeader = document.getElementById('doctorName');
            if (doctorNameHeader && fullName !== 'Dr.') doctorNameHeader.textContent = fullName;

            const specialityHeader = document.getElementById('doctorSpeciality');
            if (specialityHeader) {
                specialityHeader.textContent = doctor.speciality
                    ? `Speciality: ${doctor.speciality}`
                    : 'Manage your professional information';
            }
        } catch (e) {
            console.error('Error initializing doctor profile:', e);
            alert('Failed to load profile. Please login again.');
            window.location.href = '/login';
        } finally {
            setLoading(false);
        }
    }

    wilayaEl?.addEventListener('change', async () => {
        const wilaya = wilayaEl.value;
        cityEl.innerHTML = `<option value="">Select City</option>`;
        cityEl.disabled = true;

        if (!wilaya) return;

        await loadCitiesByWilaya(wilaya);
        cityEl.disabled = false;
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideSuccess();

        // Password validation (optional)
        const password = (passwordEl.value || '').trim();
        const confirmPassword = (confirmPasswordEl.value || '').trim();

        if (password || confirmPassword) {
            if (password.length < 4) {
                alert('Password is too short.');
                return;
            }
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
        }

        // Only send allowed fields for restricted update endpoint
        const payload = {
            email: (emailEl.value || '').trim(),
            phone: (phoneEl.value || '').trim(),
            wilaya: (wilayaEl.value || '').trim(),
            city: (cityEl.value || '').trim(),
            locationLink: (locationLinkEl.value || '').trim()
        };

        if (password) payload.password = password;

        try {
            setLoading(true);

            const res = await fetch('/api/doctor/profile/update-restricted', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json().catch(() => ({}));

            if (res.ok && result.success) {
                showSuccess();
                // Clear password fields
                passwordEl.value = '';
                confirmPasswordEl.value = '';
            } else {
                alert(result.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating doctor profile:', err);
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    });

    async function loadCurrentDoctor() {
        const res = await fetch('/api/doctor/profile');
        if (!res.ok) {
            window.location.href = '/login';
            return null;
        }
        return await res.json();
    }

    async function loadWilayas() {
        const res = await fetch('/api/wilayas');
        if (!res.ok) return;

        const wilayas = await res.json();
        wilayaEl.innerHTML = `<option value="">Select Wilaya</option>` +
            (wilayas || []).map(w => `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`).join('');
    }

    async function loadCitiesByWilaya(wilaya) {
        const res = await fetch(`/api/cities?wilaya=${encodeURIComponent(wilaya)}`);
        if (!res.ok) return;

        const cities = await res.json();
        cityEl.innerHTML = `<option value="">Select City</option>` +
            (cities || []).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    }

    async function loadSpecialties() {
        const res = await fetch('/api/specialties');
        if (!res.ok) return;

        const specialties = await res.json();
        specialityEl.innerHTML = `<option value="">Select Speciality</option>` +
            (specialties || []).map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    }

    function setLoading(isLoading) {
        const card = document.querySelector('.profile-card');
        if (!card) return;
        card.classList.toggle('loading', !!isLoading);
    }

    function showSuccess() {
        if (!successMessage) return;
        successMessage.style.display = 'block';
        setTimeout(() => hideSuccess(), 3500);
    }

    function hideSuccess() {
        if (!successMessage) return;
        successMessage.style.display = 'none';
    }

    function escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }
});
