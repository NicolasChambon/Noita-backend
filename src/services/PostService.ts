import { Transaction } from 'sequelize';
import { Post } from '../models/post.js';
import { getDatabase } from '../config/database.js';
import {
  CreatePostRequest,
  UpdatePostRequest,
  ServiceResult,
} from '../types/index.js';
import { NotFoundError, AppError } from '../utils/errors/AppError.js';
import { ImageUploadService } from './ImageUploadService.js';

export class PostService {
  private static imageUploadService = new ImageUploadService();

  static async getAllPosts(): Promise<Post[]> {
    try {
      const posts = await Post.findAll({
        order: [['createdAt', 'DESC']],
      });
      return posts;
    } catch {
      throw new AppError('Failed to fetch posts', 500);
    }
  }

  static async getPostById(id: number): Promise<Post> {
    try {
      const post = await Post.findByPk(id);
      if (!post) {
        throw new NotFoundError('Post');
      }
      return post;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new AppError('Failed to fetch post', 500);
    }
  }

  static async createPost(
    postData: CreatePostRequest
  ): Promise<ServiceResult<Post>> {
    const sequelize = await getDatabase();
    const transaction: Transaction = await sequelize.transaction();

    try {
      // Create post with temporary image URL
      const post = await Post.create(
        {
          title_fr: postData.title_fr,
          title_de: postData.title_de,
          content_fr: postData.content_fr,
          content_de: postData.content_de,
          displayed_date: new Date(postData.displayed_date),
          image_url: 'temp',
        },
        { transaction }
      );

      // Handle image upload if provided
      if (postData.img64) {
        const imageName = `post-${post.id}.png`;
        const uploadResult = await this.imageUploadService.uploadImage(
          postData.img64,
          imageName
        );

        if (!uploadResult.success) {
          await transaction.rollback();
          return {
            success: false,
            error: uploadResult.error || 'Failed to upload image',
          };
        }

        // Update post with correct image URL
        await post.update(
          { image_url: `/images/${imageName}` },
          { transaction }
        );
      }

      await transaction.commit();
      return {
        success: true,
        data: post,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create post',
      };
    }
  }

  static async updatePost(
    id: number,
    postData: UpdatePostRequest
  ): Promise<ServiceResult<Post>> {
    const sequelize = await getDatabase();
    const transaction: Transaction = await sequelize.transaction();

    try {
      const post = await Post.findByPk(id, { transaction });
      if (!post) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Post not found',
        };
      }

      // Handle image upload if provided
      if (postData.img64) {
        const imageName = `post-${id}.png`;
        const uploadResult = await this.imageUploadService.uploadImage(
          postData.img64,
          imageName
        );

        if (!uploadResult.success) {
          await transaction.rollback();
          return {
            success: false,
            error: uploadResult.error || 'Failed to upload image',
          };
        }
      }

      // Update post data
      await post.update(
        {
          title_fr: postData.title_fr,
          title_de: postData.title_de,
          content_fr: postData.content_fr,
          content_de: postData.content_de,
          displayed_date: new Date(postData.displayed_date),
          image_url: postData.img64 ? `/images/post-${id}.png` : post.image_url,
        },
        { transaction }
      );

      await transaction.commit();
      return {
        success: true,
        data: post,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update post',
      };
    }
  }

  static async deletePost(id: number): Promise<ServiceResult<void>> {
    const sequelize = await getDatabase();
    const transaction: Transaction = await sequelize.transaction();

    try {
      const post = await Post.findByPk(id, { transaction });
      if (!post) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Post not found',
        };
      }

      // Delete associated image
      if (post.image_url && post.image_url !== 'temp') {
        await this.imageUploadService.deleteImage(post.image_url);
      }

      await post.destroy({ transaction });
      await transaction.commit();

      return {
        success: true,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete post',
      };
    }
  }
}

export default PostService;
