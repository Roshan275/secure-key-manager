// src/routes/testUser.js
const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware"); // use your auth middleware
const router = express.Router();

// GET current logged-in user
router.get("/me", protect(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a user
router.post("/create", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ ok: true, user });
  } catch (err) {
    console.error(err);
    if (err.code === 11000)
      return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// READ all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().lean().select("-password");
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE user by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ ok: true, deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
