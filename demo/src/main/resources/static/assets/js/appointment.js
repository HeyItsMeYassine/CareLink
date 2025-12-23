// static/assets/js/appointment.js (FIXED)
// - Prevents crashes if any HTML id/class is missing after styling edits
// - Shows clear console + toast error listing missing elements
// - Keeps your original logic the same

document.addEventListener('DOMContentLoaded', () => {
  const el = {
    // steps
    step1: document.getElementById('step-1'),
    step2: document.getElementById('step-2'),
    step3: document.getElementById('step-3'),
    step4: document.getElementById('step-4'),

    // progress
    c1: document.getElementById('step-1-circle'),
    c2: document.getElementById('step-2-circle'),
    c3: document.getElementById('step-3-circle'),
    c4: document.getElementById('step-4-circle'),
    l1: document.getElementById('line-1'),
    l2: document.getElementById('line-2'),
    l3: document.getElementById('line-3'),

    // header text
    cardTitle: document.getElementById('card-title'),
    cardDesc: document.getElementById('card-description'),

    // step 1
    wilaya: document.getElementById('wilaya-select'),
    specialty: document.getElementById('specialty-select'),
    next1: document.getElementById('next-1'),

    // step 2
    cityFilter: document.getElementById('city-filter-select'),
    doctorsList: document.getElementById('doctors-list'),
    back2: document.getElementById('back-2'),
    next2: document.getElementById('next-2'),

    // step 3
    calendar: document.getElementById('calendar'),
    timeGroup: document.getElementById('time-group'),
    timeSlots: document.getElementById('time-slots'),
    back3: document.getElementById('back-3'),
    next3: document.getElementById('next-3'),

    // step 4
    confirmation: document.getElementById('confirmation-details'),
    back4: document.getElementById('back-4'),
    confirmBtn: document.getElementById('confirm-appointment'),

    // toast container (optional)
    toastContainer: document.getElementById('toast-container'),
  };

  // ---- Guard: verify required elements exist ----
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
    console.error('[appointment.js] Missing required elements (IDs):', missing);
    // try toast, fallback alert
    toast(`Appointment UI is missing elements: ${missing.join(', ')}`, 'error');
    return; // stop to avoid crashing
  }

  const state = {
    currentStep: 1,
    wilaya: '',
    specialty: '',
    cityFilter: '', // optional filter ("" => all cities)
    doctor: null,   // selected doctor object
    date: '',
    time: '',
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear(),
  };

  init();

  async function init() {
    setStep(1);
    await loadWilayas();
    await loadSpecialties();
    wireEvents();
    renderCalendar(state.calendarYear, state.calendarMonth);
  }

  function wireEvents() {
    // Step 1: Wilaya
    el.wilaya.addEventListener('change', async () => {
      state.wilaya = el.wilaya.value;
      state.cityFilter = '';

      el.cityFilter.innerHTML = '<option value="">All cities</option>';
      el.cityFilter.disabled = true;

      // reset doctor selection
      state.doctor = null;
      el.next2.disabled = true;

      // update "Next"
      el.next1.disabled = !(state.wilaya && state.specialty);

      // load cities for step2 filter (optional)
      if (state.wilaya) {
        await loadCitiesForFilter(state.wilaya);
      }
    });

    // Step 1: Specialty
    el.specialty.addEventListener('change', () => {
      state.specialty = el.specialty.value;
      el.next1.disabled = !(state.wilaya && state.specialty);
    });

    // Go Step2
    el.next1.addEventListener('click', async () => {
      if (!(state.wilaya && state.specialty)) return;
      await loadDoctors();
      setStep(2);
    });

    // Step 2: City filter (optional)
    el.cityFilter.addEventListener('change', async () => {
      state.cityFilter = el.cityFilter.value || '';
      await loadDoctors();
    });

    // Step 2 navigation
    el.back2.addEventListener('click', () => setStep(1));

    el.next2.addEventListener('click', () => {
      if (!state.doctor) return;

      state.date = '';
      state.time = '';
      el.timeGroup.classList.add('hidden');
      el.timeSlots.innerHTML = '';
      el.next3.disabled = true;

      const now = new Date();
      state.calendarMonth = now.getMonth();
      state.calendarYear = now.getFullYear();
      renderCalendar(state.calendarYear, state.calendarMonth);

      setStep(3);
    });

    // Step 3
    el.back3.addEventListener('click', () => setStep(2));
    el.next3.addEventListener('click', () => {
      if (!state.date || !state.time) return;
      renderConfirmation();
      setStep(4);
    });

    // Step 4
    el.back4.addEventListener('click', () => setStep(3));
    el.confirmBtn.addEventListener('click', confirmAppointment);
  }

  // ---------- Step UI ----------
  function setStep(step) {
    state.currentStep = step;

    [el.step1, el.step2, el.step3, el.step4].forEach(s => s.classList.add('hidden'));
    if (step === 1) el.step1.classList.remove('hidden');
    if (step === 2) el.step2.classList.remove('hidden');
    if (step === 3) el.step3.classList.remove('hidden');
    if (step === 4) el.step4.classList.remove('hidden');

    if (step === 1) {
      el.cardTitle.textContent = 'Select Filters';
      el.cardDesc.textContent = 'Choose wilaya and specialty to find doctors';
    }
    if (step === 2) {
      el.cardTitle.textContent = 'Choose a Doctor';
      el.cardDesc.textContent = 'Optionally filter by city, then select a doctor';
    }
    if (step === 3) {
      el.cardTitle.textContent = 'Pick Date & Time';
      el.cardDesc.textContent = 'Choose the date then select an available time slot';
    }
    if (step === 4) {
      el.cardTitle.textContent = 'Confirm Appointment';
      el.cardDesc.textContent = 'Review details before confirming';
    }

    setProgress(step);
  }

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

  // ---------- Data Loading ----------
  async function loadWilayas() {
    try {
      const r = await fetch('/api/wilayas');
      if (!r.ok) throw new Error(`Wilayas API failed: ${r.status}`);
      const wilayas = await r.json();

      el.wilaya.innerHTML = '<option value="">Select a wilaya</option>';
      (wilayas || []).forEach(w => {
        const o = document.createElement('option');
        o.value = w;
        o.textContent = w;
        el.wilaya.appendChild(o);
      });
    } catch (e) {
      console.error(e);
      toast('Failed to load wilayas', 'error');
    }
  }

  async function loadSpecialties() {
    try {
      const r = await fetch('/api/specialties');
      if (!r.ok) throw new Error(`Specialties API failed: ${r.status}`);
      const specialties = await r.json();

      el.specialty.innerHTML = '<option value="">Select a specialty</option>';
      (specialties || []).forEach(s => {
        const o = document.createElement('option');
        o.value = s;
        o.textContent = s;
        el.specialty.appendChild(o);
      });
      el.specialty.disabled = false;
    } catch (e) {
      console.error(e);
      toast('Failed to load specialties', 'error');
    }
  }

  async function loadCitiesForFilter(wilaya) {
    try {
      const r = await fetch(`/api/cities?wilaya=${encodeURIComponent(wilaya)}`);
      if (!r.ok) throw new Error(`Cities API failed: ${r.status}`);
      const cities = await r.json();

      el.cityFilter.innerHTML = '<option value="">All cities</option>';
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
      // still allow flow without city filter
      el.cityFilter.innerHTML = '<option value="">All cities</option>';
      el.cityFilter.disabled = false;
    }
  }

  async function loadDoctors() {
    el.doctorsList.innerHTML = '<p style="color:#6b7280">Loading doctors...</p>';
    el.next2.disabled = true;
    state.doctor = null;

    try {
      const params = new URLSearchParams();
      if (state.wilaya) params.append('wilaya', state.wilaya);
      if (state.specialty) params.append('specialty', state.specialty);
      if (state.cityFilter) params.append('city', state.cityFilter); // optional

      const r = await fetch(`/api/doctors?${params.toString()}`);
      if (!r.ok) throw new Error(`Doctors API failed: ${r.status}`);
      let doctors = await r.json();

      doctors = (doctors || []).filter(d => !isTestDoctor(d));

      if (!doctors || doctors.length === 0) {
        el.doctorsList.innerHTML = '<p style="color:#6b7280">No doctors found for these filters.</p>';
        return;
      }

      el.doctorsList.innerHTML = doctors.map(d => doctorCardHTML(d)).join('');

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
      el.doctorsList.innerHTML = '<p style="color:#ef4444">Error loading doctors.</p>';
      toast('Failed to load doctors', 'error');
    }
  }

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

  // ---------- Calendar & Time ----------
  function renderCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();

    const monthName = firstDay.toLocaleString(undefined, { month: 'long', year: 'numeric' });

    const header = `
      <div class="calendar-header">
        <button class="calendar-nav" id="cal-prev" aria-label="Previous month">‹</button>
        <div>${escapeHTML(monthName)}</div>
        <button class="calendar-nav" id="cal-next" aria-label="Next month">›</button>
      </div>
    `;

    const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      .map(d => `<div class="calendar-day-label">${d}</div>`).join('');

    let daysHtml = '';

    for (let i = 0; i < startWeekday; i++) {
      daysHtml += `<div class="calendar-day empty"></div>`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dayObj = new Date(year, month, day);
      dayObj.setHours(0, 0, 0, 0);

      const iso = toISODate(dayObj);
      const isPast = dayObj < today;

      // 0 Sun ... 5 Fri ... 6 Sat
      const weekday = dayObj.getDay();
      const isWeekendBlocked = (weekday === 5 || weekday === 6); // Friday + Saturday

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

    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');

    prevBtn.addEventListener('click', () => {
      const now = new Date();
      const curFirst = new Date(state.calendarYear, state.calendarMonth, 1);
      const nowFirst = new Date(now.getFullYear(), now.getMonth(), 1);
      if (curFirst <= nowFirst) return;

      state.calendarMonth -= 1;
      if (state.calendarMonth < 0) { state.calendarMonth = 11; state.calendarYear -= 1; }
      renderCalendar(state.calendarYear, state.calendarMonth);
    });

    nextBtn.addEventListener('click', () => {
      state.calendarMonth += 1;
      if (state.calendarMonth > 11) { state.calendarMonth = 0; state.calendarYear += 1; }
      renderCalendar(state.calendarYear, state.calendarMonth);
    });

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
    el.timeSlots.innerHTML = '<div style="color:#6b7280">Loading available times...</div>';

    // Hourly slots from 08:00 to 15:00
    const slots = [
      '08:00','09:00','10:00','11:00',
      '12:00','13:00','14:00','15:00'
    ];

    // All hours available (no API checks)
    const availability = {};
    slots.forEach(t => availability[t] = true);

    el.timeSlots.innerHTML = slots.map(t => {
      const ok = availability[t] !== false;
      const cls = ['time-slot', ok ? '' : 'disabled', state.time === t ? 'selected' : ''].join(' ').trim();
      return `<div class="${cls}" data-time="${t}">${t}</div>`;
    }).join('');

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

  // ---------- Confirmation + Submit ----------
  function renderConfirmation() {
    const d = state.doctor || {};
    const cityDisplay = state.cityFilter ? state.cityFilter : 'All cities';

    el.confirmation.innerHTML = `
      <h3>Appointment Details</h3>

      <div class="confirmation-item">
        <div class="confirmation-label">Wilaya</div>
        <div class="confirmation-value">${escapeHTML(state.wilaya)}</div>
      </div>

      <div class="confirmation-item">
        <div class="confirmation-label">Specialty</div>
        <div class="confirmation-value specialty-value">${escapeHTML(state.specialty)}</div>
      </div>

      <div class="confirmation-item">
        <div class="confirmation-label">City Filter</div>
        <div class="confirmation-value">${escapeHTML(cityDisplay)}</div>
      </div>

      <div class="confirmation-item">
        <div class="confirmation-label">Doctor</div>
        <div class="confirmation-value">Dr. ${escapeHTML(d.firstName || '')} ${escapeHTML(d.lastName || '')}</div>
      </div>

      <div class="confirmation-item">
        <div class="confirmation-label">Date</div>
        <div class="confirmation-value">${escapeHTML(state.date)}</div>
      </div>

      <div class="confirmation-item">
        <div class="confirmation-label">Time</div>
        <div class="confirmation-value">${escapeHTML(state.time)}</div>
      </div>
    `;
  }

  async function confirmAppointment() {
    if (!state.doctor?.id || !state.date || !state.time) {
      toast('Missing appointment details', 'error');
      return;
    }

    el.confirmBtn.disabled = true;
    el.confirmBtn.textContent = 'Booking...';

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
        toast(result.message || 'Appointment created ✅', 'success');
        setTimeout(() => window.location.href = '/patient/dashboard', 900);
      } else {
        toast(result.message || 'Booking failed', 'error');
      }
    } catch (e) {
      console.error(e);
      toast('Network error while booking', 'error');
    } finally {
      el.confirmBtn.disabled = false;
      el.confirmBtn.textContent = 'Confirm Appointment';
    }
  }

  // ---------- Helpers ----------
  function toISODate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function escapeHTML(str) {
    return String(str ?? '').replace(/[&<>"']/g, (m) => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[m]));
  }

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

  function toast(message, type = 'info') {
    const container = ensureToastContainer();
    if (!container) return alert(message);

    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `
      <div style="font-weight:800; flex:1;">${escapeHTML(message)}</div>
      <button aria-label="Close">×</button>
    `;

    t.querySelector('button').addEventListener('click', () => t.remove());
    container.appendChild(t);

    setTimeout(() => {
      if (t.parentNode) t.remove();
    }, 3500);
  }
});
