import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

class Post extends Model {}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title_fr: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title_de: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content_fr: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content_de: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'post',
    timestamps: true,
  }
);

export default Post;
