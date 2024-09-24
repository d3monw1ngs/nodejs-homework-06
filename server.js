import mongoose from 'mongoose';
import { app } from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, PORT = 3000 } = process.env;

// connect to the database
mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => 
      console.log(`Server running. Use our API on port: ${PORT}`)
  );
  console.log('Database connect successful');
})
.catch((error) => {
  console.log(`Server not running. Error message: ${error.message}`);
  process.exit(1);
});



