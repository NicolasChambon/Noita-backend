import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';

import sequelize from './config/database.js';

import router from './routers/indexRouter.js';

const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

app.use(express.json({ limit: '10mb', extended: true }));

app.use(
  cors({
    origin: ['https://noita.ch', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Establish database connection
// ()() syntax is used to call the asynchronous function directly after defining it
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw new Error('Unable to connect to the database');
  }
})();

app.use(router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
