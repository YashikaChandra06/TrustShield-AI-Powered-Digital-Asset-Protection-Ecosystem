const express = require('express');
const db = require('../db/database');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
    const userId = req.user.userId;
    
    // We need to aggregate some data for the user
    // 1. Total assets
    // 2. Average risk score
    // 3. Status distribution
    // 4. Protection status distribution
    
    const analytics = {
        totalAssets: 0,
        avgRiskScore: 0,
        statusDistribution: {},
        protectionDistribution: {}
    };

    db.serialize(() => {
        // Basic asset stats
        db.all(`SELECT status, protection_status FROM assets WHERE user_id = ?`, [userId], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            analytics.totalAssets = rows.length;
            
            rows.forEach(row => {
                analytics.statusDistribution[row.status] = (analytics.statusDistribution[row.status] || 0) + 1;
                analytics.protectionDistribution[row.protection_status] = (analytics.protectionDistribution[row.protection_status] || 0) + 1;
            });
            
            // Score stats
            db.all(`SELECT risk_score FROM scan_reports sr JOIN assets a ON sr.asset_id = a.id WHERE a.user_id = ?`, [userId], (err, scoreRows) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                
                if (scoreRows.length > 0) {
                    const totalScore = scoreRows.reduce((sum, row) => sum + row.risk_score, 0);
                    analytics.avgRiskScore = Math.round(totalScore / scoreRows.length);
                }

                res.json(analytics);
            });
        });
    });
});

module.exports = router;
