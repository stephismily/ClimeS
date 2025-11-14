import { getDB } from "./db.js";

export const User = {
  // INSERT a new user
  async create(data) {
    const db = getDB();
    return await db.collection("users").insertOne(data);
  },

  // FIND user by email
  async findByEmail(email) {
    const db = getDB();
    return await db.collection("users").findOne({ email });
  },

  // GET all users (optional)
  async getAll() {
    const db = getDB();
    return await db.collection("users").find().toArray();
  },
};
