//backend/src/server.js

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const testUserRoutes = require("./routes/testUser.js");
const apiKeyRoutes = require("./routes/ApiKey.js");
const authRoutes = require("./routes/auth.js");

const app = express();

// ✅ TEMPORARY FIX - Allow ALL origins during development
app.use(cors({
  origin: "*", // Allow ALL origins - remove this in production
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// ✅ FIXED: Handle preflight OPTIONS requests for ALL routes
app.options('/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.sendStatus(200);
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl}`);
  next();
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

// Debug: Test if authRoutes is loaded
console.log("🔄 Loading routes...");
console.log("🔍 authRoutes:", typeof authRoutes);

// Routes
app.use("/api/test-user", testUserRoutes);
app.use("/api/api-key", apiKeyRoutes);
app.use("/api/auth", authRoutes);

// Test route to verify routing works
app.post("/api/simple-test", (req, res) => {
  console.log("✅ Simple test route hit!");
  res.json({ 
    message: "Simple test route works!",
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Secure API Key Management System Backend is Running 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    routes: ["/api/auth/register", "/api/auth/login", "/api/simple-test"]
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
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
      console.log(`🔗 Test routes:`);
      console.log(`   - GET  http://localhost:${PORT}/health`);
      console.log(`   - POST http://localhost:${PORT}/api/simple-test`);
      console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();