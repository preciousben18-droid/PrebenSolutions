/* PREBEN SOLUTIONS - Frontend Connected to Backend */

app.get('/', (req, res) => {
  res.send(`
    <h1>PREBEN SOLUTIONS</h1>
    <p>Website is live 🚀</p>
    <p>JAMB | Post UTME | NYSC | Registrations</p>
  `);
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: 'preben_secret',
  resave: false,
  saveUninitialized: false
}));
/* PREBEN SOLUTIONS - Frontend Connected to Backend */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: 'preben_secret',
  resave: false,
  saveUninitialized: false
}));

mongoose.connect('mongodb://127.0.0.1:27017/preben_portal');

const userSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'student' }
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/api/register', async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ fullname, email, password: hashed });
    res.json({ success: true, message: 'Registration successful' });
  } catch (err) {
    res.json({ success: false, message: 'Email already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, message: 'Wrong password' });

  req.session.user = {
    id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role
  };

  res.json({ success: true, message: 'Login successful' });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.send(`<h1>Welcome ${req.session.user.fullname}</h1><p>Email: ${req.session.user.email}</p><a href='/logout'>Logout</a>`);
});

app.get('/api/user', (req, res) => {
  if (!req.session.user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: req.session.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(3000, () => console.log('PREBEN SOLUTIONS live on port 3000'));
mongoose.connect('mongodb://127.0.0.1:27017/preben_portal');

const userSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'student' }
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/api/register', async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ fullname, email, password: hashed });
    res.json({ success: true, message: 'Registration successful' });
  } catch (err) {
    res.json({ success: false, message: 'Email already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, message: 'Wrong password' });

  req.session.user = {
    id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role
  };

  res.json({ success: true, message: 'Login successful' });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.send(`<h1>Welcome ${req.session.user.fullname}</h1><p>Email: ${req.session.user.email}</p><a href='/logout'>Logout</a>`);
});

app.get('/api/user', (req, res) => {
  if (!req.session.user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: req.session.user });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.listen(3000, () => console.log('PREBEN SOLUTIONS live on port 3000'));
