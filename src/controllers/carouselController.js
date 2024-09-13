// Dependencies
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // Provides utilities for URL resolution and parsing

// Database
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

// Models
import Carousel from '../models/carousel.js';

// Utils
import imageUpload from '../utils/upload/imageUpload.js';

// File system variables for image handling
const __filename = fileURLToPath(import.meta.url); // /var/www/html/Noita/Noita-backend/src/controllers/postController.js
const __dirname = path.dirname(__filename); // /var/www/html/Noita/Noita-backend/src/controllers

const carouselController = {
  getAllPictures: async (req, res) => {
    try {
      // Find all pictures sorted by position
      const pictures = await Carousel.findAll({
        order: [['position', 'ASC']],
      });
      if (!pictures) {
        return res.status(404).send({ message: 'No picture found' });
      }
      res.status(200).json(pictures);
    } catch (error) {
      console.error('Error while getting pictures', error.message);
      res.status(500).json({
        message: 'Error while getting pictures',
        error: error.message,
      });
    }
  },

  addPicture: async (req, res) => {
    try {
      // Define the last position
      const lastPosition = (await Carousel.max('position')) + 1;

      // Create a new picture in the database
      const newPicture = await Carousel.create({
        position: lastPosition,
        url: 'temp',
      });

      // We use the id of the new picture to name the image
      const imageName = `carousel-${newPicture.id}.png`;
      const imageData = req.body.picture64.split(',')[1];

      // Save image to file system
      const imageUploadResult = await imageUpload(imageData, imageName);
      if (imageUploadResult !== true) {
        await newPicture.destroy();
        return res.status(500).json({
          message: 'Error while uploading image',
          error: imageUploadResult.error,
        });
      }

      // Update the picture with the correct URL
      newPicture.url = `/images/${imageName}`;
      await newPicture.save();
      res.status(201).json(newPicture);
    } catch (error) {
      console.error('Error while creating picture', error.message);
      res.status(500).json({
        message: 'Error while creating picture',
        error: error.message,
      });
    }
  },

  deletePicture: async (req, res) => {
    const t = await sequelize.transaction();

    try {
      // Find the picture to delete
      const picture = await Carousel.findByPk(req.params.id, {
        transaction: t,
      });
      if (!picture) {
        return res.status(404).send({ message: 'Picture not found' });
      }

      // Delete the picture from the database
      await picture.destroy({ transaction: t });

      // We decrement the position of all the pictures that were after the deleted one
      await Carousel.update(
        // sequelize.literal() is used to perform operations on the database
        // UPDATE carousel_picture SET position = position - 1 WHERE position > picture.position
        { position: sequelize.literal('position - 1') },
        {
          where: {
            position: {
              // Op.gt = greater than
              // WHERE position > picture.position
              [Op.gt]: picture.position,
            },
          },
          transaction: t,
        }
      );

      await t.commit();

      // Delete the image from the file system if transaction is successful
      const imagePath = path.join(__dirname, `../../public${picture.url}`);
      fs.unlinkSync(imagePath);

      res.status(200).json({ message: 'Picture deleted and position updated' });
    } catch (error) {
      await t.rollback(); // Rollback the transaction
      console.error('Error while deleting picture', error.message);
      res.status(500).json({
        message: 'Error while deleting picture',
        error: error.message,
      });
    }
  },
};

export default carouselController;
