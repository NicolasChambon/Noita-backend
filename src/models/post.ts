import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database.js';

export class Post extends Model<
  InferAttributes<Post>,
  InferCreationAttributes<Post>
> {
  declare id: CreationOptional<number>;
  declare title_fr: string;
  declare title_de: string;
  declare content_fr: string;
  declare content_de: string;
  declare displayed_date: Date;
  declare image_url: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Instance methods
  public toJSON(): object {
    const values = { ...this.get() };
    return {
      id: values.id,
      title_fr: values.title_fr,
      title_de: values.title_de,
      content_fr: values.content_fr,
      content_de: values.content_de,
      displayed_date: values.displayed_date,
      image_url: values.image_url,
      created_at: values.createdAt,
      updated_at: values.updatedAt,
    };
  }
}

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
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    title_de: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    content_fr: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    content_de: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    displayed_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
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
    tableName: 'post',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default Post;
