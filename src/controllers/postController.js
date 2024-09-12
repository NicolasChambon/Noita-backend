// Dependencies
import path from 'path';
import fs from 'fs';
import { promisify } from 'util'; // Provides a set of functions for working with asynchronous code
import { fileURLToPath } from 'url'; // Provides utilities for URL resolution and parsing

// Models
import Post from '../models/post.js';

// Utils
import postFormValidation from '../utils/validations/postFormValidation.js';

// File system functions for image handling
const writeFileAsync = promisify(fs.writeFile); // Allows to use async/await with fs functions
const __filename = fileURLToPath(import.meta.url); // /var/www/html/Noita/Noita-backend/src/controllers/postController.js
const __dirname = path.dirname(__filename); // /var/www/html/Noita/Noita-backend/src/controllers

const postController = {
  getAllPosts: async (req, res) => {
    try {
      // Find all posts sorted by event date
      const posts = await Post.findAll({
        order: [['created_at', 'DESC']],
      });
      if (!posts) {
        return res.status(404).send({ message: 'No post found' });
      }
      res.status(200).json(posts);
    } catch (error) {
      console.error('Error while getting posts', error.message);
      res.status(500).json({
        message: 'Error while getting posts',
        error: error.message,
      });
    }
  },

  getPost: async (req, res) => {
    try {
      const post = await Post.findByPk(req.params.id);
      if (!post) {
        return res.status(404).send({ message: 'Post not found' });
      }
      res.status(200).json(post);
    } catch (error) {
      console.error('Error while getting post', error.message);
      res.status(500).json({
        message: 'Error while getting post',
        error: error.message,
      });
    }
  },

  createPost: async (req, res) => {
    // Validate request
    const errorMessages = postFormValidation(req, 'create');
    if (errorMessages.length > 0) {
      return res.status(400).json({ errors: errorMessages });
    }

    // Extract image data and define image path and name to save it
    const imageData = req.body.img64.split(',')[1];
    const newId = (await Post.max('id')) + 1;
    const imageName = `post-${newId}.png`;
    const imagePath = path.join(__dirname, `../../public/images/${imageName}`);

    // Save image to file system
    try {
      // Buffer is a global object that can be used to convert data to different encoding types
      await writeFileAsync(imagePath, Buffer.from(imageData, 'base64'));
      console.log('Image saved successfully');
    } catch (error) {
      console.error('Error while saving image', error.message);
      return res.status(500).json({
        message: 'Error while saving image',
        error: error.message,
      });
    }

    try {
      const post = await Post.create({
        title_fr: req.body.titleFr,
        title_de: req.body.titleDe,
        content_fr: req.body.contentFr,
        content_de: req.body.contentDe,
        image_url: `/images/${imageName}`,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error('Error while creating post', error.message);
      res.status(500).json({
        message: 'Error while creating post',
        error: error.message,
      });
    }
  },

  updatePost: async (req, res) => {
    // Validate request
    const errorMessages = postFormValidation(req, 'update');
    if (errorMessages.length > 0) {
      return res.status(400).json({ errors: errorMessages });
    }

    const imageName = `post-${req.params.id}.png`;
    if (req.body.img64) {
      // Extract image data and define image path and name to save it
      const imageData = req.body.img64.split(',')[1];
      const imagePath = path.join(
        __dirname,
        `../../public/images/${imageName}`
      );

      // Save image to file system
      try {
        await writeFileAsync(imagePath, Buffer.from(imageData, 'base64'));
        console.log('Image saved successfully');
      } catch (error) {
        console.error('Error while saving image', error.message);
        return res.status(500).json({
          message: 'Error while saving image',
          error: error.message,
        });
      }
    }

    try {
      const post = await Post.findByPk(req.params.id);
      if (!post) {
        return res.status(404).send({ message: 'Post not found' });
      }
      post.title_fr = req.body.titleFr;
      post.title_de = req.body.titleDe;
      post.content_fr = req.body.contentFr;
      post.content_de = req.body.contentDe;
      post.image_url = `/images/${imageName}`;
      await post.save();
      res.status(200).json(post);
    } catch (error) {
      console.error('Error while updating post', error.message);
      res.status(500).json({
        message: 'Error while updating post',
        error: error.message,
      });
    }
  },

  // in deletePost function, we will delete the post image from the file system
  deletePost: async (req, res) => {
    try {
      const post = await Post.findByPk(req.params.id);
      if (!post) {
        return res.status(404).send({ message: 'Post not found' });
      }
      const imagePath = path.join(__dirname, `../../public${post.image_url}`);
      fs.unlinkSync(imagePath);
      await post.destroy();
      res.status(200).send({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error while deleting post', error.message);
      res.status(500).json({
        message: 'Error while deleting post',
        error: error.message,
      });
    }
  },
};

export default postController;
