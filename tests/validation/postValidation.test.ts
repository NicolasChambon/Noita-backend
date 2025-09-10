import { describe, it, expect } from '@jest/globals';
import { PostValidator } from '../../src/utils/validation/postValidation.js';
import type {
  CreatePostRequest,
  UpdatePostRequest,
} from '../../src/types/index.js';

describe('PostValidator', () => {
  describe('validateCreatePost', () => {
    it('should pass validation with valid data', () => {
      const validData: CreatePostRequest = {
        title_fr: 'Test Title FR',
        title_de: 'Test Title DE',
        content_fr: 'Test content in French',
        content_de: 'Test content in German',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateCreatePost(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when French title is missing', () => {
      const invalidData: CreatePostRequest = {
        title_fr: '',
        title_de: 'Test Title DE',
        content_fr: 'Test content in French',
        content_de: 'Test content in German',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateCreatePost(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'title_fr',
        message: 'French title is required',
      });
    });

    it('should fail validation when German title is missing', () => {
      const invalidData: CreatePostRequest = {
        title_fr: 'Test Title FR',
        title_de: '',
        content_fr: 'Test content in French',
        content_de: 'Test content in German',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateCreatePost(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'title_de',
        message: 'German title is required',
      });
    });

    it('should fail validation when French content is missing', () => {
      const invalidData: CreatePostRequest = {
        title_fr: 'Test Title FR',
        title_de: 'Test Title DE',
        content_fr: '',
        content_de: 'Test content in German',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateCreatePost(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'content_fr',
        message: 'French content is required',
      });
    });

    it('should fail validation when German content is missing', () => {
      const invalidData: CreatePostRequest = {
        title_fr: 'Test Title FR',
        title_de: 'Test Title DE',
        content_fr: 'Test content in French',
        content_de: '',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateCreatePost(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'content_de',
        message: 'German content is required',
      });
    });

    it('should fail validation when French title is too long', () => {
      const longTitle = 'A'.repeat(256);
      const invalidData: CreatePostRequest = {
        title_fr: longTitle,
        title_de: 'Test Title DE',
        content_fr: 'Test content in French',
        content_de: 'Test content in German',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateCreatePost(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'title_fr',
        message: 'French title must be less than 255 characters',
      });
    });

    it('should fail validation when German title is too long', () => {
      const longTitle = 'A'.repeat(256);
      const invalidData: CreatePostRequest = {
        title_fr: 'Test Title FR',
        title_de: longTitle,
        content_fr: 'Test content in French',
        content_de: 'Test content in German',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateCreatePost(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'title_de',
        message: 'German title must be less than 255 characters',
      });
    });

    it('should fail validation with invalid image format', () => {
      const invalidData: CreatePostRequest = {
        title_fr: 'Test Title FR',
        title_de: 'Test Title DE',
        content_fr: 'Test content in French',
        content_de: 'Test content in German',
        displayed_date: '2023-10-01T00:00:00Z',
        img64: 'invalid-image-data',
      };

      const result = PostValidator.validateCreatePost(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'img64',
        message:
          'Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed',
      });
    });

    it('should pass validation with valid image format', () => {
      const validData: CreatePostRequest = {
        title_fr: 'Test Title FR',
        title_de: 'Test Title DE',
        content_fr: 'Test content in French',
        content_de: 'Test content in German',
        displayed_date: '2023-10-01T00:00:00Z',
        img64:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      };

      const result = PostValidator.validateCreatePost(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateUpdatePost', () => {
    it('should pass validation with valid data', () => {
      const validData: UpdatePostRequest = {
        id: '1',
        title_fr: 'Updated Title FR',
        title_de: 'Updated Title DE',
        content_fr: 'Updated content in French',
        content_de: 'Updated content in German',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateUpdatePost(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when ID is missing', () => {
      const invalidData: UpdatePostRequest = {
        id: '',
        title_fr: 'Updated Title FR',
        title_de: 'Updated Title DE',
        content_fr: 'Updated content in French',
        content_de: 'Updated content in German',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateUpdatePost(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'id',
        message: 'Post ID is required',
      });
    });

    it('should fail validation when ID is not a number', () => {
      const invalidData: UpdatePostRequest = {
        id: 'not-a-number',
        title_fr: 'Updated Title FR',
        title_de: 'Updated Title DE',
        content_fr: 'Updated content in French',
        content_de: 'Updated content in German',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateUpdatePost(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'id',
        message: 'Post ID must be a valid number',
      });
    });

    it('should include create validation errors', () => {
      const invalidData: UpdatePostRequest = {
        id: '1',
        title_fr: '', // Invalid French title
        title_de: 'Updated Title DE',
        content_fr: 'Updated content in French',
        content_de: '', // Invalid German content
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const result = PostValidator.validateUpdatePost(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((error) => error.field === 'title_fr')).toBe(
        true
      );
      expect(result.errors.some((error) => error.field === 'content_de')).toBe(
        true
      );
    });
  });

  describe('sanitizePostData', () => {
    it('should trim whitespace from all fields', () => {
      const dataWithWhitespace = {
        title_fr: '  Test Title FR  ',
        title_de: '  Test Title DE  ',
        content_fr: '  Test content in French  ',
        content_de: '  Test content in German  ',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const sanitized = PostValidator.sanitizePostData(dataWithWhitespace);

      expect(sanitized.title_fr).toBe('Test Title FR');
      expect(sanitized.title_de).toBe('Test Title DE');
      expect(sanitized.content_fr).toBe('Test content in French');
      expect(sanitized.content_de).toBe('Test content in German');
    });

    it('should handle UpdatePostRequest with ID', () => {
      const updateData: UpdatePostRequest = {
        id: '1',
        title_fr: '  Updated Title FR  ',
        title_de: '  Updated Title DE  ',
        content_fr: '  Updated content in French  ',
        content_de: '  Updated content in German  ',
        displayed_date: '2023-10-01T00:00:00Z',
      };

      const sanitized = PostValidator.sanitizePostData(
        updateData
      ) as UpdatePostRequest;

      expect(sanitized.id).toBe('1');
      expect(sanitized.title_fr).toBe('Updated Title FR');
      expect(sanitized.title_de).toBe('Updated Title DE');
      expect(sanitized.content_fr).toBe('Updated content in French');
      expect(sanitized.content_de).toBe('Updated content in German');
    });
  });
});
