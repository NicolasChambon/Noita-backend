import express from 'express';

import concertController from '../controllers/concertController.js';

const router = express.Router();

router.get('/', concertController.getAllConcerts);

export default router;
