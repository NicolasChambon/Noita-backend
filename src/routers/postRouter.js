import express from 'express';

import postController from '../controllers/postController.js';

import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', postController.getAllPosts);
router.get('/:id', auth, postController.getPost);
router.post('/', auth, postController.createPost);
router.put('/:id', auth, postController.updatePost);
// router.delete('/:id', auth, postController.deletePost);

export default router;
