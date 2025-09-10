import { Request, Response } from 'express';
import {
  CreateCarouselRequest,
  UpdateCarouselRequest,
  SwitchPositionRequest,
  ApiResponse,
  AuthenticatedRequest,
} from '../types/index.js';
import { CarouselService } from '../services/CarouselService.js';
import { CarouselValidator } from '../utils/validation/carouselValidation.js';
import { asyncHandler } from '../utils/errors/AppError.js';

export class CarouselController {
  static getAllPictures = asyncHandler(
    async (req: Request, res: Response<ApiResponse>) => {
      const pictures = await CarouselService.getAllPictures();

      res.status(200).json({
        data: pictures,
        message: 'Pictures retrieved successfully',
      });
    }
  );

  static getPicture = asyncHandler(
    async (req: Request, res: Response<ApiResponse>) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid picture ID',
          errors: ['Picture ID must be a valid number'],
        });
      }

      const picture = await CarouselService.getPictureById(id);

      return res.status(200).json({
        data: picture,
        message: 'Picture retrieved successfully',
      });
    }
  );

  static addPicture = asyncHandler(
    async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
      const sanitizedData = CarouselValidator.sanitizeCarouselData(
        req.body as CreateCarouselRequest
      );
      const validation = CarouselValidator.validateCreateCarousel(
        sanitizedData as CreateCarouselRequest
      );

      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors?.map((error) => error.message) || [],
        });
      }

      const result = await CarouselService.addPicture(
        sanitizedData as CreateCarouselRequest
      );

      if (!result.success) {
        return res.status(400).json({
          message: result.error || 'Failed to add picture',
          errors: [result.error || 'Failed to add picture'],
        });
      }

      return res.status(201).json({
        data: result.data,
        message: 'Picture added successfully',
      });
    }
  );

  static changeImage = asyncHandler(
    async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid picture ID',
          errors: ['Picture ID must be a valid number'],
        });
      }

      const updateData: UpdateCarouselRequest = {
        ...(req.body as CreateCarouselRequest),
        id: req.params.id,
      };

      const sanitizedData = CarouselValidator.sanitizeCarouselData(updateData);
      const validation = CarouselValidator.validateUpdateCarousel(
        sanitizedData as UpdateCarouselRequest
      );

      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors?.map((error) => error.message) || [],
        });
      }

      const result = await CarouselService.updatePicture(
        id,
        sanitizedData as UpdateCarouselRequest
      );

      if (!result.success) {
        return res.status(400).json({
          message: result.error || 'Failed to update picture',
          errors: [result.error || 'Failed to update picture'],
        });
      }

      return res.status(200).json({
        data: result.data,
        message: 'Picture updated successfully',
      });
    }
  );

  static switchPositions = asyncHandler(
    async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid picture ID',
          errors: ['Picture ID must be a valid number'],
        });
      }

      const validation = CarouselValidator.validateSwitchPosition(
        req.body as SwitchPositionRequest
      );

      if (!validation.isValid) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: validation.errors?.map((error) => error.message) || [],
        });
      }

      const result = await CarouselService.switchPositions(
        id,
        req.body as SwitchPositionRequest
      );

      if (!result.success) {
        return res.status(400).json({
          message: result.error || 'Failed to switch positions',
          errors: [result.error || 'Failed to switch positions'],
        });
      }

      return res.status(200).json({
        message: 'Picture positions switched successfully',
      });
    }
  );

  static deletePicture = asyncHandler(
    async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          message: 'Invalid picture ID',
          errors: ['Picture ID must be a valid number'],
        });
      }

      const result = await CarouselService.deletePicture(id);

      if (!result.success) {
        return res.status(400).json({
          message: result.error || 'Failed to delete picture',
          errors: [result.error || 'Failed to delete picture'],
        });
      }

      return res.status(200).json({
        message: 'Picture deleted successfully',
      });
    }
  );
}

// Export individual methods for backwards compatibility
export const {
  getAllPictures,
  getPicture,
  addPicture,
  changeImage,
  switchPositions,
  deletePicture,
} = CarouselController;
