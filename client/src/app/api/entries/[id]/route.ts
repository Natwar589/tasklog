import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Entry } from "@/lib/models/Entry";
import { verifyToken } from "@/lib/auth";

// DELETE /api/entries/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = verifyToken(req);
    const { id } = await params;

    await connectDB();

    const isValidObjectId = id && mongoose.Types.ObjectId.isValid(id);
    let deleted = false;

    if (isValidObjectId) {
      const result = await Entry.deleteOne({ _id: id, user_id: userId });
      deleted = result.deletedCount > 0;
    } else {
      const result = await Entry.deleteOne({ id, user_id: userId });
      deleted = result.deletedCount > 0;
    }

    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete entry";
    const status = message.includes("Access denied") || message.includes("expired") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
