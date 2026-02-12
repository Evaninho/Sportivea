const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration Alwaysdata : Port et IP (IPv6 obligatoire)
const PORT = process.env.PORT || 8100;
const HOST = process.env.IP || '::';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const EVENTS_FILE = path.join(__dirname, '../data/events.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

// ============ UTILITAIRES ============
function readEvents() { return JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf-8')); }
function writeEvents(data) { fs.writeFileSync(EVENTS_FILE, JSON.stringify(data, null, 2)); }
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}
function writeUsers(data) { fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2)); }

// Middleware de vérification
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  const users = readUsers();
  const user = users.users.find(u => u.token === token);
  if (!user) return res.status(401).json({ error: 'Token invalide' });
  req.user = user;
  next();
}

// ============ ROUTES AUTHENTIFICATION ============
app.post(['/auth/register', '/api/auth/register'], (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  if (username.length < 3) return res.status(400).json({ error: 'Pseudo trop court' });
  const users = readUsers();
  if (users.users.find(u => u.email === email || u.username === username)) return res.status(400).json({ error: 'Existe déjà' });

  const token = uuidv4();
  const newUser = { id: uuidv4(), username, email, password, token, createdAt: new Date().toISOString() };
  users.users.push(newUser);
  writeUsers(users);
  res.status(201).json({ success: true, token, user: { id: newUser.id, username, email } });
});

app.post(['/auth/login', '/api/auth/login'], (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
  res.json({ success: true, token: user.token, user: { id: user.id, username: user.username, email: user.email } });
});

app.get(['/auth/verify', '/api/auth/verify'], (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ authenticated: false });
  const users = readUsers();
  const user = users.users.find(u => u.token === token);
  if (!user) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user: { id: user.id, username: user.username, email: user.email } });
});

// ============ ROUTES ÉVÉNEMENTS ============
app.get(['/events', '/api/events'], (req, res) => {
  const data = readEvents();
  res.json(data.events);
});

app.post(['/events', '/api/events'], (req, res) => {
  const { title, description, location, date, time, category } = req.body;
  if (!title || !description || !location) return res.status(400).json({ error: 'Champs manquants' });
  const data = readEvents();
  const newEvent = { id: `evt-${Date.now()}`, title, description, location, date, time, category: category || 'Autres', votes: 0, voters: [], createdAt: new Date().toISOString() };
  data.events.push(newEvent);
  writeEvents(data);
  res.status(201).json(newEvent);
});

app.post(['/events/:id/vote', '/api/events/:id/vote'], (req, res) => {
  const token = req.headers['authorization'];
  const users = readUsers();
  const user = users.users.find(u => u.token === token);
  if (!user) return res.status(401).json({ error: 'Vous devez être connecté' });
  const data = readEvents();
  const event = data.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Non trouvé' });
  if (!event.voters) event.voters = [];
  if (event.voters.includes(user.id)) return res.status(400).json({ error: 'Déjà voté' });
  event.votes += 1;
  event.voters.push(user.id);
  writeEvents(data);
  res.json({ success: true, votes: event.votes });
});

app.listen(PORT, HOST, () => { console.log(`Server started on ${HOST}:${PORT}`); });