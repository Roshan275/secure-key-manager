// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_prod";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    // Check duplicate
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    // Create user - User model has pre-save hook to hash password
    const user = new User({ name, email, password, role });
    await user.save();

    // Create token payload
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // send back token and safe user info
    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
    return res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === 11000) return res.status(409).json({ message: "Email already exists" });
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // compare password (User.password is hashed)
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { register, login };
