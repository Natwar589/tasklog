import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Entry } from "@/lib/models/Entry";
import { verifyToken } from "@/lib/auth";

const formatEntry = (doc: any) => ({
  id: doc._id.toString(),
  user_id: doc.user_id?.toString(),
  entry_date: doc.entry_date,
  title: doc.title || "",
  content: doc.content || "",
  mood: doc.mood || "",
  tags: doc.tags || [],
  is_private: doc.is_private ?? true,
  time_logs: doc.time_logs
    ? doc.time_logs.map((tl: any) => ({
        id: tl._id?.toString() || tl.id,
        start_time: tl.start_time,
        end_time: tl.end_time,
        activity: tl.activity,
        description: tl.description || "",
        category: tl.category || "Coding",
        priority: tl.priority || null,
        energy_level: tl.energy_level || "",
        outcome: tl.outcome || "",
        tags: tl.tags || [],
        recurrence: tl.recurrence || null,
        subtasks: tl.subtasks
          ? tl.subtasks.map((st: any) => ({
              id: st.id || st._id?.toString(),
              text: st.text,
              done: !!st.done,
            }))
          : [],
      }))
    : [],
  gratitude: doc.gratitude || [],
  created_at: doc.created_at,
  updated_at: doc.updated_at,
});

// GET /api/entries/date/[date]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { id: userId } = verifyToken(req);
    const { date } = await params;

    await connectDB();
    const doc = await Entry.findOne({ user_id: userId, entry_date: date });
    return NextResponse.json(doc ? formatEntry(doc) : null);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch entry by date";
    const status = message.includes("Access denied") || message.includes("expired") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
