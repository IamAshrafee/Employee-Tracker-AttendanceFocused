import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/User.js";
import { LoginHistory } from "../models/LoginHistory.js";
import { config } from "../config/index.js";

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { email, password, name, role, teamId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || "employee",
      teamId: teamId || null,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Login user with device tracking
 */
export const login = async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is locked
    if (user.status === "locked") {
      return res.status(403).json({
        message: "Account is locked. Please contact your team leader.",
        lockReason: user.lockReason,
      });
    }

    // Generate new device ID
    const newDeviceId = uuidv4();

    // If user is logged in on another device, log it out
    if (user.deviceId && user.deviceId !== newDeviceId) {
      await LoginHistory.create({
        userId: user._id,
        action: "force_logout",
        deviceId: user.deviceId,
        deviceInfo: "Forced logout due to new login",
        timestamp: new Date(),
      });
    }

    // Update user's device ID
    user.deviceId = newDeviceId;
    await user.save();

    // Log this login
    await LoginHistory.create({
      userId: user._id,
      action: "login",
      deviceId: newDeviceId,
      deviceInfo: deviceInfo || "Unknown device",
      ipAddress: req.ip,
      timestamp: new Date(),
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        deviceId: newDeviceId,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpire },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.teamId,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deviceId = req.user.deviceId;

    // Clear device ID
    await User.findByIdAndUpdate(userId, { deviceId: null });

    // Log this logout
    await LoginHistory.create({
      userId,
      action: "logout",
      deviceId,
      timestamp: new Date(),
    });

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "teamId",
      "name",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        team: user.teamId,
        status: user.status,
        lockReason: user.lockReason,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
