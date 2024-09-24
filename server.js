import connectDB from './database.js';
import { app } from './app.js';

const { PORT = 3000 } = process.env;

// connect to the database
connectDB();

// start the server
app.listen(PORT, () => {
  console.log(`Server running. Use our API on port: ${PORT}`);
});

