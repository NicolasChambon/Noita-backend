import express from 'express';

import concertController from '../controllers/concertController.js';

import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, concertController.getAllConcerts);
router.get('/:id', auth, concertController.getConcert);
router.post('/', auth, concertController.createConcert);
router.put('/:id', auth, concertController.updateConcert);
router.delete('/:id', auth, concertController.deleteConcert);

export default router;
