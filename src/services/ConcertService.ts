import { Transaction } from 'sequelize';
import { Concert } from '../models/concert.js';
import { getDatabase } from '../config/database.js';
import {
  CreateConcertRequest,
  UpdateConcertRequest,
  ServiceResult,
} from '../types/index.js';
import { NotFoundError, AppError } from '../utils/errors/AppError.js';

export class ConcertService {
  static async getAllConcerts(): Promise<Concert[]> {
    try {
      const concerts = await Concert.findAll({
        order: [['event_date', 'DESC']],
      });
      return concerts;
    } catch {
      throw new AppError('Failed to fetch concerts', 500);
    }
  }

  static async getConcertById(id: number): Promise<Concert> {
    try {
      const concert = await Concert.findByPk(id);
      if (!concert) {
        throw new NotFoundError('Concert');
      }
      return concert;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new AppError('Failed to fetch concert', 500);
    }
  }

  static async createConcert(
    concertData: CreateConcertRequest
  ): Promise<ServiceResult<Concert>> {
    const sequelize = await getDatabase();
    const transaction: Transaction = await sequelize.transaction();

    try {
      const concert = await Concert.create(
        {
          city: concertData.city,
          event_date: new Date(concertData.event_date),
          venue: concertData.venue || null,
          event_name: concertData.event_name || null,
          event_url: concertData.event_url,
        },
        { transaction }
      );

      await transaction.commit();
      return {
        success: true,
        data: concert,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create concert',
      };
    }
  }

  static async updateConcert(
    id: number,
    concertData: UpdateConcertRequest
  ): Promise<ServiceResult<Concert>> {
    const sequelize = await getDatabase();
    const transaction: Transaction = await sequelize.transaction();

    try {
      const [updatedRowsCount] = await Concert.update(
        {
          city: concertData.city,
          event_date: new Date(concertData.event_date),
          venue: concertData.venue || null,
          event_name: concertData.event_name || null,
          event_url: concertData.event_url,
        },
        {
          where: { id },
          transaction,
          returning: true,
        }
      );

      if (updatedRowsCount === 0) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Concert not found',
        };
      }

      const updatedConcert = await Concert.findByPk(id, { transaction });

      await transaction.commit();
      return {
        success: true,
        data: updatedConcert!,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update concert',
      };
    }
  }

  static async deleteConcert(id: number): Promise<ServiceResult<void>> {
    const sequelize = await getDatabase();
    const transaction: Transaction = await sequelize.transaction();

    try {
      const concert = await Concert.findByPk(id, { transaction });
      if (!concert) {
        await transaction.rollback();
        return {
          success: false,
          error: 'Concert not found',
        };
      }

      await concert.destroy({ transaction });
      await transaction.commit();

      return {
        success: true,
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete concert',
      };
    }
  }
}

export default ConcertService;
