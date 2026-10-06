import mongoose from "mongoose";

export const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not configured.");
    }

    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"));

        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error;
    }
};