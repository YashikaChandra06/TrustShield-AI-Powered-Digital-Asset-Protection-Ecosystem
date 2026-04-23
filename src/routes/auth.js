const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_trustshield';

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (email, password_hash, auth_provider) VALUES (?, ?, ?)', [email, hashedPassword, 'local'], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'User already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    db.get('SELECT * FROM users WHERE email = ? AND auth_provider = ?', [email, 'local'], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    });
});

// Mock Google Login
router.post('/google-mock', (req, res) => {
    // In a real scenario, this endpoint receives a token from Google, verifies it, and extracts the user's email/ID.
    // For this mock, we just pretend the client sent us verified google profile info directly.
    const { email, google_id } = req.body;
    if (!email || !google_id) return res.status(400).json({ error: 'Email and google_id required for mock login' });

    db.get('SELECT * FROM users WHERE google_id = ? OR email = ?', [google_id, email], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (user) {
            // User exists, login
            const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
            return res.json({ message: 'Google login successful', token });
        } else {
            // New user, register with google
            db.run('INSERT INTO users (email, auth_provider, google_id) VALUES (?, ?, ?)', [email, 'google', google_id], function(err) {
                if (err) return res.status(500).json({ error: 'Database error during google registration' });
                
                const token = jwt.sign({ userId: this.lastID, email }, JWT_SECRET, { expiresIn: '1h' });
                res.status(201).json({ message: 'Google signup successful', token });
            });
        }
    });
});

module.exports = router;
