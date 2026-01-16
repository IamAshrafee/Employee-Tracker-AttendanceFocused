import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { connectDB } from "./config/database.js";
import { initCronJobs } from "./jobs/cronJobs.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import leaderRoutes from "./routes/leaderRoutes.js";

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize scheduled jobs
initCronJobs();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/leader", leaderRoutes);

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
