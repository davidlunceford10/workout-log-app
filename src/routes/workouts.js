const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Get all workouts
  router.get('/api/workouts', (req, res) => {
    db.getAllWorkouts((err, rows) => {
      if (err) {
        console.error('Error fetching workouts:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ workouts: rows || [] });
    });
  });

  // Get single workout by ID
  router.get('/api/workouts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid workout ID' });
    }

    db.getWorkoutById(id, (err, row) => {
      if (err) {
        console.error('Error fetching workout:', err);
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Workout not found' });
      }
      res.json({ workout: row });
    });
  });

  // Create new workout
  router.post('/api/workouts', (req, res) => {
    const { exercise_name, sets, reps, weight, date, notes } = req.body;
    
    // Validation
    if (!exercise_name || !sets || !reps || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields: exercise_name, sets, reps, date' 
      });
    }

    if (sets < 1 || reps < 1) {
      return res.status(400).json({ 
        error: 'Sets and reps must be positive numbers' 
      });
    }

    const workout = {
      exercise_name,
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: weight ? parseFloat(weight) : null,
      date,
      notes: notes || ''
    };

    db.createWorkout(workout, function(err) {
      if (err) {
        console.error('Error creating workout:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ 
        id: this.lastID,
        message: 'Workout created successfully' 
      });
    });
  });

  // Delete workout
  router.delete('/api/workouts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid workout ID' });
    }

    db.deleteWorkout(id, function(err) {
      if (err) {
        console.error('Error deleting workout:', err);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Workout not found' });
      }
      res.json({ message: 'Workout deleted successfully' });
    });
  });

  return router;
};