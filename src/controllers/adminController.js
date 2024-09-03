import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import Admin from '../models/admin.js';

const adminController = {
  login: async (req, res) => {
    // Validate request
    const errorMessages = [];
    if (!req.body.username) {
      errorMessages.push('Username is required.');
    }

    if (!req.body.password) {
      errorMessages.push('Password is required.');
    }

    if (errorMessages.length > 0) {
      return res.status(400).json({ errors: errorMessages });
    }

    try {
      // Check if the admin exists
      const admin = await Admin.findOne({
        where: {
          username: req.body.username,
        },
      });
      if (!admin) {
        return res
          .status(401)
          .json({ message: 'Invalid username or password.' });
      }

      // Check if the password is correct
      try {
        const valid = await bcrypt.compare(
          req.body.password,
          admin.password_hash
        );
        if (!valid) {
          return res
            .status(401)
            .json({ message: 'Invalid username or password.' });
        }
        res.status(200).json({
          message: 'Login successful.',
          admin: {
            id: admin.id,
            username: admin.username,
          },
          token: jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
            expiresIn: 60,
          }),
        });
      } catch (error) {
        console.error('Error while logging in.', error.message);
        res.status(500).json({
          message: 'Error while logging in.',
          error: error.message,
        });
      }
    } catch (error) {
      console.error('Error while logging in', error.message);
      res.status(500).json({
        message: 'Error while logging in.',
        error: error.message,
      });
    }
  },
};

export default adminController;
