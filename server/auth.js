import express from "express";
import jwt from "jsonwebtoken";
import { User } from "./userModel.js";

const router = express.Router();

// Generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// =============================
//     USER SIGNUP
// =============================
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.json({ success: false, message: "All fields required" });

  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const result = await User.create({
      name,
      email,
      password, // plain text password (your request)
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      message: "User registered successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =============================
//     USER LOGIN
// =============================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.json({ success: false, message: "Email & password required" });

  try {
    const user = await User.findByEmail(email);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Password check (plain text)
    if (user.password !== password) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// For testing
router.get("/users", async (req, res) => {
  const users = await User.getAll();
  res.json(users);
});

export default router;
