import express from 'express';
import { ConcertController } from '../controllers/concertController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', ConcertController.getAllConcerts);
router.get('/:id', ConcertController.getConcert);

// Protected routes (require authentication)
router.post('/', auth, ConcertController.createConcert);
router.put('/:id', auth, ConcertController.updateConcert);
router.delete('/:id', auth, ConcertController.deleteConcert);

export default router;
