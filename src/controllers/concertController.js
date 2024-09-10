import Concert from '../models/concert.js';

const concertController = {
  getAllConcerts: async (req, res) => {
    try {
      const concerts = await Concert.findAll();
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

  createConcert: async (req, res) => {
    // Validate request
    const errorMessages = [];
    if (!req.body.city) {
      errorMessages.push('City is required.');
    }
    if (!req.body.eventDate) {
      errorMessages.push('Event date is required.');
    }
    if (!req.body.venue && !req.body.eventName) {
      errorMessages.push('Venue or event name is required.');
    }
    if (!req.body.link) {
      errorMessages.push('Link is required.');
    }
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
};

export default concertController;
