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
    // Check if there are 100 pictures in the database
    const pictureCount = await Carousel.count();
    if (pictureCount === 100) {
      return res.status(400).json({
        errors: ['You can not add more than 100 pictures'],
      });
    }

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
    // Check if there are 3 pictures in the database
    const pictureCount = await Carousel.count();
    if (pictureCount === 3) {
      return res.status(400).json({
        errors: ['You need at least 3 pictures in the carousel'],
      });
    }

    // Start a transaction
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

      // Commit the transaction
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

  changeImage: async (req, res) => {
    try {
      // Find the picture to update
      const picture = await Carousel.findByPk(req.params.id);
      if (!picture) {
        return res.status(404).send({ message: 'Picture not found' });
      }

      // We use the id of the picture to name the image
      const imageName = `carousel-${picture.id}.png`;
      const imageData = req.body.picture64.split(',')[1];

      // Save image to file system
      const imageUploadResult = await imageUpload(imageData, imageName);
      if (imageUploadResult !== true) {
        return res.status(500).json({
          message: 'Error while uploading image',
          error: imageUploadResult.error,
        });
      }
      res.status(200).json({ message: 'Image updated' });
    } catch (error) {
      console.error('Error while updating picture', error.message);
      res.status(500).json({
        message: 'Error while updating picture',
        error: error.message,
      });
    }
  },

  switchPositions: async (req, res) => {
    // Start a transaction
    const t = await sequelize.transaction();

    try {
      // Find the 2 pictures to switch
      const pictureA = await Carousel.findByPk(req.params.id, {
        transaction: t,
      });
      if (!pictureA) {
        return res.status(404).send({ message: 'Picture not found' });
      }
      const originalAPosition = pictureA.position;

      let pictureB;
      if (req.body.direction === 'left') {
        pictureB = await Carousel.findOne({
          where: {
            position: {
              [Op.eq]: originalAPosition - 1,
            },
          },
          transaction: t,
        });
      } else {
        pictureB = await Carousel.findOne({
          where: {
            position: {
              [Op.eq]: originalAPosition + 1,
            },
          },
          transaction: t,
        });
      }
      const originalBPosition = pictureB.position;

      // Position are unique, so we attribute a temporary position to the pictureA
      await pictureA.update({ position: 101 }, { transaction: t });
      await pictureB.update(
        { position: originalAPosition },
        { transaction: t }
      );
      await pictureA.update(
        { position: originalBPosition },
        { transaction: t }
      );

      // Commit the transaction
      await t.commit();
      res.status(200).json({ message: 'Pictures positions switched' });
    } catch (error) {
      await t.rollback(); // Rollback the transaction
      console.error('Error while switching positions', error.message);
      res.status(500).json({
        message: 'Error while switching positions',
        error: error.message,
      });
    }
  },
};

export default carouselController;
