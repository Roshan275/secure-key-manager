//backend/src/server.js

const dotenv = require("dotenv");
dotenv.config();   // must be first

const express = require("express");
const cors = require("cors"); // Add CORS
const connectDB = require("./config/db.js");
const testUserRoutes = require("./routes/testUser.js");
const apiKeyRoutes = require("./routes/ApiKey.js");
const authRoutes = require("./routes/auth.js");

const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    "http://localhost:5173", // Vite dev server
    "http://localhost:3000", // Alternative dev port
    "https://secure-key-manager.vercel.app", // Your Vercel domain (update after deploy)
    "https://*.vercel.app" // All Vercel subdomains
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Security middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/test-user", testUserRoutes);
app.use("/api/api-key", apiKeyRoutes);
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Secure API Key Management System Backend is Running 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();