
export interface TimeLog {
  id?: string;
  start_time: string;
  end_time: string;
  activity: string;
  category: string;
}

export interface DiaryEntry {
  id: string;
  user_id?: string;
  entry_date: string; // YYYY-MM-DD
  title: string;
  content: string;
  mood: "amazing" | "happy" | "okay" | "tired" | "sad" | "angry" | "anxious" | "grateful" | "";
  tags: string[];
  is_private: boolean;
  time_logs?: TimeLog[];
  created_at: string;
  updated_at: string;
}

export const MOODS = [
  { value: "amazing", emoji: "✨", label: "Amazing", color: "from-amber-200 to-yellow-400 text-amber-900" },
  { value: "happy", emoji: "🙂", label: "Happy", color: "from-orange-200 to-amber-300 text-orange-950" },
  { value: "grateful", emoji: "🙏", label: "Grateful", color: "from-pink-200 to-rose-300 text-rose-950" },
  { value: "okay", emoji: "😐", label: "Okay", color: "from-slate-100 to-zinc-300 text-zinc-900" },
  { value: "tired", emoji: "🥱", label: "Tired", color: "from-purple-200 to-indigo-300 text-indigo-950" },
  { value: "anxious", emoji: "😰", label: "Anxious", color: "from-teal-100 to-emerald-200 text-emerald-950" },
  { value: "sad", emoji: "😢", label: "Sad", color: "from-blue-200 to-sky-300 text-blue-950" },
  { value: "angry", emoji: "😡", label: "Angry", color: "from-red-200 to-rose-400 text-red-950" },
] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const isBackendEnabled = !!API_URL;

// Helper to construct headers with JWT
const getHeaders = async () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("dailylog_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Default dummy logs to make the sandbox interactive right away
const getSeedEntries = (): DiaryEntry[] => {
  const today = new Date();
  const format = (d: Date) => d.toISOString().split("T")[0];

  const d1 = new Date(today);
  d1.setDate(today.getDate() - 1); // Yesterday

  const d2 = new Date(today);
  d2.setDate(today.getDate() - 2); // 2 days ago

  const d3 = new Date(today);
  d3.setDate(today.getDate() - 4); // 4 days ago

  const d4 = new Date(today);
  d4.setDate(today.getDate() - 5); // 5 days ago

  const d5 = new Date(today);
  d5.setDate(today.getDate() - 7); // 7 days ago

  return [
    {
      id: "seed-1",
      entry_date: format(d1),
      title: "Reflections on a Quiet Evening",
      content: "Spent the evening reading by the window. The rain started just around sunset. There's something incredibly calming about the sound of water hitting the glass while sipping warm tea. Made progress on my book, and felt a deep sense of peace today. I want to carry this quiet focus into the upcoming workweek.",
      mood: "grateful",
      tags: ["peaceful", "reading", "rainy-day"],
      is_private: true,
      created_at: new Date(d1).toISOString(),
      updated_at: new Date(d1).toISOString(),
    },
    {
      id: "seed-2",
      entry_date: format(d2),
      title: "Creative Breakthrough and Big Wins",
      content: "Finally solved the layout issue that was blocking the new app dashboard! It clicked while I was out for a short walk in the afternoon. Sometimes the best debugging is simply walking away from the screen. Celebrated by cooking a delicious pasta dinner. Extremely happy with the results today.",
      mood: "amazing",
      tags: ["coding", "creative", "achievement"],
      is_private: true,
      time_logs: [
        { start_time: "09:30", end_time: "11:00", activity: "Brainstorming dashboard layout", category: "Planning" },
        { start_time: "11:00", end_time: "13:00", activity: "Developing dashboard components", category: "Coding" },
        { start_time: "14:00", end_time: "16:30", activity: "Debugging responsive issues & testing", category: "Coding" },
        { start_time: "17:00", end_time: "18:00", activity: "Team review & demo", category: "Meeting" }
      ],
      created_at: new Date(d2).toISOString(),
      updated_at: new Date(d2).toISOString(),
    },
    {
      id: "seed-3",
      entry_date: format(d3),
      title: "Feeling a Bit Scattered",
      content: "Woke up feeling tired and struggled to find a solid rhythm. Tried to push through multiple tasks but ended up feeling split. The coffee didn't help much today. Need to remind myself that it is okay to have slower days. Decided to close the laptop early and go to bed on time.",
      mood: "tired",
      tags: ["slow-day", "rest", "coffee"],
      is_private: true,
      time_logs: [],
      created_at: new Date(d3).toISOString(),
      updated_at: new Date(d3).toISOString(),
    },
    {
      id: "seed-4",
      entry_date: format(d4),
      title: "Productive Focus Sessions",
      content: "A highly organized day. Cleared out my inbox, planned out the rest of the month's deliverables, and had a great sync session with the team. Things are moving smoothly. Feels good to be on top of things.",
      mood: "happy",
      tags: ["work", "productivity", "organization"],
      is_private: true,
      time_logs: [
        { start_time: "09:00", end_time: "10:30", activity: "Inbox zero and sorting email backlog", category: "Admin" },
        { start_time: "11:00", end_time: "12:30", activity: "Monthly deliverable planning", category: "Planning" },
        { start_time: "14:00", end_time: "15:00", activity: "Team sync and progress update", category: "Meeting" },
        { start_time: "15:30", end_time: "17:00", activity: "Drafting technical design specification", category: "Design" }
      ],
      created_at: new Date(d4).toISOString(),
      updated_at: new Date(d4).toISOString(),
    },
    {
      id: "seed-5",
      entry_date: format(d5),
      title: "Dealing with Uncertainty",
      content: "Had a conversation today about upcoming organization shifts, and felt a wave of anxiety about where things are heading. Journaling helps me dump these thoughts onto paper and see them objectively. The unknown is always scary, but I will focus on what I can control. Tomorrow is a fresh start.",
      mood: "anxious",
      tags: ["mindfulness", "thoughts", "career"],
      is_private: true,
      created_at: new Date(d5).toISOString(),
      updated_at: new Date(d5).toISOString(),
    },
  ];
};

// Local storage helpers
const getLocalEntries = (): DiaryEntry[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("dailylog_entries");
  if (!stored) {
    const seed = getSeedEntries();
    localStorage.setItem("dailylog_entries", JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored);
};

const saveLocalEntries = (entries: DiaryEntry[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("dailylog_entries", JSON.stringify(entries));
};

// Main service functions
export const diaryService = {
  isBackendEnabled: () => isBackendEnabled,

  async getEntries(): Promise<DiaryEntry[]> {
    if (isBackendEnabled) {
      const response = await fetch(`${API_URL}/entries`, {
        method: "GET",
        headers: await getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch entries from server");
      return response.json();
    } else {
      return getLocalEntries().sort((a, b) => b.entry_date.localeCompare(a.entry_date));
    }
  },

  async getEntryById(id: string): Promise<DiaryEntry | null> {
    if (isBackendEnabled) {
      const entries = await this.getEntries();
      return entries.find((e) => e.id === id) || null;
    } else {
      const entries = getLocalEntries();
      return entries.find((e) => e.id === id) || null;
    }
  },

  async getEntryByDate(dateStr: string): Promise<DiaryEntry | null> {
    if (isBackendEnabled) {
      const response = await fetch(`${API_URL}/entries/date/${dateStr}`, {
        method: "GET",
        headers: await getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch entry by date");
      return response.json();
    } else {
      const entries = getLocalEntries();
      return entries.find((e) => e.entry_date === dateStr) || null;
    }
  },

  async saveEntry(entry: Omit<DiaryEntry, "id" | "created_at" | "updated_at"> & { id?: string }): Promise<DiaryEntry> {
    const nowStr = new Date().toISOString();
    const entryId = entry.id || crypto.randomUUID();

    if (isBackendEnabled) {
      const response = await fetch(`${API_URL}/entries`, {
        method: "POST",
        headers: await getHeaders(),
        body: JSON.stringify(entry),
      });
      if (!response.ok) throw new Error("Failed to save entry on server");
      return response.json();
    } else {
      const entries = getLocalEntries();
      const index = entries.findIndex((e) => e.id === entryId || e.entry_date === entry.entry_date);

      let savedEntry: DiaryEntry;

      if (index >= 0) {
        savedEntry = {
          ...entries[index],
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          is_private: entry.is_private,
          time_logs: entry.time_logs || [],
          updated_at: nowStr,
        };
        entries[index] = savedEntry;
      } else {
        savedEntry = {
          id: entryId,
          entry_date: entry.entry_date,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          is_private: entry.is_private,
          time_logs: entry.time_logs || [],
          created_at: nowStr,
          updated_at: nowStr,
        };
        entries.push(savedEntry);
      }

      saveLocalEntries(entries);
      return savedEntry;
    }
  },

  async deleteEntry(id: string): Promise<boolean> {
    if (isBackendEnabled) {
      const response = await fetch(`${API_URL}/entries/${id}`, {
        method: "DELETE",
        headers: await getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete entry on server");
      return true;
    } else {
      const entries = getLocalEntries();
      const filtered = entries.filter((e) => e.id !== id);
      if (filtered.length === entries.length) return false;
      saveLocalEntries(filtered);
      return true;
    }
  },

  async getStreak(): Promise<{ currentStreak: number; longestStreak: number }> {
    if (isBackendEnabled) {
      const response = await fetch(`${API_URL}/entries/stats/streak`, {
        method: "GET",
        headers: await getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch streak info from server");
      return response.json();
    }

    const entries = await this.getEntries();
    if (entries.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const dates = Array.from(new Set(entries.map((e) => e.entry_date)))
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
    return { currentStreak, longestStreak };
  },

  async getMoodStats() {
    if (isBackendEnabled) {
      const response = await fetch(`${API_URL}/entries/stats/moods`, {
        method: "GET",
        headers: await getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch mood stats from server");
      return response.json();
    }

    const entries = await this.getEntries();
    const distribution: Record<string, number> = {};
    
    MOODS.forEach((m) => {
      distribution[m.value] = 0;
    });

    let count = 0;
    entries.forEach((e) => {
      if (e.mood && e.mood in distribution) {
        distribution[e.mood]++;
        count++;
      }
    });

    return {
      distribution,
      totalMoodsCount: count,
      totalEntries: entries.length,
    };
  },
};
