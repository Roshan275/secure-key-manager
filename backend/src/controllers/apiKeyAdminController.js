const ApiKey = require("../models/ApiKey");
const User = require("../models/User");
const { decrypt } = require("../config/encryption");
const { logAction } = require("./auditController");
const { Parser } = require("json2csv");

//export csv file
const handleExportKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find().populate("userId", "name email").lean();

    const rows = keys.map((key) => ({
      user: key.userId?.name || "Unknown",
      email: key.userId?.email || "",
      name: key.name,
      service: key.service,
      key: decrypt(key.encryptedKey),
      expiresAt: key.expiresAt ? key.expiresAt.toISOString() : "N/A",
      revoked: key.revoked,
    }));

    const csv = new Parser().parse(rows);
    await logAction(req.user.id, "EXPORT_KEYS", { count: rows.length });

    res.header("Content-Type", "text/csv");
    res.attachment("api_keys_export.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//audit logs
const handleAuditLogs = async (req, res) => {
  try {
    const logs = await require("../models/AuditLog")
      .find()
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .limit(100);

    res.json({ ok: true, logs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// all users and their keys
const handleAllUsersKeys = async (req, res) => {
  try {
    const users = await User.find().lean().select("-password");
    const now = new Date();

    const result = await Promise.all(
      users.map(async (u) => {
        const keys = await ApiKey.find({
          userId: u._id,
          revoked: false,
          $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
        }).lean().select("-encryptedKey");

        return { ...u, apiKeys: keys };
      })
    );

    res.json({ ok: true, users: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// expired or revoked keys
const handleExpiredKeys = async (req, res) => {
  try {
    const now = new Date();
    const keys = await ApiKey.find({
      $or: [{ revoked: true }, { expiresAt: { $lte: now } }],
    })
      .lean()
      .select("-encryptedKey");

    res.json({ ok: true, keys });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// admin search function
const handleAdminSearch = async (req, res) => {
  try {
    const { service, name, userNameOrEmail } = req.query;
    const now = new Date();

    const query = {
      revoked: false,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    };

    if (service) query.service = { $regex: service, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };

    if (userNameOrEmail) {
      const user = await User.findOne({
        $or: [
          { name: { $regex: userNameOrEmail, $options: "i" } },
          { email: { $regex: userNameOrEmail, $options: "i" } },
        ],
      });
      query.userId = user ? user._id : null;
    }

    const keys = await ApiKey.find(query).lean().select("-encryptedKey");
    res.json({ ok: true, keys });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all users
const handleGetAdminUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id name email").lean();
    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  handleExportKeys,
  handleAuditLogs,
  handleAllUsersKeys,
  handleExpiredKeys,
  handleAdminSearch,
  handleGetAdminUsers,
};
