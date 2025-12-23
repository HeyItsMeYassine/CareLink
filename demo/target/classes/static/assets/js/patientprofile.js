// patientprofile.js - Allows editing email, phone, wilaya, city, and password
document.addEventListener('DOMContentLoaded', function() {
    console.log('Patient profile page loaded - Restricted edit mode');

    initializePage();
    loadUserProfile();
    loadWilayas();
});

// ========== PAGE INITIALIZATION ==========

function initializePage() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleFormSubmit);
    }

    const wilayaSelect = document.getElementById('wilaya');
    if (wilayaSelect) {
        wilayaSelect.addEventListener('change', handleWilayaChange);
    }

    setupFormValidation();
    disableNonEditableFields();
}

function disableNonEditableFields() {
    // ✅ UPDATED: phone is now editable -> removed from list
    const nonEditableFields = ['firstName', 'lastName', 'genderDisplay'];

    nonEditableFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.setAttribute('readonly', 'true');
            field.classList.add('read-only-field');
        }
    });

    const genderSelect = document.getElementById('gender');
    const genderDisplay = document.getElementById('genderDisplay');
    if (genderSelect && genderDisplay) {
        genderSelect.style.display = 'none';
        genderSelect.disabled = true;
        genderDisplay.style.display = 'block';
    }
}

// ========== USER PROFILE FUNCTIONS ==========

async function loadUserProfile() {
    try {
        showLoading(true);

        const sessionResponse = await fetch('/api/session/current');
        if (!sessionResponse.ok) throw new Error(`Session error: ${sessionResponse.status}`);

        const user = await sessionResponse.json();

        if (user.userType && user.userType !== 'patient') {
            showMessage('Access denied. Please login as a patient.', 'warning');
            setTimeout(() => window.location.href = '/login', 2000);
            return;
        }

        const profileResponse = await fetch('/api/patient/profile');
        if (!profileResponse.ok) throw new Error(`Failed to load profile (Status: ${profileResponse.status})`);

        const profile = await profileResponse.json();
        if (!profile) throw new Error('Profile data is empty');

        populateForm(profile);
        updateDisplayInfo(profile);

    } catch (error) {
        console.error('Error loading user profile:', error);
        showMessage('Failed to load profile. Please login again.', 'danger');
        setTimeout(() => window.location.href = '/login', 2000);
    } finally {
        showLoading(false);
    }
}

function populateForm(profile) {
    document.getElementById('firstName').value = profile.firstName || profile.firstname || '';
    document.getElementById('lastName').value  = profile.lastName  || profile.lastname  || '';

    const genderValue = profile.gender || profile.sexe || profile.sex || '';
    const genderDisplay = document.getElementById('genderDisplay');

    if (genderDisplay) {
        const genderMap = { 'MALE': 'Male', 'FEMALE': 'Female', 'M': 'Male', 'F': 'Female' };
        const key = (genderValue || '').toString().toUpperCase();
        genderDisplay.value = genderMap[key] || genderValue || 'Not specified';
    }

    document.getElementById('email').value = profile.email || '';

    // ✅ phone stays populated but is now editable
    document.getElementById('phone').value = profile.phone || profile.phoneNumber || profile.telephone || '';

    const wilaya = profile.wilaya || '';
    const city   = profile.city || '';

    if (wilaya) window.currentWilaya = wilaya;
    if (city)   window.currentCity   = city;

    const patientId = profile.id || profile.patientId || profile.userId || '';
    if (patientId) document.getElementById('patientId').value = patientId;
}

function updateDisplayInfo(profile) {
    const nameDisplay = document.getElementById('patientName');
    const emailDisplay = document.getElementById('patientEmail');
    const avatar = document.getElementById('patientAvatar');

    const firstName = profile.firstName || profile.firstname || '';
    const lastName  = profile.lastName  || profile.lastname  || '';

    if (nameDisplay) nameDisplay.textContent = `${firstName} ${lastName}`.trim() || 'My Profile';
    if (emailDisplay && profile.email) emailDisplay.textContent = profile.email;

    if (avatar && firstName && lastName) {
        const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
        avatar.innerHTML = `<span class="avatar-initials">${initials}</span>`;
    }
}

// ========== LOCATION FUNCTIONS ==========

async function loadWilayas() {
    try {
        const response = await fetch('/api/wilayas');
        const wilayas = await response.json();

        const select = document.getElementById('wilaya');
        select.innerHTML = '<option value="">Select Wilaya</option>';

        wilayas.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = w;
            select.appendChild(opt);
        });

        if (window.currentWilaya) {
            select.value = window.currentWilaya;
            setTimeout(() => select.dispatchEvent(new Event('change')), 100);
        }

    } catch (error) {
        console.error(error);
        showMessage('Failed to load wilayas', 'warning');
    }
}

async function handleWilayaChange(event) {
    const wilaya = event.target.value;
    const citySelect = document.getElementById('city');

    if (!wilaya) {
        citySelect.disabled = true;
        citySelect.innerHTML = '<option value="">Select City</option>';
        return;
    }

    try {
        const response = await fetch(`/api/cities?wilaya=${encodeURIComponent(wilaya)}`);
        const cities = await response.json();

        citySelect.innerHTML = '<option value="">Select City</option>';
        cities.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            citySelect.appendChild(opt);
        });

        citySelect.disabled = false;

        if (window.currentCity && window.currentWilaya === wilaya) {
            citySelect.value = window.currentCity;
        }

    } catch (error) {
        console.error(error);
        showMessage('Failed to load cities', 'danger');
    }
}

// ========== FORM SUBMIT ==========

async function handleFormSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    try {
        showLoading(true);

        const formData = getEditableFormData();
        if (!formData.id) {
            showMessage('Patient ID missing. Refresh.', 'danger');
            return;
        }

        const response = await fetch('/api/patient/profile/update-restricted', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Profile updated successfully!', 'success');
            document.getElementById('password').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showMessage(result.message || 'Failed to update profile', 'danger');
        }

    } catch (error) {
        console.error(error);
        showMessage('Update error', 'danger');
    } finally {
        showLoading(false);
    }
}

function getEditableFormData() {
    const data = { id: document.getElementById('patientId').value };

    // ✅ UPDATED: added phone
    ['email', 'phone', 'wilaya', 'city'].forEach(f => {
        const el = document.getElementById(f);
        if (el && el.value) data[f] = el.value.trim();
    });

    const pass = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (pass && confirm && pass === confirm) data.password = pass;

    return data;
}

// ========== VALIDATION ==========

function setupFormValidation() {}
function validateForm() { return true; }

// ========== UI HELPERS ==========

function showMessage(message, type='info') {
    const container = document.getElementById('messageContainer');
    const alert = document.getElementById('messageAlert');
    if (!container || !alert) return;

    const icon = {
        success: 'check-circle',
        danger: 'x-octagon',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    }[type] || 'info-circle';

    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        <i class="bi bi-${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    container.style.display = 'block';
}

function showLoading(show) {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;

    submitBtn.disabled = show;
    submitBtn.innerHTML = show
        ? '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...'
        : '<i class="bi bi-save me-2"></i>Save Changes';
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const toggleBtn = field.parentElement.querySelector('.password-toggle i');
    if (field.type === 'password') {
        field.type = 'text';
        if (toggleBtn) toggleBtn.className = 'bi bi-eye-slash';
    } else {
        field.type = 'password';
        if (toggleBtn) toggleBtn.className = 'bi bi-eye';
    }
}

window.togglePassword = togglePassword;
