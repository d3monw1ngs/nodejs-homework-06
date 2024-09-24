import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST } = process.env;

const connectDB = async () => {
    try {
        await mongoose.connect(DB_HOST);
        console.log('Database connection successful');
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;