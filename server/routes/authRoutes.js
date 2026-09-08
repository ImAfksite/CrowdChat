const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const UserModel = require('../models/userModel');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { username, displayName, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 alphanumeric characters.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    if (UserModel.findByUsername(cleanUsername)) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }

    if (UserModel.findByEmail(email.trim().toLowerCase())) {
      return res.status(409).json({ error: 'Email address is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = UserModel.create({
      username: cleanUsername,
      displayName: displayName ? displayName.trim() : cleanUsername,
      email: email.trim().toLowerCase(),
      passwordHash,
    });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login credential and password required.' });
    }

    const user = login.includes('@') ? UserModel.findByEmail(login) : UserModel.findByUsername(login);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'This account has been permanently suspended.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '7d' });

    const safeUser = UserModel.findById(user.id);
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Demo Login endpoint for seamless testing of multiplayer chat
router.post('/demo-login', async (req, res) => {
  try {
    const { username } = req.body;
    const user = UserModel.findByUsername(username || 'pixel_sam');

    if (!user) {
      return res.status(404).json({ error: 'Demo user not found.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '7d' });
    const safeUser = UserModel.findById(user.id);
    res.json({ token, user: safeUser });
  } catch {
    res.status(500).json({ error: 'Demo login error' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
