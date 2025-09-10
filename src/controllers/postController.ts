import { Request, Response } from 'express';
import {
  CreatePostRequest,
  UpdatePostRequest,
  ApiResponse,
  AuthenticatedRequest,
} from '../types/index.js';
import { PostService } from '../services/PostService.js';
import { PostValidator } from '../utils/validation/postValidation.js';
import { asyncHandler } from '../utils/errors/AppError.js';

export class PostController {
  static getAllPosts = asyncHandler(
    async (req: Request, res: Response<ApiResponse>) => {
      const posts = await PostService.getAllPosts();

      res.status(200).json({
        data: posts,
        message: 'Posts retrieved successfully',
      });
    }
  );

  static getPost = asyncHandler(
    async (req: Request, res: Response<ApiResponse>) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid post ID',
          errors: ['Post ID must be a valid number'],
        });
      }

      const post = await PostService.getPostById(id);

      return res.status(200).json({
        data: post,
        message: 'Post retrieved successfully',
      });
    }
  );

  static createPost = asyncHandler(
    async (
      req: AuthenticatedRequest<CreatePostRequest>,
      res: Response<ApiResponse>
    ) => {
      // Sanitize input data
      const sanitizedData = PostValidator.sanitizePostData(req.body);

      // Validate request data
      const validation = PostValidator.validateCreatePost(sanitizedData);
      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors.map((err) => err.message),
        });
      }

      const result = await PostService.createPost(sanitizedData);

      if (!result.success) {
        return res.status(500).json({
          message: 'Failed to create post',
          errors: [result.error || 'Unknown error'],
        });
      }

      return res.status(201).json({
        data: result.data,
        message: 'Post created successfully',
      });
    }
  );

  static updatePost = asyncHandler(
    async (
      req: AuthenticatedRequest<UpdatePostRequest>,
      res: Response<ApiResponse>
    ) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid post ID',
          errors: ['Post ID must be a valid number'],
        });
      }

      // Add ID to request body for validation
      const requestData: UpdatePostRequest = { ...req.body, id: req.params.id };

      // Sanitize input data
      const sanitizedData = PostValidator.sanitizePostData(
        requestData
      ) as UpdatePostRequest;

      // Validate request data
      const validation = PostValidator.validateUpdatePost(sanitizedData);
      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors.map((err) => err.message),
        });
      }

      const result = await PostService.updatePost(id, sanitizedData);

      if (!result.success) {
        const statusCode = result.error === 'Post not found' ? 404 : 500;
        return res.status(statusCode).json({
          message: result.error || 'Failed to update post',
          errors: [result.error || 'Unknown error'],
        });
      }

      return res.status(200).json({
        data: result.data,
        message: 'Post updated successfully',
      });
    }
  );

  static deletePost = asyncHandler(
    async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid post ID',
          errors: ['Post ID must be a valid number'],
        });
      }

      const result = await PostService.deletePost(id);

      if (!result.success) {
        const statusCode = result.error === 'Post not found' ? 404 : 500;
        return res.status(statusCode).json({
          message: result.error || 'Failed to delete post',
          errors: [result.error || 'Unknown error'],
        });
      }

      return res.status(200).json({
        message: 'Post deleted successfully',
      });
    }
  );
}

// Export individual methods for backwards compatibility
export const { getAllPosts, getPost, createPost, updatePost, deletePost } =
  PostController;

export default PostController;
