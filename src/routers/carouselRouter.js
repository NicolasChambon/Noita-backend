import express from 'express';

import carouselController from '../controllers/carouselController.js';

import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', carouselController.getAllPictures);
// router.get('/:id', auth, carouselController.getPicture);
// router.post('/', auth, carouselController.addPicture);
// router.put('/:id', auth, carouselController.updatePicture);
// router.delete('/:id', auth, carouselController.deletePicture);

export default router;
