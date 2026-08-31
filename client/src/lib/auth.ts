import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dailylog-secret-key-change-in-prod";

export interface JwtPayload {
  id: string;
  email?: string;
}

/**
 * Extracts and verifies the Bearer JWT from the Authorization header.
 * Throws an error if the token is missing or invalid.
 */
export function verifyToken(req: NextRequest): JwtPayload {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Access denied. No authorization token provided.");
  }

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    throw new Error("Session invalid or expired.");
  }
}

/**
 * Signs a new JWT for the given user.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}
