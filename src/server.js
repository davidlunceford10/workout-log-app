const express = require('express');
const path = require('path');
const Database = require('./models/database');
const workoutRoutes = require('./routes/workouts');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ FIX: DB path depends on environment
const dbPath =
  process.env.NODE_ENV === 'production'
    ? '/app/data/workouts.db'
    : undefined; // tests + local use default

const db = new Database(dbPath);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use(workoutRoutes(db));

// ✅ REQUIRED by deploy.yml
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ ONLY start server when run normally (not tests)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FitTrack server running on port ${PORT}`);
  });
}

// ✅ Tests still work
module.exports = { app, db };
