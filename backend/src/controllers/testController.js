const User = require("../models/User");

// get logged in user
const handleMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// create user
const handleCreate = async (req, res) => {
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
};

//get all users
const handleGetAll = async (req, res) => {
  try {
    const users = await User.find().lean().select("-password");
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//delete a user :id
const handleDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ ok: true, deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  handleMe,
  handleCreate,
  handleGetAll,
  handleDelete,
};
