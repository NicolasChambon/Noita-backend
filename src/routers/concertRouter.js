import express from 'express';

import concertController from '../controllers/concertController.js';

import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, concertController.getAllConcerts);
router.post('/', auth, concertController.createConcert);

export default router;
