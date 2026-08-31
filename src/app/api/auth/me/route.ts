import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const payload = verifyToken(req);

    await connectDB();

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication error.";
    const status = message.includes("Access denied") || message.includes("invalid") || message.includes("expired") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
