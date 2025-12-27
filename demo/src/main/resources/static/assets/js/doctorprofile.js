// static/assets/js/doctorprofile.js
// Gestion du profil médecin : affichage des infos + mise à jour limitée (email, téléphone, localisation, mot de passe optionnel).

document.addEventListener('DOMContentLoaded', () => {
    /* =======================
       Références DOM
       ======================= */
    const form = document.getElementById('profileForm');
    const successMessage = document.getElementById('successMessage');

    // Champs en lecture seule
    const firstNameEl = document.getElementById('firstName');
    const lastNameEl = document.getElementById('lastName');
    const sexeEl = document.getElementById('sexe');
    const specialityEl = document.getElementById('speciality');

    // Champs modifiables
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const wilayaEl = document.getElementById('wilaya');
    const cityEl = document.getElementById('city');
    const locationLinkEl = document.getElementById('locationLink');

    // Mot de passe (optionnel)
    const passwordEl = document.getElementById('password');
    const confirmPasswordEl = document.getElementById('confirmPassword');

    init();

    /* =======================
       Initialisation
       ======================= */
    async function init() {
        setLoading(true);

        try {
            // Charger les listes d’abord (pour pouvoir sélectionner les valeurs)
            await Promise.all([
                loadWilayas(),
                loadSpecialties()
            ]);

            const doctor = await loadCurrentDoctor();
            if (!doctor) return;

            // Remplir les champs en lecture seule
            firstNameEl.value = doctor.firstName || '';
            lastNameEl.value = doctor.lastName || '';
            sexeEl.value = doctor.sexe || '';

            // Remplir les champs modifiables
            emailEl.value = doctor.email || '';
            phoneEl.value = doctor.phone || '';
            locationLinkEl.value = doctor.locationLink || '';

            // Wilaya + villes (la ville dépend de la wilaya)
            if (doctor.wilaya) {
                wilayaEl.value = doctor.wilaya;
                await loadCitiesByWilaya(doctor.wilaya);
                cityEl.disabled = false;

                if (doctor.city) cityEl.value = doctor.city;
            } else {
                cityEl.disabled = true;
            }

            // Spécialité (liste non modifiable côté UI)
            if (doctor.speciality) {
                specialityEl.value = doctor.speciality;
            }

            // Mise à jour de l’en-tête du profil
            updateHeader(doctor);

        } catch (e) {
            console.error('Erreur lors du chargement du profil médecin :', e);
            alert('Impossible de charger le profil. Veuillez vous reconnecter.');
            window.location.href = '/login';
        } finally {
            setLoading(false);
        }
    }

    /* =======================
       Événements
       ======================= */
    wilayaEl?.addEventListener('change', async () => {
        const wilaya = wilayaEl.value;

        // Réinitialiser la liste des villes
        cityEl.innerHTML = `<option value="">Sélectionner une ville</option>`;
        cityEl.disabled = true;

        if (!wilaya) return;

        await loadCitiesByWilaya(wilaya);
        cityEl.disabled = false;
    });

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideSuccess();

        // Validation du mot de passe (optionnel)
        const password = (passwordEl.value || '').trim();
        const confirmPassword = (confirmPasswordEl.value || '').trim();

        if (password || confirmPassword) {
            if (password.length < 4) {
                alert('Le mot de passe est trop court.');
                return;
            }
            if (password !== confirmPassword) {
                alert('Les mots de passe ne correspondent pas.');
                return;
            }
        }

        // Données autorisées pour la mise à jour (endpoint restreint)
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

                // Nettoyer les champs mot de passe
                passwordEl.value = '';
                confirmPasswordEl.value = '';
            } else {
                alert(result.message || 'Échec de la mise à jour du profil');
            }
        } catch (err) {
            console.error('Erreur lors de la mise à jour du profil :', err);
            alert('Erreur lors de la mise à jour du profil');
        } finally {
            setLoading(false);
        }
    });

    /* =======================
       Appels API
       ======================= */
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
        wilayaEl.innerHTML =
            `<option value="">Sélectionner une wilaya</option>` +
            (wilayas || []).map(w => `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`).join('');
    }

    async function loadCitiesByWilaya(wilaya) {
        const res = await fetch(`/api/cities?wilaya=${encodeURIComponent(wilaya)}`);
        if (!res.ok) return;

        const cities = await res.json();
        cityEl.innerHTML =
            `<option value="">Sélectionner une ville</option>` +
            (cities || []).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    }

    async function loadSpecialties() {
        const res = await fetch('/api/specialties');
        if (!res.ok) return;

        const specialties = await res.json();
        specialityEl.innerHTML =
            `<option value="">Sélectionner une spécialité</option>` +
            (specialties || []).map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    }

    /* =======================
       UI helpers
       ======================= */
    function updateHeader(doctor) {
        const fullName = `Dr. ${(doctor.firstName || '').trim()} ${(doctor.lastName || '').trim()}`.trim();

        const doctorNameHeader = document.getElementById('doctorName');
        if (doctorNameHeader && fullName !== 'Dr.') doctorNameHeader.textContent = fullName;

        const specialityHeader = document.getElementById('doctorSpeciality');
        if (specialityHeader) {
            specialityHeader.textContent = doctor.speciality
                ? `Spécialité : ${doctor.speciality}`
                : 'Gérez vos informations professionnelles';
        }
    }

    // Active/désactive un style de chargement
    function setLoading(isLoading) {
        const card = document.querySelector('.profile-card');
        if (!card) return;
        card.classList.toggle('loading', !!isLoading);
    }

    // Affiche un message de succès temporaire
    function showSuccess() {
        if (!successMessage) return;
        successMessage.style.display = 'block';
        setTimeout(() => hideSuccess(), 3500);
    }

    function hideSuccess() {
        if (!successMessage) return;
        successMessage.style.display = 'none';
    }

    // Échappement HTML pour éviter l’injection
    function escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }
});
