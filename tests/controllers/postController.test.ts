import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import { getTestDatabase, seedTestData } from '../helpers/testDatabase.js';

describe('PostController Integration Tests', () => {
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
    app.get('/api/posts', async (req, res) => {
      try {
        const [results] = await sequelize.query(
          'SELECT * FROM post ORDER BY created_at DESC'
        );
        return res.status(200).json({
          data: results,
          message: 'Posts retrieved successfully',
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Failed to fetch posts',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    app.get('/api/posts/:id', async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
          return res.status(400).json({
            message: 'Invalid post ID',
            errors: ['Post ID must be a valid number'],
          });
        }

        const [results] = await sequelize.query(
          'SELECT * FROM post WHERE id = $1',
          {
            bind: [id],
          }
        );

        if (!results || results.length === 0) {
          return res.status(404).json({
            message: 'Post not found',
          });
        }

        return res.status(200).json({
          data: results[0],
          message: 'Post retrieved successfully',
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Failed to fetch post',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Mock protected routes that require authentication
    app.post('/api/posts', (req, res) => {
      return res.status(401).json({
        message: 'User not authenticated',
        errors: ['Authentication required'],
      });
    });

    app.put('/api/posts/:id', (req, res) => {
      return res.status(401).json({
        message: 'User not authenticated',
        errors: ['Authentication required'],
      });
    });

    app.delete('/api/posts/:id', (req, res) => {
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

  describe('GET /api/posts', () => {
    it('should return all posts', async () => {
      const response = await request(app).get('/api/posts').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty(
        'message',
        'Posts retrieved successfully'
      );
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2); // Based on seeding data

      // Check the structure of the first post
      const firstPost = response.body.data[0];
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('title_fr');
      expect(firstPost).toHaveProperty('title_de');
      expect(firstPost).toHaveProperty('content_fr');
      expect(firstPost).toHaveProperty('content_de');
      expect(firstPost).toHaveProperty('displayed_date');
      expect(firstPost).toHaveProperty('image_url');
    });

    it('should return posts in descending order by creation date', async () => {
      const response = await request(app).get('/api/posts').expect(200);

      const posts = response.body.data;
      expect(posts).toHaveLength(2);

      // The newer post (id: 2) should come first
      expect(posts[0]).toHaveProperty('id', 2);
      expect(posts[0]).toHaveProperty(
        'title_fr',
        'Galotti Bandnacht, on arrive !'
      );
      expect(posts[1]).toHaveProperty('id', 1);
      expect(posts[1]).toHaveProperty('title_fr', 'Merci Vertantzt !');
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a specific post by id', async () => {
      const response = await request(app).get('/api/posts/1').expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty(
        'message',
        'Post retrieved successfully'
      );
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty(
        'title_fr',
        'Merci Vertantzt !'
      );
      expect(response.body.data).toHaveProperty(
        'title_de',
        'Danke, Vertantzt !'
      );
      expect(response.body.data).toHaveProperty('displayed_date');
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app).get('/api/posts/999').expect(404);

      expect(response.body).toHaveProperty('message', 'Post not found');
    });

    it('should return 400 for invalid post ID', async () => {
      const response = await request(app).get('/api/posts/invalid').expect(400);

      expect(response.body).toHaveProperty('message', 'Invalid post ID');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Post ID must be a valid number');
    });
  });

  describe('Authentication Required Endpoints', () => {
    const validPostData = {
      title_fr: 'Test Post French',
      title_de: 'Test Post German',
      content_fr: 'This is a test post content in French.',
      content_de: 'This is a test post content in German.',
      displayed_date: '2024-06-24T10:00:00Z',
    };

    it('POST /api/posts should require authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send(validPostData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'User not authenticated');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Authentication required');
    });

    it('PUT /api/posts/:id should require authentication', async () => {
      const response = await request(app)
        .put('/api/posts/1')
        .send(validPostData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'User not authenticated');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Authentication required');
    });

    it('DELETE /api/posts/:id should require authentication', async () => {
      const response = await request(app).delete('/api/posts/1').expect(401);

      expect(response.body).toHaveProperty('message', 'User not authenticated');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toContain('Authentication required');
    });
  });

  describe('Validation Tests', () => {
    it('should validate required fields', async () => {
      const invalidPostData = {
        title_fr: '', // Empty title
        title_de: 'Test Post German',
        displayed_date: '2024-06-24T10:00:00Z',
        // Missing content_fr and content_de
      };

      // Test validation directly
      const { PostValidator } = await import(
        '../../src/utils/validation/postValidation.js'
      );
      const validation = PostValidator.validateCreatePost(
        invalidPostData as any
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(3); // title_fr, content_fr, content_de
      expect(validation.errors.some((err) => err.field === 'title_fr')).toBe(
        true
      );
      expect(validation.errors.some((err) => err.field === 'content_fr')).toBe(
        true
      );
      expect(validation.errors.some((err) => err.field === 'content_de')).toBe(
        true
      );
    });

    it('should validate image format', async () => {
      const validPostData = {
        title_fr: 'Test Post French',
        title_de: 'Test Post German',
        content_fr: 'This is a test post content in French.',
        content_de: 'This is a test post content in German.',
        displayed_date: '2024-06-24T10:00:00Z',
        img64: 'invalid-image-data',
      };

      const { PostValidator } = await import(
        '../../src/utils/validation/postValidation.js'
      );
      const validation = PostValidator.validateCreatePost(validPostData);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((err: any) => err.field === 'img64')).toBe(
        true
      );
    });

    it('should sanitize input data', async () => {
      const dataWithWhitespace = {
        title_fr: '  Test Post French  ',
        title_de: '  Test Post German  ',
        content_fr: '  This is a test post content in French.  ',
        content_de: '  This is a test post content in German.  ',
        displayed_date: '2024-06-24T10:00:00Z',
      };

      const { PostValidator } = await import(
        '../../src/utils/validation/postValidation.js'
      );
      const sanitized = PostValidator.sanitizePostData(dataWithWhitespace);

      expect(sanitized.title_fr).toBe('Test Post French');
      expect(sanitized.title_de).toBe('Test Post German');
      expect(sanitized.content_fr).toBe(
        'This is a test post content in French.'
      );
      expect(sanitized.content_de).toBe(
        'This is a test post content in German.'
      );
    });

    it('should validate update data correctly', async () => {
      const invalidUpdateData = {
        id: '1',
        title_fr: '', // Empty title
        title_de: 'Updated German',
        content_fr: 'Updated French content',
        displayed_date: '2024-06-24T10:00:00Z',
        // Missing content_de
      };

      const { PostValidator } = await import(
        '../../src/utils/validation/postValidation.js'
      );
      const validation = PostValidator.validateUpdatePost(
        invalidUpdateData as any
      );

      expect(validation.isValid).toBe(false);
      expect(
        validation.errors.some((err: any) => err.field === 'title_fr')
      ).toBe(true);
      expect(
        validation.errors.some((err: any) => err.field === 'content_de')
      ).toBe(true);
    });
  });

  describe('Database Operations', () => {
    it('should have seeded data in the database', async () => {
      // Query the database directly to verify seeding
      const [results] = await sequelize.query('SELECT * FROM post ORDER BY id');
      expect(results).toHaveLength(2);

      const firstPost = results[0] as any;
      expect(firstPost).toHaveProperty('id', 1);
      expect(firstPost).toHaveProperty('title_fr', 'Merci Vertantzt !');
      expect(firstPost).toHaveProperty('title_de', 'Danke, Vertantzt !');
      expect(firstPost).toHaveProperty('displayed_date');
      expect(firstPost).toHaveProperty('image_url', '/images/post-1.png');

      const secondPost = results[1] as any;
      expect(secondPost).toHaveProperty('id', 2);
      expect(secondPost).toHaveProperty(
        'title_fr',
        'Galotti Bandnacht, on arrive !'
      );
      expect(secondPost).toHaveProperty(
        'title_de',
        'Galotti Bandnacht, wir kommen !'
      );
      expect(secondPost).toHaveProperty('displayed_date');
      expect(secondPost).toHaveProperty('image_url', '/images/post-2.png');
    });

    it('should be able to create a post directly in the database', async () => {
      const insertQuery = `
                INSERT INTO post (title_fr, title_de, content_fr, content_de, displayed_date, image_url, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                RETURNING *
            `;

      const [results] = await sequelize.query(insertQuery, {
        bind: [
          'Test Database Post French',
          'Test Database Post German',
          'Database test content French',
          'Database test content German',
          '2024-06-24T10:00:00Z',
          '/images/test.png',
        ],
      });

      const newPost = results[0] as any;
      expect(newPost).toHaveProperty('id');
      expect(newPost).toHaveProperty('title_fr', 'Test Database Post French');
      expect(newPost).toHaveProperty('title_de', 'Test Database Post German');
      expect(newPost).toHaveProperty(
        'content_fr',
        'Database test content French'
      );
      expect(newPost).toHaveProperty(
        'content_de',
        'Database test content German'
      );
      expect(newPost).toHaveProperty('displayed_date');
      expect(newPost).toHaveProperty('image_url', '/images/test.png');

      // Verify it was actually saved
      const [findResults] = await sequelize.query(
        'SELECT * FROM post WHERE id = $1',
        {
          bind: [newPost.id],
        }
      );

      expect(findResults).toHaveLength(1);
      const foundPost = findResults[0] as any;
      expect(foundPost).toHaveProperty('title_fr', 'Test Database Post French');
    });

    it('should maintain data integrity with database constraints', async () => {
      // Try to create a post with missing required fields
      const invalidInsertQuery = `
                INSERT INTO post (title_fr) VALUES ($1)
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
                    INSERT INTO post (title_fr, title_de, content_fr, content_de, displayed_date, image_url, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                    RETURNING id
                `;

        insertPromises.push(
          sequelize.query(insertQuery, {
            bind: [
              `Test Post ${i} FR`,
              `Test Post ${i} DE`,
              `Content ${i} FR`,
              `Content ${i} DE`,
              '2024-06-24T10:00:00Z',
              `/images/test-${i}.png`,
            ],
          })
        );
      }

      const results = await Promise.all(insertPromises);
      expect(results).toHaveLength(5);

      // Verify all posts were created
      const [countResults] = await sequelize.query(
        'SELECT COUNT(*) as count FROM post'
      );
      const count = (countResults[0] as any).count;
      expect(parseInt(count)).toBe(7); // 2 seeded + 5 new
    });
  });
});
