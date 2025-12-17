const express = require('express');
const path = require('path');
const Database = require('./models/database');
const workoutRoutes = require('./routes/workouts');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ FIX 1: Use ABSOLUTE path for Docker
const db = new Database('/app/data/workouts.db');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(workoutRoutes(db));

// ✅ REQUIRED for deploy.yml health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (Docker + AWS safe)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FitTrack running on port ${PORT}`);
});
