const express = require("express");
const protect = require("../middleware/authMiddleware");
const { handleMe, handleCreate, handleGetAll, handleDelete } = require("../controllers/testController");

const router = express.Router();

router.get("/me", protect(), handleMe);
router.post("/create", handleCreate);
router.get("/", handleGetAll);
router.delete("/:id", handleDelete);

module.exports = router;
