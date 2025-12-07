import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export async function connectDB() {
  try {
    await client.connect();
    db = client.db("weather_project");
    console.log("✅ MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not connected yet!");
  }
  return db;
}

export default connectDB;
