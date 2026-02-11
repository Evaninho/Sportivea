const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const EVENTS_FILE = path.join(__dirname, '../data/events.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

// ============ UTILITAIRES ============

function readEvents() {
  return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf-8'));
}

function writeEvents(data) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(data, null, 2));
}

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// Middleware pour vérifier le token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const users = readUsers();
  const user = users.users.find(u => u.token === token);

  if (!user) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  req.user = user;
  next();
}

// ============ ROUTES AUTHENTIFICATION ============

// INSCRIPTION
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  // Validation basique
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Le pseudo doit faire min 3 caractères' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Le mot de passe doit faire min 4 caractères' });
  }

  const users = readUsers();

  // Vérifier si l'utilisateur existe
  if (users.users.find(u => u.email === email || u.username === username)) {
    return res.status(400).json({ error: 'Cet email ou pseudo existe déjà' });
  }

  // Créer l'utilisateur
  const token = uuidv4();
  const newUser = {
    id: uuidv4(),
    username,
    email,
    password, // En production, il faudrait hasher!
    token,
    createdAt: new Date().toISOString()
  };

  users.users.push(newUser);
  writeUsers(users);

  res.status(201).json({
    success: true,
    message: 'Inscription réussie!',
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    }
  });
});

// CONNEXION
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe obligatoires' });
  }

  const users = readUsers();
  const user = users.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  res.json({
    success: true,
    message: 'Connexion réussie!',
    token: user.token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

// VÉRIFIER LE TOKEN
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  const users = readUsers();
  const user = users.users.find(u => u.token === token);

  if (!user) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

// DÉCONNEXION (optionnel)
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Déconnecté' });
});

// ============ ROUTES ÉVÉNEMENTS ============

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
    votes: 0,
    createdAt: new Date().toISOString()
  };

  data.events.push(newEvent);
  writeEvents(data);
  res.status(201).json(newEvent);
});

// POST voter - PROTÉGÉ (nécessite authentification)
app.post('/api/events/:id/vote', (req, res) => {
  const token = req.headers['authorization'];

  // Vérifier le token
  const users = readUsers();
  const user = users.users.find(u => u.token === token);

  if (!user) {
    return res.status(401).json({ error: 'Vous devez être connecté pour voter' });
  }

  const data = readEvents();
  const event = data.events.find(e => e.id === req.params.id);

  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Vérifier que l'utilisateur n'a pas déjà voté
  if (!event.voters) {
    event.voters = [];
  }

  if (event.voters.includes(user.id)) {
    return res.status(400).json({ error: 'Vous avez déjà voté pour cet événement' });
  }

  event.votes += 1;
  event.voters.push(user.id);
  writeEvents(data);

  res.json({ success: true, votes: event.votes });
});

// ============ DÉMARRAGE ============

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server started");
});