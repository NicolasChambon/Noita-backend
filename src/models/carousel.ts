import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database.js';

export class Carousel extends Model<
  InferAttributes<Carousel>,
  InferCreationAttributes<Carousel>
> {
  declare id: CreationOptional<number>;
  declare url: string;
  declare position: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Instance methods
  public toJSON(): object {
    const values = { ...this.get() };
    return {
      id: values.id,
      url: values.url,
      position: values.position,
      created_at: values.createdAt,
      updated_at: values.updatedAt,
    };
  }
}

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
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 100,
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'carousel_picture',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['position'],
        unique: true,
      },
      {
        fields: ['url'],
        unique: true,
      },
    ],
  }
);

export default Carousel;
