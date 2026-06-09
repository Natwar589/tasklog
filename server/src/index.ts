import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import entryRoutes from "./routes/entryRoutes";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: "*", // Adjust for specific client URLs in production
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body parsing middlewares
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/entries", entryRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Start listening
app.listen(PORT, () => {
  console.log(`DailyLog API server is running on http://localhost:${PORT}`);
});
