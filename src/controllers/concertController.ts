import { Request, Response } from 'express';
import {
  CreateConcertRequest,
  UpdateConcertRequest,
  ApiResponse,
  AuthenticatedRequest,
} from '../types/index.js';
import { ConcertService } from '../services/ConcertService.js';
import { ConcertValidator } from '../utils/validation/concertValidation.js';
import { asyncHandler } from '../utils/errors/AppError.js';

export class ConcertController {
  static getAllConcerts = asyncHandler(
    async (req: Request, res: Response<ApiResponse>) => {
      const concerts = await ConcertService.getAllConcerts();

      res.status(200).json({
        data: concerts,
        message: 'Concerts retrieved successfully',
      });
    }
  );

  static getConcert = asyncHandler(
    async (req: Request, res: Response<ApiResponse>) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid concert ID',
          errors: ['Concert ID must be a valid number'],
        });
      }

      const concert = await ConcertService.getConcertById(id);

      return res.status(200).json({
        data: concert,
        message: 'Concert retrieved successfully',
      });
    }
  );

  static createConcert = asyncHandler(
    async (
      req: AuthenticatedRequest<CreateConcertRequest>,
      res: Response<ApiResponse>
    ) => {
      // Sanitize input data
      const sanitizedData = ConcertValidator.sanitizeConcertData(req.body);

      // Validate request data
      const validation = ConcertValidator.validateCreateConcert(sanitizedData);
      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors.map((err) => err.message),
        });
      }

      const result = await ConcertService.createConcert(sanitizedData);

      if (!result.success) {
        return res.status(500).json({
          message: 'Failed to create concert',
          errors: [result.error || 'Unknown error'],
        });
      }

      return res.status(201).json({
        data: result.data,
        message: 'Concert created successfully',
      });
    }
  );

  static updateConcert = asyncHandler(
    async (
      req: AuthenticatedRequest<UpdateConcertRequest>,
      res: Response<ApiResponse>
    ) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid concert ID',
          errors: ['Concert ID must be a valid number'],
        });
      }

      // Add ID to request body for validation
      const requestData: UpdateConcertRequest = {
        ...req.body,
        id: req.params.id,
      };

      // Sanitize input data
      const sanitizedData = ConcertValidator.sanitizeConcertData(
        requestData
      ) as UpdateConcertRequest;

      // Validate request data
      const validation = ConcertValidator.validateUpdateConcert(sanitizedData);
      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors.map((err) => err.message),
        });
      }

      const result = await ConcertService.updateConcert(id, sanitizedData);

      if (!result.success) {
        const statusCode = result.error === 'Concert not found' ? 404 : 500;
        return res.status(statusCode).json({
          message: result.error || 'Failed to update concert',
          errors: [result.error || 'Unknown error'],
        });
      }

      return res.status(200).json({
        data: result.data,
        message: 'Concert updated successfully',
      });
    }
  );

  static deleteConcert = asyncHandler(
    async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid concert ID',
          errors: ['Concert ID must be a valid number'],
        });
      }

      const result = await ConcertService.deleteConcert(id);

      if (!result.success) {
        const statusCode = result.error === 'Concert not found' ? 404 : 500;
        return res.status(statusCode).json({
          message: result.error || 'Failed to delete concert',
          errors: [result.error || 'Unknown error'],
        });
      }

      return res.status(200).json({
        message: 'Concert deleted successfully',
      });
    }
  );
}

// Export individual methods for backwards compatibility
export const {
  getAllConcerts,
  getConcert,
  createConcert,
  updateConcert,
  deleteConcert,
} = ConcertController;

export default ConcertController;
