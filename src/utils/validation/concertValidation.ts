import {
  CreateConcertRequest,
  UpdateConcertRequest,
  ValidationError,
  ValidationResult,
} from '../../types/index.js';

export class ConcertValidator {
  static validateCreateConcert(data: CreateConcertRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate city
    if (!data.city || data.city.trim().length === 0) {
      errors.push({
        field: 'city',
        message: 'City is required',
      });
    } else if (data.city.length > 255) {
      errors.push({
        field: 'city',
        message: 'City must be less than 255 characters',
      });
    }

    // Validate event date
    if (!data.event_date || data.event_date.trim().length === 0) {
      errors.push({
        field: 'event_date',
        message: 'Event date is required',
      });
    } else {
      const date = new Date(data.event_date);
      if (isNaN(date.getTime())) {
        errors.push({
          field: 'event_date',
          message: 'Event date must be a valid date',
        });
      }
    }

    // Validate that either venue or event name is provided
    if (
      (!data.venue || data.venue.trim().length === 0) &&
      (!data.event_name || data.event_name.trim().length === 0)
    ) {
      errors.push({
        field: 'venue',
        message: 'Either venue or event name is required',
      });
      errors.push({
        field: 'event_name',
        message: 'Either venue or event name is required',
      });
    }

    // Validate venue length if provided
    if (data.venue && data.venue.length > 255) {
      errors.push({
        field: 'venue',
        message: 'Venue must be less than 255 characters',
      });
    }

    // Validate event name length if provided
    if (data.event_name && data.event_name.length > 255) {
      errors.push({
        field: 'event_name',
        message: 'Event name must be less than 255 characters',
      });
    }

    // Validate event URL
    if (!data.event_url || data.event_url.trim().length === 0) {
      errors.push({
        field: 'event_url',
        message: 'Event URL is required',
      });
    } else if (!this.isValidUrl(data.event_url)) {
      errors.push({
        field: 'event_url',
        message: 'Event URL must be a valid URL',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateConcert(data: UpdateConcertRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate ID
    if (!data.id || data.id.trim().length === 0) {
      errors.push({
        field: 'id',
        message: 'Concert ID is required',
      });
    } else if (isNaN(parseInt(data.id))) {
      errors.push({
        field: 'id',
        message: 'Concert ID must be a valid number',
      });
    }

    // Use the same validation as create for other fields
    const createValidation = this.validateCreateConcert(data);
    errors.push(...createValidation.errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static sanitizeConcertData(
    data: CreateConcertRequest | UpdateConcertRequest
  ): CreateConcertRequest | UpdateConcertRequest {
    return {
      ...data,
      city: data.city?.trim(),
      event_date: data.event_date?.trim(),
      venue: data.venue?.trim(),
      event_name: data.event_name?.trim(),
      event_url: data.event_url?.trim(),
    };
  }
}

export default ConcertValidator;
