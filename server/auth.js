import express from "express";
import { User } from "./userModel.js";

const router = express.Router();

// REGISTER USER
router.post("/register", async (req, res) => {
  const { name, email } = req.body;

  try {
    // Check if user already exists
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Create new user
    const result = await User.create({ name, email });

    res.json({ success: true, userId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET USERS (test purpose)
router.get("/users", async (req, res) => {
  const users = await User.getAll();
  res.json(users);
});

export default router;
