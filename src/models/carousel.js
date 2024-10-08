import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Carousel extends Model {}

Carousel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'carousel_picture',
    timestamps: true,
  }
);

export default Carousel;
