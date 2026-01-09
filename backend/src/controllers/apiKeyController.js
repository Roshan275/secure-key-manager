const ApiKey = require("../models/ApiKey");
const User = require("../models/User");
const { encrypt, decrypt } = require("../config/encryption");
const { logAction } = require("./auditController");

// add new api key
const handleAddKey = async (req, res) => {
  try {
    const { name, service, key, expiresAt } = req.body;
    const userId = req.user.id;

    if (!name || !service || !key)
      return res.status(400).json({ message: "All fields are required" });

    const apiKey = new ApiKey({
      name,
      service,
      encryptedKey: encrypt(key),
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
};

//get active keys
const handleGetKeys = async (req, res) => {
  try {
    const now = new Date();
    const baseQuery = {
      revoked: false,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    const keys =
      req.user.role === "admin"
        ? await ApiKey.find(baseQuery).lean().select("-encryptedKey")
        : await ApiKey.find({ ...baseQuery, userId: req.user.id })
            .lean()
            .select("-encryptedKey");

    res.json({ ok: true, keys });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// decrypt keys
const handleDecryptKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
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

    await logAction(req.user.id, "VIEW_KEY", { keyId: apiKey._id });
    res.json({ ok: true, decryptedKey: decrypt(apiKey.encryptedKey) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// delete keys
const handleDeleteKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    if (!apiKey) return res.status(404).json({ message: "API Key not found" });

    if (
      apiKey.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await apiKey.deleteOne();
    await logAction(req.user.id, "DELETE_KEY", { keyId: apiKey._id });

    res.json({ ok: true, message: "Key deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//rotate key
const handleRotateKey = async (req, res) => {
  try {
    const { newKey, expiresAt } = req.body;
    const apiKey = await ApiKey.findById(req.params.id);
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
    await logAction(req.user.id, "ROTATE_KEY", { keyId: apiKey._id });

    res.json({ ok: true, apiKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//revoke key
const handleRevokeKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id);
    if (!apiKey) return res.status(404).json({ message: "API Key not found" });

    if (
      apiKey.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    apiKey.revoked = true;
    await apiKey.save();
    await logAction(req.user.id, "REVOKE_KEY", { keyId: apiKey._id });

    res.json({ ok: true, message: "Key revoked successfully", apiKey });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// history
const handleKeyHistory = async (req, res) => {
  try {
    const apiKey = await ApiKey.findById(req.params.id).lean();
    if (!apiKey) return res.status(404).json({ message: "API Key not found" });

    if (
      apiKey.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({
      ok: true,
      keyName: apiKey.name,
      service: apiKey.service,
      rotationHistory: apiKey.rotationHistory.map((h) => ({
        rotatedAt: h.rotatedAt,
        decryptedKey: decrypt(h.encryptedKey),
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET filtered API keys for logged-in user
const handleUserSearchKeys = async (req, res) => {
  try {
    const { service, name } = req.query;
    const userId = req.user.id;
    const now = new Date();

    const query = {
      userId,
      revoked: false,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    if (service) query.service = { $regex: service, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };

    const keys = await ApiKey.find(query).lean().select("-encryptedKey");
    res.json({ ok: true, keys });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  handleAddKey,
  handleGetKeys,
  handleDecryptKey,
  handleDeleteKey,
  handleRotateKey,
  handleRevokeKey,
  handleKeyHistory,
  handleUserSearchKeys,
};
