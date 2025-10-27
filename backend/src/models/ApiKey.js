// src/models/ApiKey.js

const mongoose = require("mongoose");

const rotationHistorySchema = new mongoose.Schema({
  encryptedKey: { type: String, required: true },
  rotatedAt: { type: Date, default: Date.now }
});

const apiKeySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  service: { type: String, required: true, trim: true },
  encryptedKey: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, default: null },
  rotationHistory: [rotationHistorySchema], // keeps previous keys
  revoked: { type: Boolean, default: false }, // NEW: track revoked keys
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ApiKey", apiKeySchema);
