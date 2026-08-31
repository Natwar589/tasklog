import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Entry } from "@/lib/models/Entry";
import { verifyToken } from "@/lib/auth";

// GET /api/entries/stats/streak
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = verifyToken(req);
    await connectDB();

    const entriesList = await Entry.find({ user_id: userId })
      .select("entry_date")
      .sort({ entry_date: -1 });

    if (entriesList.length === 0) {
      return NextResponse.json({ currentStreak: 0, longestStreak: 0 });
    }

    const dateSet: Set<string> = new Set(entriesList.map((e: { entry_date: string }) => e.entry_date));
    const dates: string[] = Array.from(dateSet).sort((a: string, b: string) =>
      b.localeCompare(a)
    );


    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const hasWrittenRecently = dates.includes(todayStr) || dates.includes(yesterdayStr);

    if (hasWrittenRecently) {
      let targetDate = dates.includes(todayStr) ? new Date() : yesterday;
      while (true) {
        const targetStr = targetDate.toISOString().split("T")[0];
        if (dates.includes(targetStr)) {
          currentStreak++;
          targetDate.setDate(targetDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    if (dates.length > 0) {
      let prevDate = new Date(dates[0]);
      tempStreak = 1;
      longestStreak = 1;

      for (let i = 1; i < dates.length; i++) {
        const currDate = new Date(dates[i]);
        const diffDays = Math.ceil(
          Math.abs(prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        prevDate = currDate;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    return NextResponse.json({ currentStreak, longestStreak });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to calculate streaks";
    const status = message.includes("Access denied") || message.includes("expired") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
