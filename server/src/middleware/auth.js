import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { config } from "../config/index.js";

/**
 * Protect routes - verify JWT token and device
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Check if user is locked
    if (user.status === "locked") {
      return res.status(403).json({
        message: "Account is locked",
        lockReason: user.lockReason,
      });
    }

    // Verify device ID matches (single device login enforcement)
    if (user.deviceId !== decoded.deviceId) {
      return res.status(401).json({
        message: "Session expired. You have been logged in on another device.",
        forceLogout: true,
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      deviceId: decoded.deviceId,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/**
 * Restrict to specific roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
