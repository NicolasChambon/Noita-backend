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
};

export default concertController;
