const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const assetRoutes = require('./routes/assets');
const auditLogsRoutes = require('./routes/auditLogs');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Protected Route Example
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is protected data!', user: req.user });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'TrustShield Backend API is running' });
    });
}

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
