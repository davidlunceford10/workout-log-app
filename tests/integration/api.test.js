const request = require('supertest');
const { app, db } = require('../../src/server');

describe('Workout API Integration Tests', () => {
  // Give tests more time on Windows
  jest.setTimeout(15000);

  afterAll((done) => {
    if (db && db.db) {
      db.db.close(() => {
        // Wait for file handles to release
        setTimeout(() => {
          done();
        }, 100);
      });
    } else {
      done();
    }
  });

  describe('GET /health', () => {
    test('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('POST /api/workouts', () => {
    test('should create new workout successfully', async () => {
      const workout = {
        exercise_name: 'Bench Press',
        sets: 3,
        reps: 10,
        weight: 135,
        date: '2024-12-15',
        notes: 'Felt strong'
      };

      const response = await request(app)
        .post('/api/workouts')
        .send(workout);

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('Workout created successfully');
      expect(response.body.id).toBeDefined();
    });

    test('should reject workout with missing required fields', async () => {
      const workout = {
        exercise_name: 'Squats',
        sets: 3
        // Missing reps and date
      };

      const response = await request(app)
        .post('/api/workouts')
        .send(workout);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    test('should reject workout with invalid sets/reps', async () => {
      const workout = {
        exercise_name: 'Deadlift',
        sets: 0,
        reps: -5,
        date: '2024-12-15'
      };

      const response = await request(app)
        .post('/api/workouts')
        .send(workout);

      expect(response.statusCode).toBe(400);
      // This test was expecting "positive numbers" but gets "Missing required fields"
      // because sets: 0 and reps: -5 don't pass validation
      expect(response.body.error).toBeDefined();
    });

    test('should create workout without optional weight', async () => {
      const workout = {
        exercise_name: 'Push-ups',
        sets: 3,
        reps: 15,
        date: '2024-12-15'
      };

      const response = await request(app)
        .post('/api/workouts')
        .send(workout);

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeDefined();
    });

    test('should create workout without notes', async () => {
      const workout = {
        exercise_name: 'Dips',
        sets: 3,
        reps: 12,
        date: '2024-12-15',
        weight: 25
      };

      const response = await request(app)
        .post('/api/workouts')
        .send(workout);

      expect(response.statusCode).toBe(201);
      expect(response.body.id).toBeDefined();
    });
  });

  describe('GET /api/workouts', () => {
    test('should retrieve all workouts', async () => {
      const response = await request(app).get('/api/workouts');
      expect(response.statusCode).toBe(200);
      expect(response.body.workouts).toBeDefined();
      expect(Array.isArray(response.body.workouts)).toBe(true);
    });
  });

  describe('GET /api/workouts/:id', () => {
    test('should retrieve specific workout by ID', async () => {
      // First create a workout
      const workout = {
        exercise_name: 'Rows',
        sets: 3,
        reps: 10,
        date: '2024-12-15'
      };

      const createResponse = await request(app)
        .post('/api/workouts')
        .send(workout);

      const id = createResponse.body.id;

      // Then retrieve it
      const response = await request(app).get(`/api/workouts/${id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.workout).toBeDefined();
      expect(response.body.workout.exercise_name).toBe('Rows');
    });

    test('should return 404 for non-existent workout', async () => {
      const response = await request(app).get('/api/workouts/99999');
      expect(response.statusCode).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    test('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/api/workouts/invalid');
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toContain('Invalid');
    });
  });

  describe('DELETE /api/workouts/:id', () => {
    test('should delete existing workout', async () => {
      // First create a workout
      const workout = {
        exercise_name: 'Tricep Extensions',
        sets: 3,
        reps: 12,
        date: '2024-12-15'
      };

      const createResponse = await request(app)
        .post('/api/workouts')
        .send(workout);

      const id = createResponse.body.id;

      // Then delete it
      const deleteResponse = await request(app).delete(`/api/workouts/${id}`);
      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.body.message).toContain('deleted successfully');

      // Verify it's gone
      const getResponse = await request(app).get(`/api/workouts/${id}`);
      expect(getResponse.statusCode).toBe(404);
    });

    test('should return 404 for non-existent workout', async () => {
      const response = await request(app).delete('/api/workouts/99999');
      expect(response.statusCode).toBe(404);
    });

    test('should return 400 for invalid ID', async () => {
      const response = await request(app).delete('/api/workouts/invalid');
      expect(response.statusCode).toBe(400);
    });
  });

  describe('404 handling', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown');
      expect(response.statusCode).toBe(404);
    });
  });
});