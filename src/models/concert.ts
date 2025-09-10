import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database.js';

export class Concert extends Model<
  InferAttributes<Concert>,
  InferCreationAttributes<Concert>
> {
  declare id: CreationOptional<number>;
  declare city: string;
  declare event_date: Date;
  declare venue: string | null;
  declare event_name: string | null;
  declare event_url: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Instance methods
  public toJSON(): object {
    const values = { ...this.get() };
    return {
      id: values.id,
      city: values.city,
      event_date: values.event_date,
      venue: values.venue,
      event_name: values.event_name,
      event_url: values.event_url,
      created_at: values.createdAt,
      updated_at: values.updatedAt,
    };
  }
}

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
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    event_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 255],
      },
    },
    event_name: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 255],
      },
    },
    event_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true,
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
    tableName: 'concert',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['event_date'],
      },
      {
        fields: ['city'],
      },
    ],
  }
);

export default Concert;
