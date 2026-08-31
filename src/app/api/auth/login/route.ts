import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    const token = signToken({ id: user._id.toString(), email: user.email });

    return NextResponse.json({
      user: { id: user._id.toString(), email: user.email, name: user.name },
      token,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to login.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
