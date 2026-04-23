const express = require('express');
const db = require('../db/database');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
    const userId = req.user.userId;
    
    db.all(`SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ logs: rows });
    });
});

module.exports = router;
