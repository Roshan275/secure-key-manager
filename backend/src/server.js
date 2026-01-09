const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const testUserRoutes = require("./routes/testUserRoutes.js");
const apiKeyRoutes = require("./routes/apiKeyRoutes.js");
const authRoutes = require("./routes/authRoutes.js");

const app = express();

app.use(cors());

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

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();



// 404 handler
/*
// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Simple test route
app.post("/api/simple-test", (req, res) => {
  console.log("Simple test route hit!");
  res.json({ 
    message: "Simple test route works!",
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Secure API Key Management System Backend is Running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
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
*/

