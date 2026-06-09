import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dailylog-secret-key-change-in-prod";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No authorization token provided." });
    }

    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email?: string };
      req.user = {
        id: decoded.id,
        email: decoded.email,
      };
      next();
    } catch (err) {
      return res.status(401).json({ error: "Session invalid or expired." });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Authentication server error." });
  }
}
