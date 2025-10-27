// src/routes/ApiKey.js

const express = require("express");
const ApiKey = require("../models/ApiKey");
const User = require("../models/User");
const { encrypt, decrypt } = require("../config/encryption");
const protect = require("../middleware/authMiddleware");
const AuditLog = require("../models/AuditLog"); // NEW MODEL for logging
const { Parser } = require("json2csv"); // for CSV export

const router = express.Router();

/* -------------------------- AUDIT LOG FUNCTION -------------------------- */
async function logAction(userId, action, details) {
  try {
    await AuditLog.create({ userId, action, details, timestamp: new Date() });
  } catch (err) {
    console.error("Failed to log action:", err.message);
  }
}


/* ---------------------------- ADD NEW API KEY ---------------------------- */
router.post("/add", protect(), async (req, res) => {
  try {
    const { name, service, key, expiresAt } = req.body;
    const userId = req.user.id;

    if (!name || !service || !key)
      return res.status(400).json({ message: "All fields are required" });

    const encryptedKey = encrypt(key);
    const apiKey = new ApiKey({
      name,
      service,
      encryptedKey,
      userId,
      expiresAt,
      rotationHistory: [],
      revoked: false,
    });
    await apiKey.save();

    await logAction(userId, "CREATE_KEY", { name, service });

    res.status(201).json({ ok: true, apiKey });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* -------------------------- GET ALL ACTIVE KEYS -------------------------- */
router.get("/", protect(), async (req, res) => {
  try {
    const now = new Date();
    const query = {
      revoked: false,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    let keys;
    if (req.user.role === "admin") {
      keys = await ApiKey.find(query).lean().select("-encryptedKey");
    } else {
      keys = await ApiKey.find({ ...query, userId: req.user.id })
        .lean()
        .select("-encryptedKey");
    }

    res.json({ ok: true, keys });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* --------------------------- GET DECRYPTED KEY --------------------------- */
router.get("/decrypt/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findById(id);
    if (!apiKey) return res.status(404).json({ message: "API Key not found" });

    if (apiKey.revoked)
      return res.status(403).json({ message: "Key has been revoked" });
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) <= new Date())
      return res.status(403).json({ message: "Key has expired" });

    if (
      apiKey.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const decryptedKey = decrypt(apiKey.encryptedKey);
    await logAction(req.user.id, "VIEW_KEY", { keyId: id });

    res.json({ ok: true, decryptedKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------ DELETE KEY ------------------------------- */
router.delete("/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findById(id);
    if (!apiKey) return res.status(404).json({ message: "API Key not found" });

    if (
      apiKey.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await apiKey.deleteOne();
    await logAction(req.user.id, "DELETE_KEY", { keyId: id });

    res.json({ ok: true, message: "Key deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------ ROTATE KEY ------------------------------- */
router.put("/rotate/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const { newKey, expiresAt } = req.body;

    const apiKey = await ApiKey.findById(id);
    if (!apiKey) return res.status(404).json({ message: "API Key not found" });

    if (apiKey.revoked)
      return res.status(403).json({ message: "Key has been revoked" });
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) <= new Date())
      return res.status(403).json({ message: "Key has expired" });

    if (
      apiKey.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    apiKey.rotationHistory.push({
      encryptedKey: apiKey.encryptedKey,
      rotatedAt: new Date(),
    });

    apiKey.encryptedKey = encrypt(newKey);
    if (expiresAt) apiKey.expiresAt = expiresAt;
    await apiKey.save();

    await logAction(req.user.id, "ROTATE_KEY", { keyId: id });

    res.json({ ok: true, apiKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------ REVOKE KEY ------------------------------- */
router.put("/revoke/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findById(id);
    if (!apiKey) return res.status(404).json({ message: "API Key not found" });

    if (
      apiKey.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    apiKey.revoked = true;
    await apiKey.save();
    await logAction(req.user.id, "REVOKE_KEY", { keyId: id });

    res.json({ ok: true, message: "Key revoked successfully", apiKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------ EXPORT KEYS ------------------------------ */
// ADMIN ONLY — export decrypted keys as CSV
router.get("/admin/export", protect(["admin"]), async (req, res) => {
  try {
    const keys = await ApiKey.find().populate("userId", "name email").lean();

    const decryptedKeys = keys.map((key) => ({
      user: key.userId ? key.userId.name : "Unknown",
      email: key.userId ? key.userId.email : "",
      name: key.name,
      service: key.service,
      key: decrypt(key.encryptedKey),
      expiresAt: key.expiresAt ? key.expiresAt.toISOString() : "N/A",
      revoked: key.revoked,
    }));

    const parser = new Parser();
    const csv = parser.parse(decryptedKeys);

    await logAction(req.user.id, "EXPORT_KEYS", { count: decryptedKeys.length });

    res.header("Content-Type", "text/csv");
    res.attachment("api_keys_export.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------- AUDIT LOGS ------------------------------- */
router.get("/admin/audit-logs", protect(["admin"]), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .limit(100);
    res.json({ ok: true, logs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all users + their active keys (admin only)
router.get("/all-users", protect(["admin"]), async (req, res) => {
  try {
    const users = await User.find().lean().select("-password");
    const now = new Date();

    const result = await Promise.all(
      users.map(async (user) => {
        const keys = await ApiKey.find({
          userId: user._id,
          revoked: false,
          $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
        }).lean().select("-encryptedKey");
        return { ...user, apiKeys: keys };
      })
    );

    res.json({ ok: true, users: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET expired/revoked API keys (admin only)
router.get("/expired", protect(["admin"]), async (req, res) => {
  try {
    const now = new Date();
    const keys = await ApiKey.find({
      $or: [
        { revoked: true },
        { expiresAt: { $lte: now } }
      ]
    }).lean().select("-encryptedKey");

    res.json({ ok: true, keys });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET rotation history of a specific API key (owner or admin)
router.get("/history/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findById(id).lean();
    if (!apiKey) return res.status(404).json({ message: "API Key not found" });

    if (apiKey.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({ 
      ok: true, 
      keyName: apiKey.name,
      service: apiKey.service,
      rotationHistory: apiKey.rotationHistory.map(h => ({
        rotatedAt: h.rotatedAt,
        decryptedKey: decrypt(h.encryptedKey)
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET filtered API keys for logged-in user (protected)
router.get("/search", protect(), async (req, res) => {
  try {
    const { service, name } = req.query;
    const userId = req.user.id;
    const now = new Date();
    const query = { 
      userId, 
      revoked: false, 
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
    };
    if (service) query.service = { $regex: service, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };

    const keys = await ApiKey.find(query).lean().select("-encryptedKey");
    res.json({ ok: true, keys });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET filtered API keys for all users (admin only)
router.get("/admin/search", protect(["admin"]), async (req, res) => {
  try {
    const { service, name, userNameOrEmail } = req.query; // <-- new param
    const now = new Date();

    const query = {
      revoked: false,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    if (service) query.service = { $regex: service, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };

    if (userNameOrEmail) {
      // Find user by name or email
      const user = await User.findOne({
        $or: [
          { name: { $regex: userNameOrEmail, $options: "i" } },
          { email: { $regex: userNameOrEmail, $options: "i" } },
        ],
      });

      if (user) query.userId = user._id;
      else query.userId = null; // ensures no keys returned if user not found
    }

    const keys = await ApiKey.find(query).lean().select("-encryptedKey");
    res.json({ ok: true, keys });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all users (admin only)
router.get("/admin/users", protect(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("_id name email").lean();
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
