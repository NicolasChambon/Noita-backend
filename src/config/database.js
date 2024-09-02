import { Sequelize } from 'sequelize';
import dotenv from 'dotenv/config';

// Database connection we want to use underscored naming strategy
const sequelize = new Sequelize(process.env.PG_URL, {
  define: {
    underscored: true,
  },
});

export default sequelize;
