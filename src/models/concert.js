import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Concert extends Model {}

Concert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    event_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    event_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'concert',
    timestamps: true,
  }
);

export default Concert;
