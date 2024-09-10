import jwt from 'jsonwebtoken';
import dotenv from 'dotenv/config';

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const tokenUserId = decodedToken.id;

    if (parseInt(req.query.user_id) !== tokenUserId) {
      console.log('Invalid user ID');
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch (error) {
    console.error('Error while checking user', error.errors);
    res.status(401).json({
      errors: ['User not authenticated'],
      status: 401,
    });
  }
};
