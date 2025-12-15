const Database = require('../../src/models/database');
const fs = require('fs');
const path = require('path');

describe('Database Unit Tests', () => {
  let db;
  const testDbPath = path.join(__dirname, 'test-workouts.db');

  beforeEach((done) => {
    // Clean up any existing test database
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch (err) {
        // File might be locked, that's okay
      }
    }
    
    db = new Database(testDbPath);
    
    // Wait for database to be initialized
    setTimeout(() => {
      done();
    }, 100);
  });

  afterEach((done) => {
    // Close database connection first
    if (db && db.db) {
      db.db.close((err) => {
        // Wait a bit for file handles to release (Windows needs this)
        setTimeout(() => {
          // Try to clean up test database
          if (fs.existsSync(testDbPath)) {
            try {
              fs.unlinkSync(testDbPath);
            } catch (err) {
              // File might still be locked, that's okay for tests
              console.log('Note: Test database file cleanup deferred');
            }
          }
          done();
        }, 50);
      });
    } else {
      done();
    }
  });

  test('should create a workout successfully', (done) => {
    const workout = {
      exercise_name: 'Bench Press',
      sets: 3,
      reps: 10,
      weight: 135,
      date: '2024-12-15',
      notes: 'Felt strong today'
    };

    db.createWorkout(workout, function(err) {
      expect(err).toBeNull();
      expect(this.lastID).toBe(1);
      done();
    });
  });

  test('should retrieve all workouts', (done) => {
    const workout = {
      exercise_name: 'Squats',
      sets: 4,
      reps: 8,
      weight: 185,
      date: '2024-12-15',
      notes: ''
    };

    db.createWorkout(workout, () => {
      db.getAllWorkouts((err, rows) => {
        expect(err).toBeNull();
        expect(rows).toHaveLength(1);
        expect(rows[0].exercise_name).toBe('Squats');
        expect(rows[0].sets).toBe(4);
        expect(rows[0].reps).toBe(8);
        done();
      });
    });
  });

  test('should retrieve workout by ID', (done) => {
    const workout = {
      exercise_name: 'Deadlift',
      sets: 3,
      reps: 5,
      weight: 225,
      date: '2024-12-15',
      notes: 'New PR!'
    };

    db.createWorkout(workout, function() {
      const id = this.lastID;
      db.getWorkoutById(id, (err, row) => {
        expect(err).toBeNull();
        expect(row).toBeDefined();
        expect(row.exercise_name).toBe('Deadlift');
        expect(row.notes).toBe('New PR!');
        done();
      });
    });
  });

  test('should delete workout successfully', (done) => {
    const workout = {
      exercise_name: 'Pull-ups',
      sets: 3,
      reps: 12,
      weight: null,
      date: '2024-12-15',
      notes: 'Bodyweight'
    };

    db.createWorkout(workout, function() {
      const id = this.lastID;
      db.deleteWorkout(id, function(err) {
        expect(err).toBeNull();
        expect(this.changes).toBe(1);
        done();
      });
    });
  });

  test('should return no rows when database is empty', (done) => {
    db.getAllWorkouts((err, rows) => {
      expect(err).toBeNull();
      expect(rows).toHaveLength(0);
      done();
    });
  });

  test('should handle null weight values', (done) => {
    const workout = {
      exercise_name: 'Push-ups',
      sets: 3,
      reps: 15,
      weight: null,
      date: '2024-12-15',
      notes: 'Bodyweight exercise'
    };

    db.createWorkout(workout, function() {
      const id = this.lastID;
      db.getWorkoutById(id, (err, row) => {
        expect(err).toBeNull();
        expect(row.weight).toBeNull();
        expect(row.exercise_name).toBe('Push-ups');
        done();
      });
    });
  });
});