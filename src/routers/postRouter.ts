import express from 'express';
import { PostController } from '../controllers/postController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', PostController.getAllPosts);
router.get('/:id', PostController.getPost);

// Protected routes (require authentication)
router.post('/', auth, PostController.createPost);
router.put('/:id', auth, PostController.updatePost);
router.delete('/:id', auth, PostController.deletePost);

export default router;
