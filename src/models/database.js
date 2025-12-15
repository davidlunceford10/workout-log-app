const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor(dbPath = './data/workouts.db') {
    // Ensure data directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_name TEXT NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        weight REAL,
        date TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    this.db.run(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Workouts table ready');
      }
    });
  }

  getAllWorkouts(callback) {
    const sql = 'SELECT * FROM workouts ORDER BY date DESC, created_at DESC';
    this.db.all(sql, [], callback);
  }

  getWorkoutById(id, callback) {
    const sql = 'SELECT * FROM workouts WHERE id = ?';
    this.db.get(sql, [id], callback);
  }

  createWorkout(workout, callback) {
    const sql = `
      INSERT INTO workouts (exercise_name, sets, reps, weight, date, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      workout.exercise_name,
      workout.sets,
      workout.reps,
      workout.weight || null,
      workout.date,
      workout.notes || ''
    ];
    this.db.run(sql, params, callback);
  }

  deleteWorkout(id, callback) {
    const sql = 'DELETE FROM workouts WHERE id = ?';
    this.db.run(sql, [id], callback);
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = Database;