import { Transaction, Op } from 'sequelize';
import { Carousel } from '../models/carousel.js';
import { getDatabase } from '../config/database.js';
import {
  CreateCarouselRequest,
  UpdateCarouselRequest,
  SwitchPositionRequest,
  ServiceResult,
} from '../types/index.js';
import { NotFoundError, AppError } from '../utils/errors/AppError.js';
import ImageUploadService from './ImageUploadService.js';
import * as fs from 'fs';
import * as path from 'path';

export class CarouselService {
  private static imageUploadService = new ImageUploadService();

  static async getAllPictures(): Promise<Carousel[]> {
    try {
      const pictures = await Carousel.findAll({
        order: [['position', 'ASC']],
      });
      return pictures;
    } catch {
      throw new AppError('Failed to fetch pictures', 500);
    }
  }

  static async getPictureById(id: number): Promise<Carousel> {
    try {
      const picture = await Carousel.findByPk(id);
      if (!picture) {
        throw new NotFoundError('Picture');
      }
      return picture;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new AppError('Failed to fetch picture', 500);
    }
  }

  static async addPicture(
    pictureData: CreateCarouselRequest
  ): Promise<ServiceResult<Carousel>> {
    const sequelize = await getDatabase();
    const transaction: Transaction = await sequelize.transaction();

    try {
      // Check if there are 100 pictures in the database
      const pictureCount = await Carousel.count({ transaction });
      if (pictureCount >= 100) {
        await transaction.rollback();
        return {
          success: false,
          error: 'You cannot add more than 100 pictures',
        };
      }

      // Get the next position
      const maxPosition = await Carousel.max('position', { transaction });
      const nextPosition = (maxPosition ? Number(maxPosition) : 0) + 1;

      // Create picture with temporary URL
      const picture = await Carousel.create(
        {
          url: 'temp',
          position: nextPosition,
        },
        { transaction }
      );

      // Handle image upload
      const imageName = `carousel-${picture.id}.png`;

      const uploadResult = await this.imageUploadService.uploadImage(
        pictureData.picture64,
        imageName
      );

      if (!uploadResult.success) {
        await transaction.rollback();
        return {
          success: false,
          error: uploadResult.error || 'Failed to upload image',
        };
      }

      // Update picture with correct URL
      await picture.update({ url: `/images/${imageName}` }, { transaction });

      await transaction.commit();
      return {
        success: true,
        data: picture,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add picture',
      };
    }
  }

  static async updatePicture(
    id: number,
    pictureData: UpdateCarouselRequest
  ): Promise<ServiceResult<Carousel>> {
    const sequelize = await getDatabase();
    const transaction: Transaction = await sequelize.transaction();

    try {
      const picture = await Carousel.findByPk(id, { transaction });
      if (!picture) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Picture not found',
        };
      }

      // Handle image upload
      const imageName = `carousel-${id}.png`;

      const uploadResult = await this.imageUploadService.uploadImage(
        pictureData.picture64,
        imageName
      );

      if (!uploadResult.success) {
        await transaction.rollback();
        return {
          success: false,
          error: uploadResult.error || 'Failed to upload image',
        };
      }

      await transaction.commit();
      return {
        success: true,
        data: picture,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update picture',
      };
    }
  }

  static async deletePicture(id: number): Promise<ServiceResult<void>> {
    const sequelize = await getDatabase();
    const transaction: Transaction = await sequelize.transaction();

    try {
      // Check if there are at least 3 pictures
      const pictureCount = await Carousel.count({ transaction });
      if (pictureCount <= 3) {
        await transaction.rollback();
        return {
          success: false,
          error: 'You need at least 3 pictures in the carousel',
        };
      }

      const picture = await Carousel.findByPk(id, { transaction });
      if (!picture) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Picture not found',
        };
      }

      const deletedPosition = picture.position;

      // Delete the picture
      await picture.destroy({ transaction });

      // Update positions of pictures that were after the deleted one
      await Carousel.update(
        { position: sequelize.literal('position - 1') },
        {
          where: {
            position: {
              [Op.gt]: deletedPosition,
            },
          },
          transaction,
        }
      );

      // Delete associated image
      if (picture.url && picture.url !== 'temp') {
        try {
          const imagePath = path.join(process.cwd(), 'public', picture.url);
          await fs.promises.unlink(imagePath);
        } catch (error) {
          // Log error but don't fail the transaction if image deletion fails
          console.error('Failed to delete image file:', error);
        }
      }

      await transaction.commit();
      return {
        success: true,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete picture',
      };
    }
  }

  static async switchPositions(
    id: number,
    switchData: SwitchPositionRequest
  ): Promise<ServiceResult<void>> {
    const sequelize = await getDatabase();
    const transaction: Transaction = await sequelize.transaction();

    try {
      const pictureA = await Carousel.findByPk(id, { transaction });
      if (!pictureA) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Picture not found',
        };
      }

      const originalAPosition = pictureA.position;
      const targetPosition =
        switchData.direction === 'left'
          ? originalAPosition - 1
          : originalAPosition + 1;

      const pictureB = await Carousel.findOne({
        where: { position: targetPosition },
        transaction,
      });

      if (!pictureB) {
        await transaction.rollback();
        return {
          success: false,
          error: `Cannot move picture ${switchData.direction}. No picture found at target position.`,
        };
      }

      const originalBPosition = pictureB.position;

      // Use temporary position to avoid unique constraint violation
      await pictureA.update({ position: 1000 }, { transaction });
      await pictureB.update({ position: originalAPosition }, { transaction });
      await pictureA.update({ position: originalBPosition }, { transaction });

      await transaction.commit();
      return {
        success: true,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to switch positions',
      };
    }
  }
}

export default CarouselService;
