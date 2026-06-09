import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
console.log("MONGO_URI", MONGO_URI);

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
