// ----- État de la réservation -----
const state = {
  sport: 'football',
  date: null,
  slot: null,
  players: 10
};

// Effectifs autorisés pour chaque sport
const PLAYER_OPTIONS = {
  football: [10, 14, 22],
  padel: [4, 8]
};

const SLOTS = {
  'MATIN': ['08:00', '09:00', '10:00', '11:00'],
  'APRÈS-MIDI': ['12:00', '13:00', '14:00', '15:00'],
  'SOIR': ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']
};

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const today = new Date();
today.setHours(0, 0, 0, 0);
let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);

// ----- Sélection du sport -----
document.querySelectorAll('.sport-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.sport-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.sport = card.dataset.sport;
    renderAll();
  });
});

// ----- Calendrier -----
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  document.getElementById('monthLabel').textContent = `${MONTHS[month]} ${year}`;

  const grid = document.getElementById('calGrid');
  grid.innerHTML = DAYS.map(d => `<div class="dow">${d}</div>`).join('');

  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  for (let i = 0; i < offset; i++) {
    grid.insertAdjacentHTML('beforeend', '<div></div>');
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const btn = document.createElement('button');
    btn.className = 'day';
    btn.textContent = d;
    btn.disabled = date < today;

    if (state.date && sameDay(date, state.date)) btn.classList.add('selected');

    btn.addEventListener('click', () => {
      state.date = date;
      state.slot = null;
      renderAll();
    });
    grid.appendChild(btn);
  }
}

document.getElementById('prevMonth').addEventListener('click', () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  renderCalendar();
});

// ----- Créneaux (simulation) -----
function isBooked(date, time) {
  return (date.getDate() + parseInt(time, 10)) % 4 === 0;
}

function renderSlots() {
  const container = document.getElementById('slots');

  if (!state.date) {
    container.innerHTML = `<p class="slots-empty">Choisis d'abord une date pour voir les créneaux.</p>`;
    return;
  }

  container.innerHTML = Object.entries(SLOTS).map(([label, times]) => `
    <div class="slot-group">
      <h4>${label}</h4>
      <div class="slot-list">
        ${times.map(t => {
          const booked = isBooked(state.date, t);
          const selected = state.slot === t ? 'selected' : '';
          return `<button class="slot ${selected}" data-time="${t}" ${booked ? 'disabled' : ''}>${t}</button>`;
        }).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.slot').forEach(btn => {
    btn.addEventListener('click', () => {
      state.slot = btn.dataset.time;
      renderAll();
    });
  });
}

// ----- Compteur de joueurs (effectifs fixes) -----
function renderPlayers() {
  const options = PLAYER_OPTIONS[state.sport];

  // Si le nombre sélectionné n'est plus autorisé pour ce sport, on prend la première option
  if (!options.includes(state.players)) {
    state.players = options[0];
  }

  document.getElementById('players').textContent = state.players;

  const index = options.indexOf(state.players);
  document.getElementById('minus').disabled = index === 0;
  document.getElementById('plus').disabled = index === options.length - 1;

  const label = state.sport === 'football'
    ? 'Matchs de football : 10, 14 ou 22 joueurs'
    : 'Matchs de padel : 4 ou 8 joueurs';
  document.getElementById('playersHint').textContent = `👥 ${label}`;
}

document.getElementById('minus').addEventListener('click', () => {
  const options = PLAYER_OPTIONS[state.sport];
  const index = options.indexOf(state.players);
  if (index > 0) {
    state.players = options[index - 1];
    renderAll();
  }
});

document.getElementById('plus').addEventListener('click', () => {
  const options = PLAYER_OPTIONS[state.sport];
  const index = options.indexOf(state.players);
  if (index < options.length - 1) {
    state.players = options[index + 1];
    renderAll();
  }
});

// ----- Bouton "Voir les disponibilités" -----
document.getElementById('btnCheck').addEventListener('click', () => {
  const feedback = document.getElementById('feedback');

  if (!state.date) {
    feedback.textContent = 'Merci de choisir une date.';
    return;
  }
  if (!state.slot) {
    feedback.textContent = 'Merci de choisir un créneau.';
    return;
  }

  const dateStr = state.date.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const sportName = state.sport === 'football' ? 'Football' : 'Padel';

  feedback.textContent =
    `✅ ${sportName} • ${dateStr} à ${state.slot} • ${state.players} joueur(s) — Terrain disponible !`;
});

// ----- Rendu global -----
function renderAll() {
  renderCalendar();
  renderSlots();
  renderPlayers();
}

renderAll();