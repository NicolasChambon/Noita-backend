import express from 'express';
import { CarouselController } from '../controllers/carouselController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', CarouselController.getAllPictures);
router.get('/:id', CarouselController.getPicture);

// Protected routes (require authentication)
router.post('/', auth, CarouselController.addPicture);
router.put('/:id', auth, CarouselController.changeImage);
router.put('/position/:id', auth, CarouselController.switchPositions);
router.delete('/:id', auth, CarouselController.deletePicture);

export default router;
