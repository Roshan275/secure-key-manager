// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_prod";

/**
 * protect(requiredRoles = []) - middleware factory
 * requiredRoles: optional array of roles e.g. ['admin']
 */
function protect(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No authorization header" });

    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ message: "Invalid authorization header format" });

    const token = parts[1];

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload; // { id, role, iat, exp }

      if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
        console.log("Access denied. Required roles:", requiredRoles, "User role:", req.user.role);
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

module.exports = protect;
