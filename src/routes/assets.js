const express = require('express');
const fs = require('fs');
const db = require('../db/database');
const upload = require('../middleware/upload');
const authenticateToken = require('../middleware/authMiddleware');
const { scanAsset } = require('../services/aiScanner');

const router = express.Router();

// Require authentication for all asset routes
router.use(authenticateToken);

// 1. Upload an Asset
router.post('/upload', upload.single('asset'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const { filename, originalname, path: filePath, mimetype, size } = req.file;
    const userId = req.user.userId;

    // Insert into assets table
    db.run(
        `INSERT INTO assets (user_id, filename, original_name, file_path, mime_type, size, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, filename, originalname, filePath, mimetype, size, 'scanning'],
        function(err) {
            if (err) {
                console.error('Database error during asset upload:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            const assetId = this.lastID;
            
            // Respond immediately that upload was successful and scanning started
            res.status(202).json({ 
                message: 'Asset uploaded successfully. AI scan in progress.',
                assetId: assetId
            });

            // Asynchronously run the AI Scanner
            const assetData = { mime_type: mimetype, original_name: originalname };
            
            // Audit log upload
            db.run(`INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)`, [userId, 'Asset Uploaded', `Uploaded ${originalname}`]);

            scanAsset(assetData).then(report => {
                // Save scan report
                db.run(
                    `INSERT INTO scan_reports (asset_id, risk_score, malware_score, copyright_score, privacy_score, flagged_issues) VALUES (?, ?, ?, ?, ?, ?)`,
                    [assetId, report.risk_score, report.malware_score, report.copyright_score, report.privacy_score, report.flagged_issues],
                    function(err) {
                        if (err) console.error('Error saving scan report:', err);
                        
                        // Update asset status to scanned
                        db.run(`UPDATE assets SET status = 'scanned' WHERE id = ?`, [assetId]);
                        
                        // Audit log scan
                        db.run(`INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)`, [userId, 'Asset Scanned', `Scanned ${originalname} - Score: ${report.risk_score}`]);
                    }
                );
            }).catch(error => {
                console.error('AI Scan failed:', error);
                db.run(`UPDATE assets SET status = 'failed' WHERE id = ?`, [assetId]);
            });
        }
    );
});

// 2. Get User's Assets
router.get('/', (req, res) => {
    const userId = req.user.userId;
    
    db.all(`SELECT id, original_name, mime_type, size, upload_date, status, protection_status FROM assets WHERE user_id = ? ORDER BY upload_date DESC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ assets: rows });
    });
});

// 3. Get Specific Asset & Scan Report
router.get('/:id', (req, res) => {
    const userId = req.user.userId;
    const assetId = req.params.id;

    db.get(`SELECT * FROM assets WHERE id = ? AND user_id = ?`, [assetId, userId], (err, asset) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!asset) return res.status(404).json({ error: 'Asset not found' });

        db.get(`SELECT * FROM scan_reports WHERE asset_id = ?`, [assetId], (err, report) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            
            if (report && report.flagged_issues) {
                report.flagged_issues = JSON.parse(report.flagged_issues);
            }
            
            res.json({ asset, report });
        });
    });
});

// 4. Protect Asset (Encrypt/Lock)
router.post('/:id/protect', (req, res) => {
    const userId = req.user.userId;
    const assetId = req.params.id;
    const { action } = req.body; // 'encrypt' or 'lock'

    if (!['encrypt', 'lock'].includes(action)) {
        return res.status(400).json({ error: 'Invalid protection action' });
    }

    db.get(`SELECT * FROM assets WHERE id = ? AND user_id = ?`, [assetId, userId], (err, asset) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!asset) return res.status(404).json({ error: 'Asset not found' });

        const newStatus = action === 'encrypt' ? 'encrypted' : 'locked';

        db.run(`UPDATE assets SET protection_status = ? WHERE id = ?`, [newStatus, assetId], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to update protection status' });

            // Log action
            db.run(`INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)`, [userId, `Asset ${newStatus}`, `Asset ${asset.original_name} was ${newStatus}`]);

            res.json({ message: `Asset successfully ${newStatus}`, protection_status: newStatus });
        });
    });
});

// 5. Download/View Asset
router.get('/:id/download', (req, res) => {
    const userId = req.user.userId;
    const assetId = req.params.id;

    db.get(`SELECT * FROM assets WHERE id = ? AND user_id = ?`, [assetId, userId], (err, asset) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!asset) return res.status(404).json({ error: 'Asset not found' });

        res.download(asset.file_path, asset.original_name);
    });
});

// 6. Delete Asset
router.delete('/:id', (req, res) => {
    const userId = req.user.userId;
    const assetId = req.params.id;

    // Verify ownership and get file path
    db.get(`SELECT * FROM assets WHERE id = ? AND user_id = ?`, [assetId, userId], (err, asset) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!asset) return res.status(404).json({ error: 'Asset not found' });

        // Delete from scan_reports first (foreign key constraint)
        db.run(`DELETE FROM scan_reports WHERE asset_id = ?`, [assetId], (err) => {
            if (err) console.error("Error deleting scan report:", err);

            // Delete from assets
            db.run(`DELETE FROM assets WHERE id = ?`, [assetId], (err) => {
                if (err) return res.status(500).json({ error: 'Database error while deleting asset' });

                // Delete physical file
                fs.unlink(asset.file_path, (err) => {
                    if (err) console.error("Failed to delete physical file:", err);
                });

                // Audit log
                db.run(`INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)`, 
                    [userId, 'Asset Deleted', `Deleted ${asset.original_name}`]);

                res.json({ message: 'Asset deleted successfully' });
            });
        });
    });
});

module.exports = router;
