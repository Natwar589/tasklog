import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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

// GET /api/entries — list all entries for authenticated user
export async function GET(req: NextRequest) {
  try {
    const { id: userId } = verifyToken(req);
    await connectDB();
    const docs = await Entry.find({ user_id: userId }).sort({ entry_date: -1 });
    return NextResponse.json(docs.map(formatEntry));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch entries";
    const status = message.includes("Access denied") || message.includes("expired") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// POST /api/entries — create or update an entry (upsert)
export async function POST(req: NextRequest) {
  try {
    const { id: userId } = verifyToken(req);
    await connectDB();

    const { id, entry_date, title, content, mood, tags, is_private, time_logs, gratitude } =
      await req.json();

    if (!entry_date) {
      return NextResponse.json({ error: "entry_date is required" }, { status: 400 });
    }

    const isExistingId = id && mongoose.Types.ObjectId.isValid(id);
    let doc;

    if (isExistingId) {
      doc = await Entry.findOneAndUpdate(
        { _id: id, user_id: userId },
        { title, content, mood, tags, is_private, entry_date, time_logs: time_logs || [], gratitude: gratitude || [] },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      doc = await Entry.findOneAndUpdate(
        { user_id: userId, entry_date },
        { title, content, mood, tags, is_private, time_logs: time_logs || [], gratitude: gratitude || [] },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }

    return NextResponse.json(formatEntry(doc));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save entry";
    const status = message.includes("Access denied") || message.includes("expired") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
