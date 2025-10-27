// utils/auditLogger.js
import AuditLog from "../models/AuditLog.js";

export const logAction = async (userId, action, apiKeyId, details = "") => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      apiKey: apiKeyId,
      details,
    });
  } catch (err) {
    console.error("Failed to log audit action:", err.message);
  }
};
