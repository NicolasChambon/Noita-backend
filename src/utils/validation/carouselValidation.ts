import {
  CreateCarouselRequest,
  UpdateCarouselRequest,
  SwitchPositionRequest,
  ValidationError,
  ValidationResult,
} from '../../types/index.js';

export class CarouselValidator {
  static validateCreateCarousel(data: CreateCarouselRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate picture64 (base64 image data)
    if (!data.picture64 || data.picture64.trim().length === 0) {
      errors.push({
        field: 'picture64',
        message: 'Picture data is required',
      });
    } else if (!this.isValidBase64Image(data.picture64)) {
      errors.push({
        field: 'picture64',
        message:
          'Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateCarousel(data: UpdateCarouselRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate ID
    if (!data.id || data.id.trim().length === 0) {
      errors.push({
        field: 'id',
        message: 'Picture ID is required',
      });
    } else if (isNaN(parseInt(data.id))) {
      errors.push({
        field: 'id',
        message: 'Picture ID must be a valid number',
      });
    }

    // Use the same validation as create for other fields
    const createValidation = this.validateCreateCarousel(data);
    errors.push(...createValidation.errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateSwitchPosition(data: SwitchPositionRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate direction
    if (!data.direction) {
      errors.push({
        field: 'direction',
        message: 'Direction is required',
      });
    } else if (data.direction !== 'left' && data.direction !== 'right') {
      errors.push({
        field: 'direction',
        message: 'Direction must be either "left" or "right"',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isValidBase64Image(imageData: string): boolean {
    const validFormats = [
      'data:image/jpeg;base64,',
      'data:image/png;base64,',
      'data:image/gif;base64,',
      'data:image/webp;base64,',
    ];

    return validFormats.some((format) => imageData.startsWith(format));
  }

  static sanitizeCarouselData(
    data: CreateCarouselRequest | UpdateCarouselRequest
  ): CreateCarouselRequest | UpdateCarouselRequest {
    return {
      ...data,
      picture64: data.picture64?.trim(),
    };
  }
}

export default CarouselValidator;
