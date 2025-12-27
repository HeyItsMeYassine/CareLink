// static/assets/js/appointment.js
// Gestion du processus de prise de rendez-vous (4 étapes) côté patient.

document.addEventListener('DOMContentLoaded', () => {
  /* =======================
     Références DOM
     ======================= */
  const el = {
    // Étapes
    step1: document.getElementById('step-1'),
    step2: document.getElementById('step-2'),
    step3: document.getElementById('step-3'),
    step4: document.getElementById('step-4'),

    // Barre de progression
    c1: document.getElementById('step-1-circle'),
    c2: document.getElementById('step-2-circle'),
    c3: document.getElementById('step-3-circle'),
    c4: document.getElementById('step-4-circle'),
    l1: document.getElementById('line-1'),
    l2: document.getElementById('line-2'),
    l3: document.getElementById('line-3'),

    // Texte de l’en-tête
    cardTitle: document.getElementById('card-title'),
    cardDesc: document.getElementById('card-description'),

    // Étape 1
    wilaya: document.getElementById('wilaya-select'),
    specialty: document.getElementById('specialty-select'),
    next1: document.getElementById('next-1'),

    // Étape 2
    cityFilter: document.getElementById('city-filter-select'),
    doctorsList: document.getElementById('doctors-list'),
    back2: document.getElementById('back-2'),
    next2: document.getElementById('next-2'),

    // Étape 3
    calendar: document.getElementById('calendar'),
    timeGroup: document.getElementById('time-group'),
    timeSlots: document.getElementById('time-slots'),
    back3: document.getElementById('back-3'),
    next3: document.getElementById('next-3'),

    // Étape 4
    confirmation: document.getElementById('confirmation-details'),
    back4: document.getElementById('back-4'),
    confirmBtn: document.getElementById('confirm-appointment'),

    // Conteneur des notifications (optionnel)
    toastContainer: document.getElementById('toast-container'),
  };

  /* Vérification : si des éléments indispensables manquent, on stoppe pour éviter une erreur */
  const required = [
    ['step-1', el.step1],
    ['step-2', el.step2],
    ['step-3', el.step3],
    ['step-4', el.step4],

    ['step-1-circle', el.c1],
    ['step-2-circle', el.c2],
    ['step-3-circle', el.c3],
    ['step-4-circle', el.c4],
    ['line-1', el.l1],
    ['line-2', el.l2],
    ['line-3', el.l3],

    ['card-title', el.cardTitle],
    ['card-description', el.cardDesc],

    ['wilaya-select', el.wilaya],
    ['specialty-select', el.specialty],
    ['next-1', el.next1],

    ['city-filter-select', el.cityFilter],
    ['doctors-list', el.doctorsList],
    ['back-2', el.back2],
    ['next-2', el.next2],

    ['calendar', el.calendar],
    ['time-group', el.timeGroup],
    ['time-slots', el.timeSlots],
    ['back-3', el.back3],
    ['next-3', el.next3],

    ['confirmation-details', el.confirmation],
    ['back-4', el.back4],
    ['confirm-appointment', el.confirmBtn],
  ];

  const missing = required.filter(([, node]) => !node).map(([id]) => id);

  if (missing.length) {
    console.error('[appointment.js] Éléments manquants (IDs) :', missing);
    toast(`Interface incomplète : ${missing.join(', ')}`, 'error');
    return;
  }

  /* =======================
     État de l’assistant
     ======================= */
  const state = {
    currentStep: 1,
    wilaya: '',
    specialty: '',
    cityFilter: '', // filtre optionnel (vide = toutes les villes)
    doctor: null,   // médecin sélectionné
    date: '',
    time: '',
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear(),
  };

  init();

  /* =======================
     Initialisation
     ======================= */
  async function init() {
    setStep(1);
    await loadWilayas();
    await loadSpecialties();
    wireEvents();
    renderCalendar(state.calendarYear, state.calendarMonth);
  }

  /* =======================
     Événements utilisateur
     ======================= */
  function wireEvents() {
    // Étape 1 : sélection de la wilaya
    el.wilaya.addEventListener('change', async () => {
      state.wilaya = el.wilaya.value;
      state.cityFilter = '';

      el.cityFilter.innerHTML = '<option value="">Toutes les villes</option>';
      el.cityFilter.disabled = true;

      // Réinitialiser la sélection du médecin
      state.doctor = null;
      el.next2.disabled = true;

      // Activer/désactiver "Suivant"
      el.next1.disabled = !(state.wilaya && state.specialty);

      // Charger les villes pour le filtre (optionnel)
      if (state.wilaya) {
        await loadCitiesForFilter(state.wilaya);
      }
    });

    // Étape 1 : sélection de la spécialité
    el.specialty.addEventListener('change', () => {
      state.specialty = el.specialty.value;
      el.next1.disabled = !(state.wilaya && state.specialty);
    });

    // Aller à l'étape 2
    el.next1.addEventListener('click', async () => {
      if (!(state.wilaya && state.specialty)) return;
      await loadDoctors();
      setStep(2);
    });

    // Étape 2 : filtre par ville (optionnel)
    el.cityFilter.addEventListener('change', async () => {
      state.cityFilter = el.cityFilter.value || '';
      await loadDoctors();
    });

    // Navigation étape 2
    el.back2.addEventListener('click', () => setStep(1));

    el.next2.addEventListener('click', () => {
      if (!state.doctor) return;

      // Réinitialiser date/heure
      state.date = '';
      state.time = '';
      el.timeGroup.classList.add('hidden');
      el.timeSlots.innerHTML = '';
      el.next3.disabled = true;

      // Revenir au mois courant
      const now = new Date();
      state.calendarMonth = now.getMonth();
      state.calendarYear = now.getFullYear();
      renderCalendar(state.calendarYear, state.calendarMonth);

      setStep(3);
    });

    // Navigation étape 3
    el.back3.addEventListener('click', () => setStep(2));
    el.next3.addEventListener('click', () => {
      if (!state.date || !state.time) return;
      renderConfirmation();
      setStep(4);
    });

    // Navigation étape 4
    el.back4.addEventListener('click', () => setStep(3));
    el.confirmBtn.addEventListener('click', confirmAppointment);
  }

  /* =======================
     Gestion des étapes (UI)
     ======================= */
  function setStep(step) {
    state.currentStep = step;

    // Afficher uniquement l’étape courante
    [el.step1, el.step2, el.step3, el.step4].forEach(s => s.classList.add('hidden'));
    if (step === 1) el.step1.classList.remove('hidden');
    if (step === 2) el.step2.classList.remove('hidden');
    if (step === 3) el.step3.classList.remove('hidden');
    if (step === 4) el.step4.classList.remove('hidden');

    // Mettre à jour le titre/description
    if (step === 1) {
      el.cardTitle.textContent = 'Sélection des filtres';
      el.cardDesc.textContent = 'Choisissez la wilaya et la spécialité.';
    }
    if (step === 2) {
      el.cardTitle.textContent = 'Choix du médecin';
      el.cardDesc.textContent = 'Filtrez par ville (optionnel) puis sélectionnez un médecin.';
    }
    if (step === 3) {
      el.cardTitle.textContent = 'Date et heure';
      el.cardDesc.textContent = 'Choisissez une date puis un créneau horaire.';
    }
    if (step === 4) {
      el.cardTitle.textContent = 'Confirmation';
      el.cardDesc.textContent = 'Vérifiez les informations avant validation.';
    }

    setProgress(step);
  }

  // Met à jour l’état visuel des cercles/lignes
  function setProgress(step) {
    const circles = [el.c1, el.c2, el.c3, el.c4];
    const lines = [el.l1, el.l2, el.l3];

    circles.forEach((c, i) => {
      const idx = i + 1;
      c.classList.remove('active', 'inactive');
      c.classList.add(idx <= step ? 'active' : 'inactive');
    });

    lines.forEach((l, i) => {
      const idx = i + 1;
      l.classList.remove('active', 'inactive');
      l.classList.add(idx < step ? 'active' : 'inactive');
    });
  }

  /* =======================
     Chargement des données
     ======================= */
  async function loadWilayas() {
    try {
      const r = await fetch('/api/wilayas');
      if (!r.ok) throw new Error(`Wilayas API failed: ${r.status}`);
      const wilayas = await r.json();

      el.wilaya.innerHTML = '<option value="">Sélectionner une wilaya</option>';
      (wilayas || []).forEach(w => {
        const o = document.createElement('option');
        o.value = w;
        o.textContent = w;
        el.wilaya.appendChild(o);
      });
    } catch (e) {
      console.error(e);
      toast('Impossible de charger les wilayas', 'error');
    }
  }

  async function loadSpecialties() {
    try {
      const r = await fetch('/api/specialties');
      if (!r.ok) throw new Error(`Specialties API failed: ${r.status}`);
      const specialties = await r.json();

      el.specialty.innerHTML = '<option value="">Sélectionner une spécialité</option>';
      (specialties || []).forEach(s => {
        const o = document.createElement('option');
        o.value = s;
        o.textContent = s;
        el.specialty.appendChild(o);
      });
      el.specialty.disabled = false;
    } catch (e) {
      console.error(e);
      toast('Impossible de charger les spécialités', 'error');
    }
  }

  async function loadCitiesForFilter(wilaya) {
    try {
      const r = await fetch(`/api/cities?wilaya=${encodeURIComponent(wilaya)}`);
      if (!r.ok) throw new Error(`Cities API failed: ${r.status}`);
      const cities = await r.json();

      el.cityFilter.innerHTML = '<option value="">Toutes les villes</option>';
      (cities || []).forEach(c => {
        const o = document.createElement('option');
        o.value = c;
        o.textContent = c;
        el.cityFilter.appendChild(o);
      });

      el.cityFilter.disabled = false;
      el.cityFilter.value = '';
      state.cityFilter = '';
    } catch (e) {
      console.error(e);
      // On laisse le flux continuer même si le filtre villes échoue
      el.cityFilter.innerHTML = '<option value="">Toutes les villes</option>';
      el.cityFilter.disabled = false;
    }
  }

  async function loadDoctors() {
    el.doctorsList.innerHTML = '<p style="color:#6b7280">Chargement des médecins...</p>';
    el.next2.disabled = true;
    state.doctor = null;

    try {
      const params = new URLSearchParams();
      if (state.wilaya) params.append('wilaya', state.wilaya);
      if (state.specialty) params.append('specialty', state.specialty);
      if (state.cityFilter) params.append('city', state.cityFilter);

      const r = await fetch(`/api/doctors?${params.toString()}`);
      if (!r.ok) throw new Error(`Doctors API failed: ${r.status}`);
      let doctors = await r.json();

      // Filtrer les comptes de test
      doctors = (doctors || []).filter(d => !isTestDoctor(d));

      if (!doctors || doctors.length === 0) {
        el.doctorsList.innerHTML = '<p style="color:#6b7280">Aucun médecin trouvé.</p>';
        return;
      }

      // Générer la liste des cartes
      el.doctorsList.innerHTML = doctors.map(d => doctorCardHTML(d)).join('');

      // Gestion de la sélection d’un médecin
      document.querySelectorAll('.doctor-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.doctor-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');

          const id = card.dataset.doctorId;
          state.doctor = doctors.find(x => String(x.id) === String(id)) || null;
          el.next2.disabled = !state.doctor;
        });
      });

    } catch (e) {
      console.error(e);
      el.doctorsList.innerHTML = '<p style="color:#ef4444">Erreur lors du chargement.</p>';
      toast('Impossible de charger les médecins', 'error');
    }
  }

  // Génère le HTML d’une carte médecin
  function doctorCardHTML(doctor) {
    const speciality = doctor.speciality || doctor.specialty || '';
    const phone = doctor.phone || '';
    const city = doctor.city || '';
    const wilaya = doctor.wilaya || '';
    const address = doctor.address || '';
    const email = doctor.email || '';

    return `
      <div class="doctor-card" data-doctor-id="${doctor.id}">
        <div class="doctor-card-header">
          <div class="doctor-info">
            <h3>Dr. ${escapeHTML(doctor.firstName || '')} ${escapeHTML(doctor.lastName || '')}</h3>
            <div class="doctor-specialty">${escapeHTML(speciality)}</div>
            <div class="doctor-phone">${escapeHTML(phone)}</div>
            <div class="doctor-phone">${escapeHTML(address ? (address + ' - ') : '')}${escapeHTML(city)}${city && wilaya ? ', ' : ''}${escapeHTML(wilaya)}</div>
            ${email ? `<div class="doctor-phone">${escapeHTML(email)}</div>` : ''}
          </div>

          <div class="radio-circle" aria-hidden="true">
            <svg class="radio-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  // Détecte des données de test (à ne pas afficher)
  function isTestDoctor(d) {
    const first = String(d?.firstName || '').toLowerCase();
    const last = String(d?.lastName || '').toLowerCase();
    const fullName = `${first} ${last}`.trim();

    const email = String(d?.email || '').toLowerCase();
    const phone = String(d?.phone || '').toLowerCase();

    return (
      fullName === 'test doctor' ||
      first === 'test' ||
      last === 'doctor' ||
      email.includes('test') ||
      phone.includes('0000')
    );
  }

  /* =======================
     Calendrier & créneaux
     ======================= */
  function renderCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();

    const monthName = firstDay.toLocaleString(undefined, { month: 'long', year: 'numeric' });

    const header = `
      <div class="calendar-header">
        <button class="calendar-nav" id="cal-prev" aria-label="Mois précédent">‹</button>
        <div>${escapeHTML(monthName)}</div>
        <button class="calendar-nav" id="cal-next" aria-label="Mois suivant">›</button>
      </div>
    `;

    const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      .map(d => `<div class="calendar-day-label">${d}</div>`).join('');

    let daysHtml = '';

    // Cases vides au début (alignement du calendrier)
    for (let i = 0; i < startWeekday; i++) {
      daysHtml += `<div class="calendar-day empty"></div>`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dayObj = new Date(year, month, day);
      dayObj.setHours(0, 0, 0, 0);

      const iso = toISODate(dayObj);
      const isPast = dayObj < today;

      // Bloquer vendredi + samedi
      const weekday = dayObj.getDay();
      const isWeekendBlocked = (weekday === 5 || weekday === 6);

      const isSelected = state.date === iso;

      const cls = [
        'calendar-day',
        (isPast || isWeekendBlocked) ? 'disabled' : '',
        isSelected ? 'selected' : ''
      ].join(' ').trim();

      daysHtml += `<div class="${cls}" data-date="${iso}">${day}</div>`;
    }

    el.calendar.innerHTML = `
      ${header}
      <div class="calendar-grid">
        ${labels}
        ${daysHtml}
      </div>
    `;

    // Navigation mois précédent
    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');

    prevBtn.addEventListener('click', () => {
      const now = new Date();
      const curFirst = new Date(state.calendarYear, state.calendarMonth, 1);
      const nowFirst = new Date(now.getFullYear(), now.getMonth(), 1);

      // Empêche de revenir avant le mois courant
      if (curFirst <= nowFirst) return;

      state.calendarMonth -= 1;
      if (state.calendarMonth < 0) {
        state.calendarMonth = 11;
        state.calendarYear -= 1;
      }
      renderCalendar(state.calendarYear, state.calendarMonth);
    });

    // Navigation mois suivant
    nextBtn.addEventListener('click', () => {
      state.calendarMonth += 1;
      if (state.calendarMonth > 11) {
        state.calendarMonth = 0;
        state.calendarYear += 1;
      }
      renderCalendar(state.calendarYear, state.calendarMonth);
    });

    // Sélection d’un jour
    el.calendar.querySelectorAll('.calendar-day').forEach(dayEl => {
      if (dayEl.classList.contains('disabled') || dayEl.classList.contains('empty')) return;

      dayEl.addEventListener('click', async () => {
        const date = dayEl.dataset.date;
        state.date = date;
        state.time = '';
        el.next3.disabled = true;

        renderCalendar(state.calendarYear, state.calendarMonth);
        await renderTimeSlots(date);
      });
    });
  }

  async function renderTimeSlots(date) {
    el.timeGroup.classList.remove('hidden');
    el.timeSlots.innerHTML = '<div style="color:#6b7280">Chargement des créneaux...</div>';

    // Créneaux horaires (08:00 → 15:00)
    const slots = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00'];

    // Tous disponibles (pas de vérification API ici)
    const availability = {};
    slots.forEach(t => availability[t] = true);

    el.timeSlots.innerHTML = slots.map(t => {
      const ok = availability[t] !== false;
      const cls = ['time-slot', ok ? '' : 'disabled', state.time === t ? 'selected' : ''].join(' ').trim();
      return `<div class="${cls}" data-time="${t}">${t}</div>`;
    }).join('');

    // Sélection d’un créneau
    el.timeSlots.querySelectorAll('.time-slot').forEach(slotEl => {
      if (slotEl.classList.contains('disabled')) return;

      slotEl.addEventListener('click', () => {
        el.timeSlots.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slotEl.classList.add('selected');
        state.time = slotEl.dataset.time;
        el.next3.disabled = !(state.date && state.time);
      });
    });
  }

  /* =======================
     Confirmation & envoi
     ======================= */
  function renderConfirmation() {
    const d = state.doctor || {};
    const cityDisplay = state.cityFilter ? state.cityFilter : 'Toutes les villes';

    el.confirmation.innerHTML = `
      <h3>Détails du rendez-vous</h3>

      <div class="confirmation-item">
        <div class="confirmation-label">Wilaya</div>
        <div class="confirmation-value">${escapeHTML(state.wilaya)}</div>
      </div>

      <div class="confirmation-item">
        <div class="confirmation-label">Spécialité</div>
        <div class="confirmation-value specialty-value">${escapeHTML(state.specialty)}</div>
      </div>

      <div class="confirmation-item">
        <div class="confirmation-label">Filtre ville</div>
        <div class="confirmation-value">${escapeHTML(cityDisplay)}</div>
      </div>

      <div class="confirmation-item">
        <div class="confirmation-label">Médecin</div>
        <div class="confirmation-value">Dr. ${escapeHTML(d.firstName || '')} ${escapeHTML(d.lastName || '')}</div>
      </div>

      <div class="confirmation-item">
        <div class="confirmation-label">Date</div>
        <div class="confirmation-value">${escapeHTML(state.date)}</div>
      </div>

      <div class="confirmation-item">
        <div class="confirmation-label">Heure</div>
        <div class="confirmation-value">${escapeHTML(state.time)}</div>
      </div>
    `;
  }

  async function confirmAppointment() {
    // Vérification minimale avant envoi
    if (!state.doctor?.id || !state.date || !state.time) {
      toast('Informations du rendez-vous incomplètes', 'error');
      return;
    }

    el.confirmBtn.disabled = true;
    el.confirmBtn.textContent = 'Validation...';

    try {
      const r = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: String(state.doctor.id),
          date: state.date,
          time: state.time
        })
      });

      const result = await r.json();

      if (r.ok && result.success) {
        toast(result.message || 'Rendez-vous créé ✅', 'success');
        setTimeout(() => window.location.href = '/patient/dashboard', 900);
      } else {
        toast(result.message || 'Échec de la réservation', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Erreur réseau lors de la réservation', 'error');
    } finally {
      el.confirmBtn.disabled = false;
      el.confirmBtn.textContent = 'Confirmer le rendez-vous';
    }
  }

  /* =======================
     Fonctions utilitaires
     ======================= */
  function toISODate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Protection contre l’injection HTML lors de l’affichage des données
  function escapeHTML(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[m]));
  }

  // Crée le conteneur de toast s’il n’existe pas
  function ensureToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  // Affiche une notification temporaire
  function toast(message, type = 'info') {
    const container = ensureToastContainer();
    if (!container) return alert(message);

    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `
      <div style="font-weight:800; flex:1;">${escapeHTML(message)}</div>
      <button aria-label="Fermer">×</button>
    `;

    t.querySelector('button').addEventListener('click', () => t.remove());
    container.appendChild(t);

    setTimeout(() => {
      if (t.parentNode) t.remove();
    }, 3500);
  }
});
