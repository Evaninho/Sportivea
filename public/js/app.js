// Variables globales
let allEvents = [];
let filteredEvents = [];
let currentDetailEventId = null;

// Charger les événements au démarrage
document.addEventListener('DOMContentLoaded', loadEvents);

// ============ CHARGER LES ÉVÉNEMENTS ============
async function loadEvents() {
  try {
    const response = await fetch('/api/events');
    allEvents = await response.json();
    filteredEvents = allEvents;
    renderEvents(allEvents);
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    showEmptyState();
  }
}

// ============ AFFICHER LES CARTES ============
function renderEvents(events) {
  const container = document.getElementById('events-container');
  const emptyState = document.getElementById('empty-state');
  
  if (events.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  container.innerHTML = '';

  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition card-event overflow-hidden';
    card.innerHTML = `
      <!-- Image/Emoji -->
      <div class="h-40 bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-6xl">
        ${getEventEmoji(event.category)}
      </div>

      <!-- Contenu -->
      <div class="p-5">
        <h4 class="text-lg font-bold text-gray-900 line-clamp-2">${event.title}</h4>
        <p class="text-sm text-gray-600 mt-2">📍 ${event.location}</p>
        <p class="text-sm text-gray-600">📅 ${formatDate(event.date)} - ${event.time}</p>
        
        <!-- Votes et catégorie -->
        <div class="mt-4 flex justify-between items-center">
          <span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
            👍 ${event.votes} votes
          </span>
          <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
            ${event.category}
          </span>
        </div>
        
        <!-- Boutons -->
        <div class="mt-4 flex gap-2">
          <button 
            onclick="showDetail('${event.id}')" 
            class="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold text-sm"
          >
            Détails
          </button>
          <button 
            onclick="vote('${event.id}')" 
            class="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-bold text-sm"
          >
            👍 Voter
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ============ VOTER ============
async function vote(id) {
  try {
    const response = await fetch(`/api/events/${id}/vote`, { method: 'POST' });
    const data = await response.json();
    
    // Mettre à jour localement
    const event = allEvents.find(e => e.id === id);
    if (event) {
      event.votes = data.votes;
      renderEvents(filteredEvents);
    }
  } catch (error) {
    console.error('Erreur vote:', error);
    alert('Erreur lors du vote');
  }
}

// ============ VOTER DEPUIS LA MODALE ============
async function voteFromDetail() {
  if (!currentDetailEventId) return;
  await vote(currentDetailEventId);
  closeDetailModal();
  loadEvents();
}

// ============ AFFICHER LES DÉTAILS ============
function showDetail(id) {
  const event = allEvents.find(e => e.id === id);
  if (!event) return;

  currentDetailEventId = id;

  document.getElementById('detail-title').textContent = event.title;
  document.getElementById('detail-name').textContent = event.title;
  document.getElementById('detail-desc').textContent = event.description;
  document.getElementById('detail-location').textContent = event.location;
  document.getElementById('detail-date').textContent = `${formatDate(event.date)} à ${event.time}`;
  document.getElementById('detail-category').textContent = event.category;
  document.getElementById('detail-votes').textContent = event.votes;

  document.getElementById('detail-modal').classList.remove('hidden');
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.add('hidden');
  currentDetailEventId = null;
}

// ============ MODAL AJOUT ============
function openModal() {
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('form-event').reset();
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// Fermer modal au clic sur Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeDetailModal();
  }
});

// ============ SOUMETTRE LE FORMULAIRE ============
document.getElementById('form-event').addEventListener('submit', async (e) => {
  e.preventDefault();

  const newEvent = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    location: document.getElementById('location').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    category: document.getElementById('category').value
  };

  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    });

    if (response.ok) {
      alert('✓ Événement créé avec succès!');
      closeModal();
      loadEvents();
    } else {
      alert('Erreur lors de la création');
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur serveur');
  }
});

// ============ FILTRAGE ============
function filterEvents() {
  const searchTerm = document.getElementById('search').value.toLowerCase();
  const category = document.getElementById('filter-category').value;

  filteredEvents = allEvents.filter(event => {
    const matchSearch = event.title.toLowerCase().includes(searchTerm) || 
                       event.description.toLowerCase().includes(searchTerm);
    const matchCategory = !category || event.category === category;
    return matchSearch && matchCategory;
  });

  renderEvents(filteredEvents);
}

// Filtrer en temps réel
document.getElementById('search').addEventListener('input', filterEvents);
document.getElementById('filter-category').addEventListener('change', filterEvents);

// ============ UTILITAIRES ============
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function getEventEmoji(category) {
  const emojis = {
    'Football': '⚽',
    'Running': '🏃',
    'Tennis': '🎾',
    'Basketball': '🏀',
    'Natation': '🏊',
    'Escalade': '🧗',
    'Autres': '🏆'
  };
  return emojis[category] || '🏆';
}

function showEmptyState() {
  document.getElementById('events-container').innerHTML = '';
  document.getElementById('empty-state').classList.remove('hidden');
}