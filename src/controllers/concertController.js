// Models
import Concert from '../models/concert.js';

// Utils
import concertFormValidation from '../utils/validations/concertFormValidation.js';

const concertController = {
  getAllConcerts: async (req, res) => {
    try {
      // Find all concerts sorted by event date
      const concerts = await Concert.findAll({
        order: [['event_date', 'DESC']],
      });
      if (!concerts) {
        return res.status(404).send({ message: 'No concert found' });
      }
      res.status(200).json(concerts);
    } catch (error) {
      console.error('Error while getting concerts', error.message);
      res.status(500).json({
        message: 'Error while getting concerts',
        error: error.message,
      });
    }
  },

  getConcert: async (req, res) => {
    try {
      const concert = await Concert.findByPk(req.params.id);
      if (!concert) {
        return res.status(404).send({ message: 'Concert not found' });
      }
      res.status(200).json(concert);
    } catch (error) {
      console.error('Error while getting concert', error.message);
      res.status(500).json({
        message: 'Error while getting concert',
        error: error.message,
      });
    }
  },

  createConcert: async (req, res) => {
    // Validate request
    const errorMessages = concertFormValidation(req);
    if (errorMessages.length > 0) {
      return res.status(400).json({ errors: errorMessages });
    }

    try {
      const concert = await Concert.create({
        city: req.body.city,
        event_date: req.body.eventDate,
        venue: req.body.venue,
        event_name: req.body.eventName,
        event_url: req.body.link,
      });
      res.status(201).json(concert);
    } catch (error) {
      console.error('Error while creating concert', error.message);
      res.status(500).json({
        message: 'Error while creating concert',
        error: error.message,
      });
    }
  },

  updateConcert: async (req, res) => {
    // Validate request
    const errorMessages = concertFormValidation(req);
    if (errorMessages.length > 0) {
      return res.status(400).json({ errors: errorMessages });
    }

    try {
      const concert = await Concert.findByPk(req.params.id);
      if (!concert) {
        return res.status(404).send({ message: 'Concert not found' });
      }
      concert.city = req.body.city;
      concert.event_date = req.body.eventDate;
      concert.venue = req.body.venue;
      concert.event_name = req.body.eventName;
      concert.event_url = req.body.link;
      await concert.save();
      res.status(200).json(concert);
    } catch (error) {
      console.error('Error while updating concert', error.message);
      res.status(500).json({
        message: 'Error while updating concert',
        error: error.message,
      });
    }
  },

  deleteConcert: async (req, res) => {
    try {
      const concert = await Concert.findByPk(req.params.id);
      if (!concert) {
        return res.status(404).send({ message: 'Concert not found' });
      }
      await concert.destroy();
      res.status(200).send({ message: 'Concert deleted successfully' });
    } catch (error) {
      console.error('Error while deleting concert', error.message);
      res.status(500).json({
        message: 'Error while deleting concert',
        error: error.message,
      });
    }
  },
};

export default concertController;
