import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "dailylog-secret-key-change-in-prod";

export const authController = {
  async register(req: Request, res: Response) {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required." });
    }

    try {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists." });
      }

      // Create new user
      const user = new User({ email, password, name });
      await user.save();

      // Generate token
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: "30d",
      });

      res.status(201).json({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to register user." });
    }
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    try {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password." });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password." });
      }

      // Generate token
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: "30d",
      });

      res.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to login." });
    }
  },

  async me(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      res.json({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch user profile." });
    }
  },
};
