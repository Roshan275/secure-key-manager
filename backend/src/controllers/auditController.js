const AuditLog = require("../models/AuditLog");

async function logAction(userId, action, details) {
  try {
    await AuditLog.create({
      userId,
      action,
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to log action:", err.message);
  }
}

module.exports = { logAction };
