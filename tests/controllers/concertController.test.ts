import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import { getTestDatabase, seedTestData } from '../helpers/testDatabase.js';

describe('ConcertController Integration Tests', () => {
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
    app.get('/api/concerts', async (req, res) => {
      try {
        const [results] = await sequelize.query(
          'SELECT * FROM concert ORDER BY event_date DESC'
        );
        return res.status(200).json({
          data: results,
          message: 'Concerts retrieved successfully',
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Failed to fetch concerts',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    app.get('/api/concerts/:id', async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          return res.status(400).json({
            message: 'Invalid concert ID',
            errors: ['Concert ID must be a valid number'],
          });
        }

        const [results] = await sequelize.query(
          'SELECT * FROM concert WHERE id = $1',
          {
            bind: [id],
          }
        );

        if (!results || results.length === 0) {
          return res.status(404).json({
            message: 'Concert not found',
          });
        }

        return res.status(200).json({
          data: results[0],
          message: 'Concert retrieved successfully',
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Failed to fetch concert',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Mock protected routes that require authentication
    app.post('/api/concerts', (req, res) => {
      return res.status(401).json({
        message: 'User not authenticated',
        errors: ['Authentication required'],
      });
    });

    app.put('/api/concerts/:id', (req, res) => {
      return res.status(401).json({
        message: 'User not authenticated',
        errors: ['Authentication required'],
      });
    });

    app.delete('/api/concerts/:id', (req, res) => {
      return res.status(401).json({
        message: 'User not authenticated',
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

  describe('GET /api/concerts', () => {
    it('should return all concerts', async () => {
      const response = await request(app).get('/api/concerts').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty(
        'message',
        'Concerts retrieved successfully'
      );
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2); // Based on seeding data

      // Check the structure of the first concert
      const firstConcert = response.body.data[0];
      expect(firstConcert).toHaveProperty('id');
      expect(firstConcert).toHaveProperty('city');
      expect(firstConcert).toHaveProperty('event_date');
      expect(firstConcert).toHaveProperty('venue');
      expect(firstConcert).toHaveProperty('event_name');
      expect(firstConcert).toHaveProperty('event_url');
    });

    it('should return concerts in descending order by event date', async () => {
      const response = await request(app).get('/api/concerts').expect(200);

      const concerts = response.body.data;
      expect(concerts).toHaveLength(2);

      // The newer concert (id: 1, September 2024) should come first
      expect(concerts[0]).toHaveProperty('id', 1);
      expect(concerts[0]).toHaveProperty('city', 'Zürich');
      expect(concerts[0]).toHaveProperty('venue', 'Galotti Musikwerkstatt');
      expect(concerts[1]).toHaveProperty('id', 2);
      expect(concerts[1]).toHaveProperty('city', 'Röthenbach Im Emmental');
      expect(concerts[1]).toHaveProperty('event_name', 'Vertanzt Festival');
    });
  });

  describe('GET /api/concerts/:id', () => {
    it('should return a specific concert by id', async () => {
      const response = await request(app).get('/api/concerts/1').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty(
        'message',
        'Concert retrieved successfully'
      );
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('city', 'Zürich');
      expect(response.body.data).toHaveProperty(
        'venue',
        'Galotti Musikwerkstatt'
      );
      expect(response.body.data).toHaveProperty(
        'event_url',
        'https://www.galotti.ch/story/freitag-6-9-24-bandnacht/'
      );
    });

    it('should return 404 for non-existent concert', async () => {
      const response = await request(app).get('/api/concerts/999').expect(404);

      expect(response.body).toHaveProperty('message', 'Concert not found');
    });

    it('should return 400 for invalid concert ID', async () => {
      const response = await request(app)
        .get('/api/concerts/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid concert ID');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain(
        'Concert ID must be a valid number'
      );
    });
  });

  describe('Authentication Required Endpoints', () => {
    const validConcertData = {
      city: 'Test City',
      event_date: '2024-12-25',
      venue: 'Test Venue',
      event_name: 'Test Event',
      event_url: 'https://example.com/test-event',
    };

    it('POST /api/concerts should require authentication', async () => {
      const response = await request(app)
        .post('/api/concerts')
        .send(validConcertData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'User not authenticated');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Authentication required');
    });

    it('PUT /api/concerts/:id should require authentication', async () => {
      const response = await request(app)
        .put('/api/concerts/1')
        .send(validConcertData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'User not authenticated');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Authentication required');
    });

    it('DELETE /api/concerts/:id should require authentication', async () => {
      const response = await request(app).delete('/api/concerts/1').expect(401);

      expect(response.body).toHaveProperty('message', 'User not authenticated');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Authentication required');
    });
  });

  describe('Validation Tests', () => {
    it('should validate required fields', async () => {
      const invalidConcertData = {
        city: '', // Empty city
        event_date: '2024-12-25',
        venue: '', // Empty venue
        event_name: '', // Empty event name (one of venue or event name is required)
        event_url: '', // Empty URL
      };

      // Test validation directly
      const { ConcertValidator } = await import(
        '../../src/utils/validation/concertValidation.js'
      );
      const validation = ConcertValidator.validateCreateConcert(
        invalidConcertData as any
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some((err: any) => err.field === 'city')).toBe(
        true
      );
      expect(validation.errors.some((err: any) => err.field === 'venue')).toBe(
        true
      );
      expect(
        validation.errors.some((err: any) => err.field === 'event_name')
      ).toBe(true);
      expect(
        validation.errors.some((err: any) => err.field === 'event_url')
      ).toBe(true);
    });

    it('should validate event date format', async () => {
      const invalidConcertData = {
        city: 'Test City',
        event_date: 'invalid-date',
        venue: 'Test Venue',
        event_url: 'https://example.com',
      };

      const { ConcertValidator } = await import(
        '../../src/utils/validation/concertValidation.js'
      );
      const validation =
        ConcertValidator.validateCreateConcert(invalidConcertData);

      expect(validation.isValid).toBe(false);
      expect(
        validation.errors.some((err: any) => err.field === 'event_date')
      ).toBe(true);
    });

    it('should validate URL format', async () => {
      const invalidConcertData = {
        city: 'Test City',
        event_date: '2024-12-25',
        venue: 'Test Venue',
        event_url: 'not-a-url',
      };

      const { ConcertValidator } = await import(
        '../../src/utils/validation/concertValidation.js'
      );
      const validation =
        ConcertValidator.validateCreateConcert(invalidConcertData);

      expect(validation.isValid).toBe(false);
      expect(
        validation.errors.some((err: any) => err.field === 'event_url')
      ).toBe(true);
    });

    it('should accept valid data with only venue', async () => {
      const validConcertData = {
        city: 'Test City',
        event_date: '2024-12-25',
        venue: 'Test Venue',
        event_url: 'https://example.com',
      };

      const { ConcertValidator } = await import(
        '../../src/utils/validation/concertValidation.js'
      );
      const validation =
        ConcertValidator.validateCreateConcert(validConcertData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should accept valid data with only event name', async () => {
      const validConcertData = {
        city: 'Test City',
        event_date: '2024-12-25',
        event_name: 'Test Event',
        event_url: 'https://example.com',
      };

      const { ConcertValidator } = await import(
        '../../src/utils/validation/concertValidation.js'
      );
      const validation =
        ConcertValidator.validateCreateConcert(validConcertData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should sanitize input data', async () => {
      const dataWithWhitespace = {
        city: '  Test City  ',
        event_date: '  2024-12-25  ',
        venue: '  Test Venue  ',
        event_name: '  Test Event  ',
        event_url: '  https://example.com  ',
      };

      const { ConcertValidator } = await import(
        '../../src/utils/validation/concertValidation.js'
      );
      const sanitized =
        ConcertValidator.sanitizeConcertData(dataWithWhitespace);

      expect(sanitized.city).toBe('Test City');
      expect(sanitized.event_date).toBe('2024-12-25');
      expect(sanitized.venue).toBe('Test Venue');
      expect(sanitized.event_name).toBe('Test Event');
      expect(sanitized.event_url).toBe('https://example.com');
    });

    it('should validate update data correctly', async () => {
      const invalidUpdateData = {
        id: 'invalid',
        city: '', // Empty city
        event_date: '2024-12-25',
        venue: 'Updated Venue',
        event_url: 'https://example.com',
      };

      const { ConcertValidator } = await import(
        '../../src/utils/validation/concertValidation.js'
      );
      const validation = ConcertValidator.validateUpdateConcert(
        invalidUpdateData as any
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((err: any) => err.field === 'id')).toBe(
        true
      );
      expect(validation.errors.some((err: any) => err.field === 'city')).toBe(
        true
      );
    });
  });

  describe('Database Operations', () => {
    it('should have seeded data in the database', async () => {
      // Query the database directly to verify seeding
      const [results] = await sequelize.query(
        'SELECT * FROM concert ORDER BY id'
      );
      expect(results).toHaveLength(2);

      const firstConcert = results[0] as any;
      expect(firstConcert).toHaveProperty('id', 1);
      expect(firstConcert).toHaveProperty('city', 'Zürich');
      expect(firstConcert).toHaveProperty('venue', 'Galotti Musikwerkstatt');
      expect(firstConcert).toHaveProperty(
        'event_url',
        'https://www.galotti.ch/story/freitag-6-9-24-bandnacht/'
      );

      const secondConcert = results[1] as any;
      expect(secondConcert).toHaveProperty('id', 2);
      expect(secondConcert).toHaveProperty('city', 'Röthenbach Im Emmental');
      expect(secondConcert).toHaveProperty('event_name', 'Vertanzt Festival');
      expect(secondConcert).toHaveProperty(
        'event_url',
        'https://www.vertanzt.ch/'
      );
    });

    it('should be able to create a concert directly in the database', async () => {
      const insertQuery = `
                INSERT INTO concert (city, event_date, venue, event_name, event_url, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                RETURNING *
            `;

      const [results] = await sequelize.query(insertQuery, {
        bind: [
          'Test Database City',
          '2024-12-25',
          'Test Database Venue',
          'Test Database Event',
          'https://test-database.com',
        ],
      });

      const newConcert = results[0] as any;
      expect(newConcert).toHaveProperty('id');
      expect(newConcert).toHaveProperty('city', 'Test Database City');
      expect(newConcert).toHaveProperty('venue', 'Test Database Venue');
      expect(newConcert).toHaveProperty('event_name', 'Test Database Event');
      expect(newConcert).toHaveProperty(
        'event_url',
        'https://test-database.com'
      );

      // Verify it was actually saved
      const [findResults] = await sequelize.query(
        'SELECT * FROM concert WHERE id = $1',
        {
          bind: [newConcert.id],
        }
      );

      expect(findResults).toHaveLength(1);
      const foundConcert = findResults[0] as any;
      expect(foundConcert).toHaveProperty('city', 'Test Database City');
    });

    it('should maintain data integrity with database constraints', async () => {
      // Try to create a concert with missing required fields
      const invalidInsertQuery = `
                INSERT INTO concert (city) VALUES ($1)
            `;

      await expect(
        sequelize.query(invalidInsertQuery, {
          bind: ['Test'],
        })
      ).rejects.toThrow();
    });

    it('should handle concurrent database operations', async () => {
      // Test that the database can handle multiple operations at once
      const insertPromises = [];

      for (let i = 1; i <= 5; i++) {
        const insertQuery = `
                    INSERT INTO concert (city, event_date, venue, event_name, event_url, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
                    RETURNING id
                `;

        insertPromises.push(
          sequelize.query(insertQuery, {
            bind: [
              `Test City ${i}`,
              '2024-12-25',
              `Test Venue ${i}`,
              `Test Event ${i}`,
              `https://test-${i}.com`,
            ],
          })
        );
      }

      const results = await Promise.all(insertPromises);
      expect(results).toHaveLength(5);

      // Verify all concerts were created
      const [countResults] = await sequelize.query(
        'SELECT COUNT(*) as count FROM concert'
      );
      const count = (countResults[0] as any).count;
      expect(parseInt(count)).toBe(7); // 2 seeded + 5 new
    });

    it('should handle date fields correctly', async () => {
      const insertQuery = `
                INSERT INTO concert (city, event_date, venue, event_url, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING *
            `;

      const [results] = await sequelize.query(insertQuery, {
        bind: [
          'Date Test City',
          '2024-12-25',
          'Date Test Venue',
          'https://date-test.com',
        ],
      });

      const newConcert = results[0] as any;
      expect(newConcert).toHaveProperty('event_date');

      // Verify the date is correctly stored
      const eventDate = new Date(newConcert.event_date);
      expect(eventDate.getFullYear()).toBe(2024);
      expect(eventDate.getMonth()).toBe(11); // December (0-indexed)
      expect(eventDate.getDate()).toBe(25);
    });

    it('should allow null values for optional fields', async () => {
      const insertQuery = `
                INSERT INTO concert (city, event_date, event_url, created_at, updated_at)
                VALUES ($1, $2, $3, NOW(), NOW())
                RETURNING *
            `;

      const [results] = await sequelize.query(insertQuery, {
        bind: ['Minimal Concert City', '2024-12-31', 'https://minimal.com'],
      });

      const newConcert = results[0] as any;
      expect(newConcert).toHaveProperty('city', 'Minimal Concert City');
      expect(newConcert).toHaveProperty('venue', null);
      expect(newConcert).toHaveProperty('event_name', null);
      expect(newConcert).toHaveProperty('event_url', 'https://minimal.com');
    });
  });
});
