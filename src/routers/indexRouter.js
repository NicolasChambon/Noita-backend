import express from 'express';

// import carousePictureRouter from './carouselPictureRouter.js';
// import concertRouter from './concertRouter.js';
// import postRouter from './postRouter.js';

import mainController from '../controllers/mainControllers.js';

const router = express.Router();

// router.use('/api/carousel-pictures', carousePictureRouter);
// router.use('/api/concerts', concertRouter);
// router.use('/api/posts', postRouter);

router.get('/', mainController.index);

export default router;
