import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const { connection } = await mongoose.connect("mongodb://localhost:27017/admin");
        console.log(`MongoDB connected: ${connection.host}`);
    } catch ({ message }) {
        console.error(`Error: ${message}`);
        
    }
};

export default connectDB; 