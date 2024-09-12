// Dependencies
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url'; // Provides utilities for URL resolution and parsing

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
};

export default carouselController;
