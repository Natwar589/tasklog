import { Response } from "express";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middleware/auth";
import { Entry } from "../models/Entry";

const formatEntry = (doc: any) => ({
  id: doc._id.toString(),
  user_id: doc.user_id?.toString(),
  entry_date: doc.entry_date,
  title: doc.title,
  content: doc.content,
  mood: doc.mood,
  tags: doc.tags,
  is_private: doc.is_private,
  time_logs: doc.time_logs ? doc.time_logs.map((tl: any) => ({
    id: tl._id?.toString(),
    start_time: tl.start_time,
    end_time: tl.end_time,
    activity: tl.activity,
    category: tl.category
  })) : [],
  created_at: doc.created_at,
  updated_at: doc.updated_at,
});

export const entryController = {
  async getEntries(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const docs = await Entry.find({ user_id: userId }).sort({ entry_date: -1 });
      res.json(docs.map(formatEntry));
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch entries" });
    }
  },

  async getEntryByDate(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    const { date } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const doc = await Entry.findOne({ user_id: userId, entry_date: date });
      res.json(doc ? formatEntry(doc) : null);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch entry by date" });
    }
  },

  async saveEntry(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id, entry_date, title, content, mood, tags, is_private, time_logs } = req.body;
    if (!entry_date) {
      return res.status(400).json({ error: "entry_date is required" });
    }

    try {
      let doc;
      const isExistingId = id && mongoose.Types.ObjectId.isValid(id);

      if (isExistingId) {
        doc = await Entry.findOneAndUpdate(
          { _id: id, user_id: userId },
          { title, content, mood, tags, is_private, entry_date, time_logs },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      } else {
        doc = await Entry.findOneAndUpdate(
          { user_id: userId, entry_date },
          { title, content, mood, tags, is_private, time_logs },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      }
      res.json(formatEntry(doc));
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to save entry" });
    }
  },

  async deleteEntry(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const isExistingId = id && mongoose.Types.ObjectId.isValid(id);
      let deleted = false;

      if (isExistingId) {
        const result = await Entry.deleteOne({ _id: id, user_id: userId });
        deleted = result.deletedCount > 0;
      } else {
        const result = await Entry.deleteOne({ id, user_id: userId });
        deleted = result.deletedCount > 0;
      }
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete entry" });
    }
  },

  async getStreak(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
      const entriesList = await Entry.find({ user_id: userId }).select("entry_date").sort({ entry_date: -1 });

      if (entriesList.length === 0) {
        return res.json({ currentStreak: 0, longestStreak: 0 });
      }

      const dates = Array.from(new Set(entriesList.map((e) => e.entry_date)))
        .sort((a, b) => b.localeCompare(a));

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
          const diffTime = Math.abs(prevDate.getTime() - currDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
      res.json({ currentStreak, longestStreak });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to calculate streaks" });
    }
  },

  async getMoodStats(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
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
      entriesList.forEach((e) => {
        if (e.mood && e.mood in distribution) {
          distribution[e.mood]++;
          count++;
        }
      });

      res.json({
        distribution,
        totalMoodsCount: count,
        totalEntries: entriesList.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to compile mood stats" });
    }
  },
};
