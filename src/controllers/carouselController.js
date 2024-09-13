// Dependencies
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // Provides utilities for URL resolution and parsing

// Database
import sequelize from '../config/database.js';

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
};

export default carouselController;
