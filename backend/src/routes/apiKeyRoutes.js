const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  handleAddKey,
  handleGetKeys,
  handleDecryptKey,
  handleDeleteKey,
  handleRotateKey,
  handleRevokeKey,
  handleKeyHistory,
  handleUserSearchKeys,
} = require("../controllers/apiKeyController");
const {
  handleExportKeys,
  handleAuditLogs,
  handleAllUsersKeys,
  handleExpiredKeys,
  handleAdminSearch,
  handleGetAdminUsers, 
} = require("../controllers/apiKeyAdminController");
const router = express.Router();



/* -------- USER ROUTES -------- */
router.post("/add", protect(), handleAddKey);
router.get("/", protect(), handleGetKeys);
router.get("/decrypt/:id", protect(), handleDecryptKey);
router.delete("/:id", protect(), handleDeleteKey);
router.put("/rotate/:id", protect(), handleRotateKey);
router.put("/revoke/:id", protect(), handleRevokeKey);
router.get("/history/:id", protect(), handleKeyHistory);
router.get("/search", protect(), handleUserSearchKeys);

/* -------- ADMIN ROUTES -------- */
router.get("/admin/export", protect(["admin"]), handleExportKeys);
router.get("/admin/audit-logs", protect(["admin"]), handleAuditLogs);
router.get("/all-users", protect(["admin"]), handleAllUsersKeys);
router.get("/expired", protect(["admin"]), handleExpiredKeys);
router.get("/admin/search", protect(["admin"]), handleAdminSearch);
router.get("/admin/users", protect(["admin"]), handleGetAdminUsers);

module.exports = router;
