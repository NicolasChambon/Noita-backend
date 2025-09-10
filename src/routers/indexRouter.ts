import express from 'express';
import postRouter from './postRouter.js';
import concertRouter from './concertRouter.js';
import carouselRouter from './carouselRouter.js';

const router = express.Router();

// API routes
router.use('/api/posts', postRouter);
router.use('/api/concerts', concertRouter);
router.use('/api/carousel', carouselRouter);

// Health check route
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Noïta API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API documentation route
router.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Noïta API v2.0',
    endpoints: {
      posts: '/api/posts',
      concerts: '/api/concerts',
      carousel: '/api/carousel',
    },
    documentation: 'https://api-docs.noita.ch',
  });
});

export default router;
