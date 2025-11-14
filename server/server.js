import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db.js";
import authRoutes from "./auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Path fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the frontend from /public directory
app.use(express.static(path.join(__dirname, "../public")));

// Default route → intro.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/intro.html"));
});

// API routes
app.use("/auth", authRoutes);

// Start server after DB connects
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
