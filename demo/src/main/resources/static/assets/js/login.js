// static/assets/js/login.js
// Gestion de la page de connexion : changement d’onglets (patient/médecin), envoi des formulaires et affichage des erreurs.

document.addEventListener('DOMContentLoaded', function () {

    /* =======================
       Démarrage
       ======================= */
    checkCurrentSession();

    // Onglets
    const tabButtons = document.querySelectorAll('.tab-button');
    const patientTab = document.getElementById('patient');
    const doctorTab = document.getElementById('doctor');

    /* =======================
       Changement d’onglets
       ======================= */
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // Activer le bouton cliqué
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Masquer les contenus
            patientTab.style.display = 'none';
            doctorTab.style.display = 'none';

            // Afficher le contenu sélectionné
            if (tabId === 'patient') {
                patientTab.style.display = 'flex';
                patientTab.classList.add('active');
                doctorTab.classList.remove('active');
            } else if (tabId === 'doctor') {
                doctorTab.style.display = 'flex';
                doctorTab.classList.add('active');
                patientTab.classList.remove('active');
            }
        });
    });

    /* =======================
       Connexion patient
       ======================= */
    const patientForm = document.getElementById('patient-form');
    if (patientForm) {
        patientForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('patient-email').value;
            const password = document.getElementById('patient-password').value;

            try {
                const response = await fetch('/api/session/patient', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (result.success) {
                    patientForm.reset();
                    window.location.href = '/patient/dashboard';
                } else {
                    showError(result.message || 'Email ou mot de passe invalide');
                }
            } catch (error) {
                console.error('Erreur connexion patient :', error);
                showError('Connexion impossible. Veuillez réessayer.');
            }
        });
    }

    /* =======================
       Connexion médecin
       ======================= */
    const doctorForm = document.getElementById('doctor-form');
    if (doctorForm) {
        doctorForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('doctor-email').value;
            const password = document.getElementById('doctor-password').value;

            try {
                const response = await fetch('/api/session/doctor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (result.success) {
                    doctorForm.reset();
                    window.location.href = '/doctor/dashboard';
                } else {
                    showError(result.message || 'Email ou mot de passe invalide');
                }
            } catch (error) {
                console.error('Erreur connexion médecin :', error);
                showError('Connexion impossible. Veuillez réessayer.');
            }
        });
    }

    /* =======================
       Bouton accueil
       ======================= */
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
        homeBtn.addEventListener('click', function () {
            window.location.href = '/';
        });
    }
});

/* =======================
   Session existante
   ======================= */
async function checkCurrentSession() {
    try {
        const response = await fetch('/api/session/current');
        if (!response.ok) return;

        const user = await response.json();

        if (user.userType === 'patient') {
            window.location.href = '/patient/dashboard';
        } else if (user.userType === 'doctor') {
            window.location.href = '/doctor/dashboard';
        }
    } catch (error) {
        // Pas de session active (ou erreur réseau)
    }
}

/* =======================
   Gestion des erreurs
   ======================= */
function showError(message) {
    const errorOverlay = document.getElementById('error-overlay');
    const errorMessage = document.getElementById('error-message');

    if (errorOverlay && errorMessage) {
        errorMessage.textContent = message;
        errorOverlay.style.display = 'block';

        // Masquage automatique après 5 secondes
        setTimeout(hideError, 5000);
    } else {
        alert('Erreur : ' + message);
    }
}

function hideError() {
    const errorOverlay = document.getElementById('error-overlay');
    if (errorOverlay) {
        errorOverlay.style.display = 'none';
    }
}

// Permet d’appeler hideError depuis le HTML (onclick, etc.)
window.hideError = hideError;
