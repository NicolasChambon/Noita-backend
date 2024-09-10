import Post from '../models/post.js';

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

  // createPost: async (req, res) => {
  //   // Validate request
  //   const errorMessages = [];
  //   if (!req.body.city) {
  //     errorMessages.push('City is required.');
  //   }
  //   if (!req.body.eventDate) {
  //     errorMessages.push('Event date is required.');
  //   }
  //   if (!req.body.venue && !req.body.eventName) {
  //     errorMessages.push('Venue or event name is required.');
  //   }
  //   if (!req.body.link) {
  //     errorMessages.push('Link is required.');
  //   }
  //   if (errorMessages.length > 0) {
  //     return res.status(400).json({ errors: errorMessages });
  //   }

  //   try {
  //     const post = await Post.create({
  //       city: req.body.city,
  //       event_date: req.body.eventDate,
  //       venue: req.body.venue,
  //       event_name: req.body.eventName,
  //       event_url: req.body.link,
  //     });
  //     res.status(201).json(post);
  //   } catch (error) {
  //     console.error('Error while creating post', error.message);
  //     res.status(500).json({
  //       message: 'Error while creating post',
  //       error: error.message,
  //     });
  //   }
  // },

  // updatePost: async (req, res) => {
  //   // Validate request
  //   const errorMessages = [];
  //   if (!req.body.city) {
  //     errorMessages.push('City is required.');
  //   }
  //   if (!req.body.eventDate) {
  //     errorMessages.push('Event date is required.');
  //   }
  //   if (!req.body.venue && !req.body.eventName) {
  //     errorMessages.push('Venue or event name is required.');
  //   }
  //   if (!req.body.link) {
  //     errorMessages.push('Link is required.');
  //   }
  //   if (errorMessages.length > 0) {
  //     return res.status(400).json({ errors: errorMessages });
  //   }

  //   try {
  //     const post = await Post.findByPk(req.params.id);
  //     if (!post) {
  //       return res.status(404).send({ message: 'Post not found' });
  //     }
  //     post.city = req.body.city;
  //     post.event_date = req.body.eventDate;
  //     post.venue = req.body.venue;
  //     post.event_name = req.body.eventName;
  //     post.event_url = req.body.link;
  //     await post.save();
  //     res.status(200).json(post);
  //   } catch (error) {
  //     console.error('Error while updating post', error.message);
  //     res.status(500).json({
  //       message: 'Error while updating post',
  //       error: error.message,
  //     });
  //   }
  // },

  // deletePost: async (req, res) => {
  //   try {
  //     const post = await Post.findByPk(req.params.id);
  //     if (!post) {
  //       return res.status(404).send({ message: 'Post not found' });
  //     }
  //     await post.destroy();
  //     res.status(204).send();
  //   } catch (error) {
  //     console.error('Error while deleting post', error.message);
  //     res.status(500).json({
  //       message: 'Error while deleting post',
  //       error: error.message,
  //     });
  //   }
  // },
};

export default postController;
