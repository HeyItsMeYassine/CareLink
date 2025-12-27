// static/assets/js/register.js
// Page d’inscription : bascule patient/médecin, chargement wilayas/villes/spécialités, validation des champs et envoi des formulaires.

document.addEventListener('DOMContentLoaded', () => {

  /* =======================
     Données initiales
     ======================= */
  loadWilayas();
  loadSpecialties();

  /* =======================
     Références DOM
     ======================= */
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const forms = Array.from(document.querySelectorAll('.form-section'));

  const doctorIllustration = document.getElementById('doctor-illustration');
  const patientIllustration = document.getElementById('patient-illustration');

  const doctorForm = document.getElementById('doctor-form');
  const patientForm = document.getElementById('patient-form');

  const doctorSpinner = document.getElementById('doctor-spinner');
  const patientSpinner = document.getElementById('patient-spinner');

  /* =======================
     Changement d’onglet
     ======================= */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const type = tab.getAttribute('data-type'); // doctor | patient
      if (!type) return;

      // Onglet actif
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Formulaire actif
      forms.forEach(f => f.classList.remove('active'));
      const activeForm = document.getElementById(`${type}-form`);
      if (activeForm) activeForm.classList.add('active');

      // Illustration active
      if (doctorIllustration && patientIllustration) {
        const isDoctor = type === 'doctor';
        doctorIllustration.style.display = isDoctor ? 'block' : 'none';
        patientIllustration.style.display = isDoctor ? 'none' : 'block';
      }

      clearMessages();
      clearErrors('doctor');
      clearErrors('patient');
    });
  });

  /* =======================
     Wilaya -> villes (2 formulaires)
     ======================= */
  ['doctor', 'patient'].forEach(type => {
    const wilayaSelect = document.getElementById(`${type}-wilaya`);
    const citySelect = document.getElementById(`${type}-city`);
    if (!wilayaSelect || !citySelect) return;

    wilayaSelect.addEventListener('change', () => {
      const wilaya = wilayaSelect.value;

      if (!wilaya) {
        citySelect.disabled = true;
        citySelect.innerHTML = '<option value="">Sélectionnez d’abord une wilaya</option>';
        return;
      }

      loadCities(wilaya, type);
    });
  });

  /* =======================
     Envoi des formulaires
     ======================= */
  doctorForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleDoctorRegistration();
  });

  patientForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handlePatientRegistration();
  });

  /* =======================
     Chargements API
     ======================= */
  async function loadWilayas() {
    try {
      const response = await fetch('/api/wilayas');
      const wilayas = await response.json();

      ['doctor', 'patient'].forEach(type => {
        const select = document.getElementById(`${type}-wilaya`);
        const citySelect = document.getElementById(`${type}-city`);
        if (!select) return;

        select.innerHTML = '<option value="">Sélectionner une wilaya</option>';
        (wilayas || []).forEach(w => {
          const opt = document.createElement('option');
          opt.value = w;
          opt.textContent = w;
          select.appendChild(opt);
        });

        // Réinitialiser la ville
        if (citySelect) {
          citySelect.disabled = true;
          citySelect.innerHTML = '<option value="">Sélectionnez d’abord une wilaya</option>';
        }
      });
    } catch (err) {
      showMessage('Impossible de charger les wilayas. Actualisez la page.', 'error');
    }
  }

  async function loadSpecialties() {
    try {
      const response = await fetch('/api/specialties');
      const specialties = await response.json();

      const select = document.getElementById('doctor-specialty');
      if (!select) return;

      select.innerHTML = '<option value="">Sélectionner une spécialité</option>';
      (specialties || []).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        select.appendChild(opt);
      });
    } catch (err) {
      showMessage('Impossible de charger les spécialités. Actualisez la page.', 'error');
    }
  }

  async function loadCities(wilaya, type) {
    const citySelect = document.getElementById(`${type}-city`);
    if (!citySelect) return;

    try {
      citySelect.disabled = true;
      citySelect.innerHTML = '<option value="">Chargement des villes...</option>';

      const response = await fetch(`/api/cities?wilaya=${encodeURIComponent(wilaya)}`);
      const cities = await response.json();

      citySelect.disabled = false;
      citySelect.innerHTML = '<option value="">Sélectionner une ville</option>';
      (cities || []).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        citySelect.appendChild(opt);
      });
    } catch (err) {
      citySelect.disabled = false;
      citySelect.innerHTML = '<option value="">Erreur de chargement</option>';
    }
  }

  /* =======================
     Inscription médecin
     ======================= */
  async function handleDoctorRegistration() {
    clearMessages();
    clearErrors('doctor');

    const doctorData = {
      firstName: val('doctor-fname'),
      lastName: val('doctor-lname'),
      email: val('doctor-email'),
      password: raw('doctor-password'),
      phone: val('doctor-phone'),
      sex: raw('doctor-sex'),
      wilaya: raw('doctor-wilaya'),
      city: raw('doctor-city'),
      specialty: raw('doctor-specialty'),
      locationLink: val('doctor-map-link') || null
    };

    if (!validateDoctorForm(doctorData)) return;

    setLoading('doctor', true);

    try {
      const response = await fetch('/register/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(doctorData)
      });

      const result = await safeJson(response);

      if (response.ok && result?.success) {
        showMessage('Inscription médecin réussie ! Redirection vers la connexion...', 'success');
        setTimeout(() => window.location.href = '/login', 1200);
      } else {
        showMessage(result?.message || 'Échec de l’inscription', 'error');
      }
    } catch (err) {
      showMessage('Inscription impossible. Réessayez plus tard.', 'error');
    } finally {
      setLoading('doctor', false);
    }
  }

  /* =======================
     Inscription patient
     ======================= */
  async function handlePatientRegistration() {
    clearMessages();
    clearErrors('patient');

    const patientData = {
      firstName: val('patient-fname'),
      lastName: val('patient-lname'),
      email: val('patient-email'),
      password: raw('patient-password'),
      phone: val('patient-phone'),
      sex: raw('patient-sex'),
      wilaya: raw('patient-wilaya'),
      city: raw('patient-city')
    };

    if (!validatePatientForm(patientData)) return;

    setLoading('patient', true);

    try {
      const response = await fetch('/register/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(patientData)
      });

      const result = await safeJson(response);

      if (response.ok && result?.success) {
        showMessage('Inscription patient réussie ! Redirection vers la connexion...', 'success');
        setTimeout(() => window.location.href = '/login', 1200);
      } else {
        showMessage(result?.message || 'Échec de l’inscription', 'error');
      }
    } catch (err) {
      showMessage('Inscription impossible. Réessayez plus tard.', 'error');
    } finally {
      setLoading('patient', false);
    }
  }

  /* =======================
     Validation
     ======================= */
  function validateDoctorForm(d) {
    let ok = true;

    if (!d.email) ok = fieldError('doctor-email-error', 'Email requis') && ok;
    else if (!isValidEmail(d.email)) ok = fieldError('doctor-email-error', 'Email invalide') && ok;

    if (!d.password) ok = fieldError('doctor-password-error', 'Mot de passe requis') && ok;
    else if (d.password.length < 6) ok = fieldError('doctor-password-error', 'Minimum 6 caractères') && ok;

    if (!d.firstName) ok = fieldError('doctor-fname-error', 'Prénom requis') && ok;
    if (!d.lastName) ok = fieldError('doctor-lname-error', 'Nom requis') && ok;

    if (!d.sex) ok = fieldError('doctor-sex-error', 'Sexe requis') && ok;

    if (!d.phone) ok = fieldError('doctor-phone-error', 'Téléphone requis') && ok;

    if (!d.wilaya) ok = fieldError('doctor-wilaya-error', 'Wilaya requise') && ok;
    if (!d.city) ok = fieldError('doctor-city-error', 'Ville requise') && ok;

    if (!d.specialty) ok = fieldError('doctor-specialty-error', 'Spécialité requise') && ok;

    return ok;
  }

  function validatePatientForm(p) {
    let ok = true;

    if (!p.email) ok = fieldError('patient-email-error', 'Email requis') && ok;
    else if (!isValidEmail(p.email)) ok = fieldError('patient-email-error', 'Email invalide') && ok;

    if (!p.password) ok = fieldError('patient-password-error', 'Mot de passe requis') && ok;
    else if (p.password.length < 6) ok = fieldError('patient-password-error', 'Minimum 6 caractères') && ok;

    if (!p.firstName) ok = fieldError('patient-fname-error', 'Prénom requis') && ok;
    if (!p.lastName) ok = fieldError('patient-lname-error', 'Nom requis') && ok;

    if (!p.sex) ok = fieldError('patient-sex-error', 'Sexe requis') && ok;

    if (!p.phone) ok = fieldError('patient-phone-error', 'Téléphone requis') && ok;

    if (!p.wilaya) ok = fieldError('patient-wilaya-error', 'Wilaya requise') && ok;
    if (!p.city) ok = fieldError('patient-city-error', 'Ville requise') && ok;

    return ok;
  }

  /* =======================
     Helpers UI
     ======================= */
  function showMessage(message, type) {
    const box = document.getElementById('message-container');
    if (!box) return alert(message);

    box.textContent = message;
    box.style.display = 'block';
    box.className = type === 'success' ? 'alert alert-success' : 'alert alert-danger';

    setTimeout(() => {
      if (box) box.style.display = 'none';
    }, 4500);
  }

  function clearMessages() {
    const box = document.getElementById('message-container');
    if (!box) return;
    box.style.display = 'none';
    box.textContent = '';
    box.className = '';
  }

  function fieldError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return false;
    el.textContent = msg;
    el.style.display = 'block';
    return false;
  }

  function clearErrors(type) {
    document.querySelectorAll('.error-message').forEach(el => {
      if (!type || el.id.includes(type)) {
        el.textContent = '';
        el.style.display = 'none';
      }
    });
  }

  function setLoading(type, on) {
    const spinner = type === 'doctor' ? doctorSpinner : patientSpinner;
    if (spinner) spinner.style.display = on ? 'inline-block' : 'none';

    const form = document.getElementById(`${type}-form`);
    if (!form) return;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = on;

    form.classList.toggle('loading', on);
  }

  /* =======================
     Utilitaires
     ======================= */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function raw(id) {
    return (document.getElementById(id)?.value ?? '').trim();
  }

  function val(id) {
    return raw(id);
  }

  async function safeJson(response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
});
