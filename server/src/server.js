import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Employee Tracker API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: config.nodeEnv === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;
