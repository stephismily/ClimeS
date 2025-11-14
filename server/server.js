import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import authRoutes from "./auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to DB first
connectDB().then(() => {
  console.log("📡 Starting server...");
  app.listen(process.env.PORT, () =>
    console.log(`🚀 Server running on port ${process.env.PORT}`)
  );
});

// Register API routes
app.use("/auth", authRoutes);
