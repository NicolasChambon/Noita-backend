const concertFormValidation = (req) => {
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
  return errorMessages;
};

export default concertFormValidation;
