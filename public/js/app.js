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

    emptyState.classList.add('hidden');
    container.innerHTML = '';

    events.forEach(event => {
        const card = document.createElement('div');
        let userID = localStorage.getItem('userId');



        card.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition card-event overflow-hidden';
        card.innerHTML = `
      <div class="h-40 flex items-center justify-center text-6xl">
        <img class="h-40 w-full object-cover" src='${getEventImages(event.category)}'>
      </div>

      <div class="p-5">
        <h4 class="text-lg font-bold text-gray-900 line-clamp-2">${event.title}</h4>
        <p class="text-sm text-gray-600 mt-2">📍 ${event.location}</p>
        <p class="text-sm text-gray-600">📅 ${formatDate(event.date)} - ${event.time}</p>
        
        <div class="mt-4 flex justify-between items-center">
          <span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
            👍 ${event.votes} votes
          </span>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
            ${event.category}
          </span>
        </div>
        
        <div class="mt-4 flex gap-2">
          <button 
            onclick="showDetail('${event.id}')" 
            class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm"
          >
            Détails
          </button>
          <button 
            id="vote-button-${event.id}"
            onclick="vote('${event.id}')" 
            class="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-bold text-sm"
          >
            
          </button>
        </div>
      </div>
    `;
        container.appendChild(card);
        const voteButton = document.getElementById('vote-button-' + event.id);
        if (!token) {
            voteButton.textContent = ' Connectez-vous pour voter';
            voteButton.disabled = false;
        } else if (event.voters && event.voters.includes(userID)) {
            voteButton.textContent = '👍 Déjà voté';
            voteButton.disabled = true;
            voteButton.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            voteButton.textContent = '👍 Voter maintenant';
            voteButton.disabled = false;
            voteButton.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

// ============ VOTER ============
async function vote(id) {
    // Vérifier si connecté
    if (!token) {
        alert('⚠️ Vous devez être connecté pour voter!');
        openLoginModal();
        return;
    }

    try {
        const response = await fetch(`/api/events/${id}/vote`, {
            method: 'POST',
            headers: { 'authorization': token }
        });

        if (response.ok) {
            const data = await response.json();
            const event = allEvents.find(e => e.id === id);
            if (event) {
                event.votes = data.votes;
                renderEvents(filteredEvents);
            }
            alert('✓ Vote enregistré!');
            await loadEvents();
        } else {
            const error = await response.json();
            alert('❌ ' + error.error);
        }
    } catch (error) {
        console.error('Erreur vote:', error);
        alert('Erreur lors du vote');
    }
}

// ============ VOTER DEPUIS LA MODALE ============
async function voteFromDetail() {
    if (!currentDetailEventId) return;

    if (!token) {
        alert('⚠️ Vous devez être connecté pour voter!');
        closeDetailModal();
        openLoginModal();
        return;
    }

    await vote(currentDetailEventId);
    closeDetailModal();
    loadEvents();
}

// ============ AFFICHER LES DÉTAILS ============
function showDetail(id) {
    const event = allEvents.find(e => e.id === id);
    let userID = localStorage.getItem('userId');

    if (!event) return;

    currentDetailEventId = id;

    document.getElementById('detail-title').textContent = event.title;
    document.getElementById('detail-name').textContent = event.title;
    document.getElementById('detail-desc').textContent = event.description;
    document.getElementById('detail-location').textContent = event.location;
    document.getElementById('detail-date').textContent = `${formatDate(event.date)} à ${event.time}`;
    document.getElementById('detail-category').textContent = event.category;
    document.getElementById('detail-votes').textContent = event.votes;

    // Bouton voter - mettre à jour l'état
    const voteButton = document.getElementById('vote-button');
    if (!token) {
        voteButton.textContent = ' Connectez-vous pour voter';
        voteButton.disabled = true;
        voteButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else if (event.voters && event.voters.includes(userID)) {
        voteButton.textContent = '👍 Déjà voté';
        voteButton.disabled = true;
        voteButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        voteButton.textContent = '👍 Voter maintenant';
        voteButton.disabled = false;
        voteButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    document.getElementById('detail-modal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
    currentDetailEventId = null;
}

// ============ MODAL AJOUT ============
function openModal() {
    if (!token) {
        alert('⚠️ Vous devez être connecté pour créer un événement!');
        openLoginModal();
        return;
    }
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

document.getElementById('search').addEventListener('input', filterEvents);
document.getElementById('filter-category').addEventListener('change', filterEvents);

// ============ UTILITAIRES ============
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function getEventImages(category) {
    const images = {
        'Football': './img/foot.jpg',
        'Running': './img/running.png',
        'Tennis': './img/tennis.jpg',
        'Basketball': './img/basket.png',
        'Natation': './img/natation.png',
        'Escalade': './img/escalade.jpg',
        'Autres': './img/autres.png'
    };
    return images[category] || './img/autres.png';
}

function showEmptyState() {
    document.getElementById('events-container').innerHTML = '';
    document.getElementById('empty-state').classList.remove('hidden');
}