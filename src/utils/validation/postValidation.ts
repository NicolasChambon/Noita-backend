import {
  CreatePostRequest,
  UpdatePostRequest,
  ValidationError,
  ValidationResult,
} from '../../types/index.js';

export class PostValidator {
  static validateCreatePost(data: CreatePostRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate French title
    if (!data.title_fr || data.title_fr.trim().length === 0) {
      errors.push({
        field: 'title_fr',
        message: 'French title is required',
      });
    } else if (data.title_fr.length > 255) {
      errors.push({
        field: 'title_fr',
        message: 'French title must be less than 255 characters',
      });
    }

    // Validate German title
    if (!data.title_de || data.title_de.trim().length === 0) {
      errors.push({
        field: 'title_de',
        message: 'German title is required',
      });
    } else if (data.title_de.length > 255) {
      errors.push({
        field: 'title_de',
        message: 'German title must be less than 255 characters',
      });
    }

    // Validate French content
    if (!data.content_fr || data.content_fr.trim().length === 0) {
      errors.push({
        field: 'content_fr',
        message: 'French content is required',
      });
    }

    // Validate German content
    if (!data.content_de || data.content_de.trim().length === 0) {
      errors.push({
        field: 'content_de',
        message: 'German content is required',
      });
    }

    // Validate image data if provided
    if (data.img64) {
      if (!this.isValidBase64Image(data.img64)) {
        errors.push({
          field: 'img64',
          message:
            'Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdatePost(data: UpdatePostRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate ID
    if (!data.id || data.id.trim().length === 0) {
      errors.push({
        field: 'id',
        message: 'Post ID is required',
      });
    } else if (isNaN(parseInt(data.id))) {
      errors.push({
        field: 'id',
        message: 'Post ID must be a valid number',
      });
    }

    // Use the same validation as create for other fields
    const createValidation = this.validateCreatePost(data);
    errors.push(...createValidation.errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isValidBase64Image(base64: string): boolean {
    try {
      // Check if the string starts with valid image data URI prefixes
      const validImageTypes = [
        'data:image/jpeg;base64,',
        'data:image/png;base64,',
        'data:image/gif;base64,',
        'data:image/webp;base64,',
      ];
      const hasValidPrefix = validImageTypes.some((prefix) =>
        base64.startsWith(prefix)
      );

      if (!hasValidPrefix && !base64.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  static sanitizePostData(
    data: CreatePostRequest | UpdatePostRequest
  ): CreatePostRequest | UpdatePostRequest {
    return {
      ...data,
      title_fr: data.title_fr?.trim(),
      title_de: data.title_de?.trim(),
      content_fr: data.content_fr?.trim(),
      content_de: data.content_de?.trim(),
    };
  }
}

export default PostValidator;
