// static/assets/js/patientprofile.js
// Profil patient : affichage des informations + mise à jour limitée (email, téléphone, wilaya, ville, mot de passe optionnel).

document.addEventListener('DOMContentLoaded', function () {
    initializePage();
    loadUserProfile();
    loadWilayas();
});

/* =======================
   Initialisation page
   ======================= */
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

// Rend certains champs non modifiables (lecture seule)
function disableNonEditableFields() {
    const nonEditableFields = ['firstName', 'lastName', 'genderDisplay'];

    nonEditableFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.setAttribute('readonly', 'true');
            field.classList.add('read-only-field');
        }
    });

    // Afficher le genre en lecture seule (masquer la liste)
    const genderSelect = document.getElementById('gender');
    const genderDisplay = document.getElementById('genderDisplay');
    if (genderSelect && genderDisplay) {
        genderSelect.style.display = 'none';
        genderSelect.disabled = true;
        genderDisplay.style.display = 'block';
    }
}

/* =======================
   Chargement profil
   ======================= */
async function loadUserProfile() {
    try {
        showLoading(true);

        // Vérifier la session
        const sessionResponse = await fetch('/api/session/current');
        if (!sessionResponse.ok) throw new Error(`Session error: ${sessionResponse.status}`);

        const user = await sessionResponse.json();

        // Accès patient uniquement
        if (user.userType && user.userType !== 'patient') {
            showMessage('Accès refusé. Connectez-vous en tant que patient.', 'warning');
            setTimeout(() => window.location.href = '/login', 2000);
            return;
        }

        // Charger le profil
        const profileResponse = await fetch('/api/patient/profile');
        if (!profileResponse.ok) {
            throw new Error(`Failed to load profile (Status: ${profileResponse.status})`);
        }

        const profile = await profileResponse.json();
        if (!profile) throw new Error('Profile data is empty');

        populateForm(profile);
        updateDisplayInfo(profile);

    } catch (error) {
        console.error('Erreur chargement profil patient :', error);
        showMessage('Impossible de charger le profil. Veuillez vous reconnecter.', 'danger');
        setTimeout(() => window.location.href = '/login', 2000);
    } finally {
        showLoading(false);
    }
}

// Remplit les champs du formulaire à partir de l’objet profil
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
    document.getElementById('phone').value = profile.phone || profile.phoneNumber || profile.telephone || '';

    const wilaya = profile.wilaya || '';
    const city = profile.city || '';

    // Mémoriser wilaya/ville pour pré-sélection
    if (wilaya) window.currentWilaya = wilaya;
    if (city) window.currentCity = city;

    // Stocker l’identifiant patient (obligatoire pour l’update)
    const patientId = profile.id || profile.patientId || profile.userId || '';
    if (patientId) document.getElementById('patientId').value = patientId;
}

// Met à jour le bloc d’affichage (nom, email, avatar)
function updateDisplayInfo(profile) {
    const nameDisplay = document.getElementById('patientName');
    const emailDisplay = document.getElementById('patientEmail');
    const avatar = document.getElementById('patientAvatar');

    const firstName = profile.firstName || profile.firstname || '';
    const lastName = profile.lastName || profile.lastname || '';

    if (nameDisplay) nameDisplay.textContent = `${firstName} ${lastName}`.trim() || 'Mon Profil';
    if (emailDisplay && profile.email) emailDisplay.textContent = profile.email;

    // Initiales dans l’avatar
    if (avatar && firstName && lastName) {
        const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
        avatar.innerHTML = `<span class="avatar-initials">${initials}</span>`;
    }
}

/* =======================
   Wilaya / Villes
   ======================= */
async function loadWilayas() {
    try {
        const response = await fetch('/api/wilayas');
        const wilayas = await response.json();

        const select = document.getElementById('wilaya');
        select.innerHTML = '<option value="">Sélectionner une wilaya</option>';

        (wilayas || []).forEach(w => {
            const opt = document.createElement('option');
            opt.value = w;
            opt.textContent = w;
            select.appendChild(opt);
        });

        // Pré-sélection si déjà enregistrée
        if (window.currentWilaya) {
            select.value = window.currentWilaya;
            setTimeout(() => select.dispatchEvent(new Event('change')), 100);
        }

    } catch (error) {
        console.error(error);
        showMessage('Impossible de charger les wilayas', 'warning');
    }
}

async function handleWilayaChange(event) {
    const wilaya = event.target.value;
    const citySelect = document.getElementById('city');

    if (!wilaya) {
        citySelect.disabled = true;
        citySelect.innerHTML = '<option value="">Sélectionner une ville</option>';
        return;
    }

    try {
        const response = await fetch(`/api/cities?wilaya=${encodeURIComponent(wilaya)}`);
        const cities = await response.json();

        citySelect.innerHTML = '<option value="">Sélectionner une ville</option>';
        (cities || []).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            citySelect.appendChild(opt);
        });

        citySelect.disabled = false;

        // Pré-sélection si la ville correspond à la wilaya actuelle
        if (window.currentCity && window.currentWilaya === wilaya) {
            citySelect.value = window.currentCity;
        }

    } catch (error) {
        console.error(error);
        showMessage('Impossible de charger les villes', 'danger');
    }
}

/* =======================
   Envoi du formulaire
   ======================= */
async function handleFormSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    try {
        showLoading(true);

        const formData = getEditableFormData();
        if (!formData.id) {
            showMessage('Identifiant patient manquant. Actualisez la page.', 'danger');
            return;
        }

        const response = await fetch('/api/patient/profile/update-restricted', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Profil mis à jour avec succès !', 'success');
            document.getElementById('password').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showMessage(result.message || 'Échec de la mise à jour du profil', 'danger');
        }

    } catch (error) {
        console.error(error);
        showMessage('Erreur lors de la mise à jour', 'danger');
    } finally {
        showLoading(false);
    }
}

// Construit uniquement les champs autorisés à modifier
function getEditableFormData() {
    const data = { id: document.getElementById('patientId').value };

    ['email', 'phone', 'wilaya', 'city'].forEach(f => {
        const el = document.getElementById(f);
        if (el && el.value) data[f] = el.value.trim();
    });

    const pass = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (pass && confirm && pass === confirm) data.password = pass;

    return data;
}

/* =======================
   Validation (à compléter)
   ======================= */
function setupFormValidation() {}
function validateForm() { return true; }

/* =======================
   Helpers UI
   ======================= */
function showMessage(message, type = 'info') {
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

// Active/désactive le bouton submit + affiche un spinner
function showLoading(show) {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;

    submitBtn.disabled = show;
    submitBtn.innerHTML = show
        ? '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enregistrement...'
        : '<i class="bi bi-save me-2"></i>Enregistrer';
}

// Affiche/masque un champ mot de passe
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
