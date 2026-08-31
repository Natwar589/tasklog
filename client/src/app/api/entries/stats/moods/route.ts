import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Entry } from "@/lib/models/Entry";
import { verifyToken } from "@/lib/auth";

// GET /api/entries/stats/moods
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = verifyToken(req);
    await connectDB();

    const entriesList = await Entry.find({ user_id: userId }).select("mood");

    const distribution: Record<string, number> = {
      amazing: 0,
      happy: 0,
      grateful: 0,
      okay: 0,
      tired: 0,
      anxious: 0,
      sad: 0,
      angry: 0,
    };

    let count = 0;
    entriesList.forEach((e: { mood?: string }) => {

      if (e.mood && e.mood in distribution) {
        distribution[e.mood]++;
        count++;
      }
    });

    return NextResponse.json({
      distribution,
      totalMoodsCount: count,
      totalEntries: entriesList.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to compile mood stats";
    const status = message.includes("Access denied") || message.includes("expired") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
