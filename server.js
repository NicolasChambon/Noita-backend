import 'dotenv/config';
import { createServer } from 'http';
import app from './app/index.app.js';

const httpServer = createServer(app);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
