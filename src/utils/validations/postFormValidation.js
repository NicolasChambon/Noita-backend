const postFormValidation = (req, type) => {
  const errorMessages = [];
  if (!req.body.titleFr) {
    errorMessages.push('French title is required.');
  }
  if (!req.body.titleDe) {
    errorMessages.push('German title is required.');
  }
  if (!req.body.contentFr) {
    errorMessages.push('French content is required.');
  }
  if (!req.body.contentDe) {
    errorMessages.push('German content is required.');
  }
  if (!req.body.img64 && type === 'create') {
    errorMessages.push('Image is required.');
  }
  if (errorMessages.length > 0) {
    return errorMessages;
  }
};

export default postFormValidation;
