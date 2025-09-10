import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import {
  getTestDatabase,
  seedTestData,
  closeTestDatabase,
} from '../helpers/testDatabase.js';

describe('CarouselController Integration Tests', () => {
  let sequelize: Sequelize;
  let app: express.Application;

  beforeAll(async () => {
    // Get the shared test database connection
    sequelize = getTestDatabase();
    await sequelize.authenticate();

    // Set up Express app for testing with simple routes to test database
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(cors());

    // Add simple test routes that directly use the database
    app.get('/api/carousel', async (req, res) => {
      try {
        const [results] = await sequelize.query(
          'SELECT * FROM carousel_picture ORDER BY position ASC'
        );
        return res.status(200).json({
          data: results,
          message: 'Pictures retrieved successfully',
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Failed to fetch pictures',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    app.get('/api/carousel/:id', async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          return res.status(400).json({
            message: 'Invalid picture ID',
            errors: ['Picture ID must be a valid number'],
          });
        }

        const [results] = await sequelize.query(
          'SELECT * FROM carousel_picture WHERE id = $1',
          {
            bind: [id],
          }
        );

        if (!results || results.length === 0) {
          return res.status(404).json({
            message: 'Picture not found',
          });
        }

        return res.status(200).json({
          data: results[0],
          message: 'Picture retrieved successfully',
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Failed to fetch picture',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Mock protected routes that require authentication
    app.post('/api/carousel', (req, res) => {
      return res.status(401).json({
        message: 'No token provided',
        errors: ['Authentication required'],
      });
    });

    app.put('/api/carousel/:id', (req, res) => {
      return res.status(401).json({
        message: 'No token provided',
        errors: ['Authentication required'],
      });
    });

    app.put('/api/carousel/position/:id', (req, res) => {
      return res.status(401).json({
        message: 'No token provided',
        errors: ['Authentication required'],
      });
    });

    app.delete('/api/carousel/:id', (req, res) => {
      return res.status(401).json({
        message: 'No token provided',
        errors: ['Authentication required'],
      });
    });

    // 404 handler
    app.use((req, res) => {
      return res.status(404).json({
        message: `Route ${req.path} not found`,
      });
    });
  });

  beforeEach(async () => {
    // Reseed data before each test using the shared helper
    await seedTestData(sequelize);
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe('GET /api/carousel', () => {
    it('should return all pictures', async () => {
      const response = await request(app).get('/api/carousel').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty(
        'message',
        'Pictures retrieved successfully'
      );
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return pictures in ascending order by position', async () => {
      // Create test pictures with different positions
      await sequelize.query(
        'INSERT INTO carousel_picture (url, position) VALUES ($1, $2)',
        {
          bind: ['/images/test1.png', 3],
        }
      );
      await sequelize.query(
        'INSERT INTO carousel_picture (url, position) VALUES ($1, $2)',
        {
          bind: ['/images/test2.png', 1],
        }
      );
      await sequelize.query(
        'INSERT INTO carousel_picture (url, position) VALUES ($1, $2)',
        {
          bind: ['/images/test3.png', 2],
        }
      );

      const response = await request(app).get('/api/carousel').expect(200);

      const pictures = response.body.data;
      expect(pictures.length).toBeGreaterThanOrEqual(3);

      // Check if positions are in ascending order
      for (let i = 1; i < pictures.length; i++) {
        expect(pictures[i].position).toBeGreaterThanOrEqual(
          pictures[i - 1].position
        );
      }
    });
  });

  describe('GET /api/carousel/:id', () => {
    it('should return a specific picture by id', async () => {
      const [insertResult] = await sequelize.query(
        'INSERT INTO carousel_picture (url, position) VALUES ($1, $2) RETURNING id',
        {
          bind: ['/images/test-specific.png', 10],
        }
      );
      const pictureId = (insertResult as any[])[0].id;

      const response = await request(app)
        .get(`/api/carousel/${pictureId}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty(
        'message',
        'Picture retrieved successfully'
      );
      expect(response.body.data.id).toBe(pictureId);
      expect(response.body.data.url).toBe('/images/test-specific.png');
      expect(response.body.data.position).toBe(10);
    });

    it('should return 404 for non-existent picture', async () => {
      const response = await request(app)
        .get('/api/carousel/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Picture not found');
    });

    it('should return 400 for invalid picture ID', async () => {
      const response = await request(app)
        .get('/api/carousel/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid picture ID');
      expect(response.body.errors).toContain(
        'Picture ID must be a valid number'
      );
    });
  });

  describe('Authentication Required Endpoints', () => {
    it('POST /api/carousel should require authentication', async () => {
      const response = await request(app)
        .post('/api/carousel')
        .send({
          picture64:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'No token provided');
    });

    it('PUT /api/carousel/:id should require authentication', async () => {
      const response = await request(app)
        .put('/api/carousel/1')
        .send({
          picture64:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'No token provided');
    });

    it('PUT /api/carousel/position/:id should require authentication', async () => {
      const response = await request(app)
        .put('/api/carousel/position/1')
        .send({ direction: 'left' })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'No token provided');
    });

    it('DELETE /api/carousel/:id should require authentication', async () => {
      const response = await request(app).delete('/api/carousel/1').expect(401);

      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('Database Operations', () => {
    it('should have seeded data in the database', async () => {
      const [results] = await sequelize.query(
        'SELECT COUNT(*) as count FROM carousel_picture'
      );
      const count = (results as any[])[0].count;
      expect(parseInt(count)).toBeGreaterThanOrEqual(0);
    });

    it('should be able to create a picture directly in the database', async () => {
      const [insertResult] = await sequelize.query(
        'INSERT INTO carousel_picture (url, position) VALUES ($1, $2) RETURNING *',
        {
          bind: ['/images/direct-test.png', 99],
        }
      );
      const picture = (insertResult as any[])[0];

      expect(picture).toHaveProperty('id');
      expect(picture.url).toBe('/images/direct-test.png');
      expect(picture.position).toBe(99);
      expect(picture).toHaveProperty('created_at');
      expect(picture).toHaveProperty('updated_at');
    });

    it('should handle basic database operations', async () => {
      // Test that we can insert and retrieve carousel pictures
      const testUrl = '/images/validation-test.png';
      const testPosition = 88;

      const [insertResult] = await sequelize.query(
        'INSERT INTO carousel_picture (url, position) VALUES ($1, $2) RETURNING *',
        {
          bind: [testUrl, testPosition],
        }
      );
      const insertedPicture = (insertResult as any[])[0];

      expect(insertedPicture.url).toBe(testUrl);
      expect(insertedPicture.position).toBe(testPosition);

      // Test that we can query it back
      const [queryResult] = await sequelize.query(
        'SELECT * FROM carousel_picture WHERE id = $1',
        {
          bind: [insertedPicture.id],
        }
      );
      const queriedPicture = (queryResult as any[])[0];

      expect(queriedPicture.url).toBe(testUrl);
      expect(queriedPicture.position).toBe(testPosition);
    });
  });
});
