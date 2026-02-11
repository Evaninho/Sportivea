const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const EVENTS_FILE = path.join(__dirname, '../data/events.json');

// Lire événements
function readEvents() {
  return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf-8'));
}

// Sauvegarder événements
function writeEvents(data) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(data, null, 2));
}

// GET tous les événements
app.get('/api/events', (req, res) => {
  const data = readEvents();
  res.json(data.events);
});

// GET un événement
app.get('/api/events/:id', (req, res) => {
  const data = readEvents();
  const event = data.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event);
});

// POST créer événement
app.post('/api/events', (req, res) => {
  const { title, description, location, date, time, category } = req.body;
  
  if (!title || !description || !location) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const data = readEvents();
  const newEvent = {
    id: `evt-${Date.now()}`,
    title,
    description,
    location,
    date,
    time,
    category: category || 'Autres',
    votes: 0
  };

  data.events.push(newEvent);
  writeEvents(data);
  res.status(201).json(newEvent);
});

// POST voter
app.post('/api/events/:id/vote', (req, res) => {
  const data = readEvents();
  const event = data.events.find(e => e.id === req.params.id);
  
  if (!event) return res.status(404).json({ error: 'Not found' });
  
  event.votes += 1;
  writeEvents(data);
  res.json({ votes: event.votes });
});

app.listen(3000, () => {
  console.log('✅ Serveur sur http://localhost:3000');
});