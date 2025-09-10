import { Sequelize } from 'sequelize';
import { config } from './index.js';

let sequelize: Sequelize | null = null;

// Lazy database connection for better Cloud Run cold start performance
export const getDatabase = async (): Promise<Sequelize> => {
  if (!sequelize) {
    sequelize = new Sequelize(config.database.url, config.database.options);
    await sequelize.authenticate();
  }
  return sequelize;
};

// Initialize database connection (for backwards compatibility)
const createSequelize = (): Sequelize => {
  return new Sequelize(config.database.url, config.database.options);
};

// Export default instance for immediate use (if needed)
export default createSequelize();
