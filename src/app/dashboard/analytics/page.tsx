"use client";

import React, { useEffect, useState, useMemo } from "react";
import { BarChart3, Flame, Clock, TrendingUp, Sparkles } from "lucide-react";
import TopBar from "@/components/TopBar";
import { diaryService, DiaryEntry, MOODS } from "@/lib/diaryService";
import { format, subDays, startOfWeek, eachDayOfInterval, subWeeks } from "date-fns";

const MOOD_SCORES: Record<string, number> = {
  amazing: 5, grateful: 4.5, happy: 4, okay: 3,
  tired: 2, anxious: 1.8, sad: 1, angry: 0.5,
};

const CAT_COLORS: Record<string, string> = {
  Coding: "#14b8a6",
  Meeting: "#6366f1",
  Planning: "#f59e0b",
  Learning: "#a855f7",
  Design: "#f43f5e",
  Break: "#10b981",
  Other: "#94a3b8",
  Admin: "#64748b",
};

export default function AnalyticsPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    diaryService.getEntries().then((e) => {
      setEntries(e);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const entryMap = useMemo(() => {
    const map: Record<string, DiaryEntry> = {};
    entries.forEach((e) => { map[e.entry_date] = e; });
    return map;
  }, [entries]);

  // ── 52-week heatmap data ──────────────────────────────────────────────────
  const today = new Date();
  const heatmapWeeks = useMemo(() => {
    const weeks: { date: Date; dateStr: string; hasEntry: boolean; mood: string; score: number }[][] = [];
    for (let w = 51; w >= 0; w--) {
      const weekStart = startOfWeek(subWeeks(today, w), { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: new Date(weekStart.getTime() + 6 * 86400000) });
      weeks.push(
        days.map((d) => {
          const ds = d.toISOString().split("T")[0];
          const entry = entryMap[ds];
          const score = entry?.mood ? (MOOD_SCORES[entry.mood] || 0) : 0;
          return { date: d, dateStr: ds, hasEntry: !!entry, mood: entry?.mood || "", score };
        })
      );
    }
    return weeks;
  }, [entryMap, today]);

  // ── Weekly time breakdown for donut chart ────────────────────────────────
  const weeklyBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalMins = 0;
    const sevenDaysAgo = subDays(today, 7).toISOString().split("T")[0];
    entries
      .filter((e) => e.entry_date >= sevenDaysAgo)
      .forEach((e) => {
        (e.time_logs || []).forEach((log) => {
          const [sh, sm] = log.start_time.split(":").map(Number);
          const [eh, em] = log.end_time.split(":").map(Number);
          const mins = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
          totals[log.category] = (totals[log.category] || 0) + mins;
          totalMins += mins;
        });
      });
    return { totals, totalMins };
  }, [entries, today]);

  // ── Weekly report text ────────────────────────────────────────────────────
  const weeklyReport = useMemo(() => {
    const sevenDaysAgo = subDays(today, 7).toISOString().split("T")[0];
    const weekEntries = entries.filter((e) => e.entry_date >= sevenDaysAgo);
    const moodAvg =
      weekEntries.filter((e) => e.mood).length > 0
        ? (weekEntries.reduce((s, e) => s + (MOOD_SCORES[e.mood] || 0), 0) /
            weekEntries.filter((e) => e.mood).length).toFixed(1)
        : "—";
    const hrs = Math.floor(weeklyBreakdown.totalMins / 60);
    const mins = weeklyBreakdown.totalMins % 60;
    const topCat = Object.entries(weeklyBreakdown.totals).sort((a, b) => b[1] - a[1])[0];
    return { entriesCount: weekEntries.length, moodAvg, hrs, mins, topCat };
  }, [entries, weeklyBreakdown, today]);

  // ── Donut chart SVG helper ────────────────────────────────────────────────
  function DonutChart() {
    const { totals, totalMins } = weeklyBreakdown;
    if (totalMins === 0) return (
      <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
        No time logs this week yet.
      </div>
    );

    const cx = 80, cy = 80, r = 60, strokeW = 28;
    const circumference = 2 * Math.PI * r;
    let offset = 0;

    const slices = Object.entries(totals).map(([cat, mins]) => {
      const pct = mins / totalMins;
      const dash = pct * circumference;
      const slice = { cat, pct, dash, offset };
      offset += dash;
      return slice;
    });

    return (
      <div className="flex flex-col items-center gap-4">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          {slices.map((s) => (
            <circle
              key={s.cat}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={CAT_COLORS[s.cat] || "#94a3b8"}
              strokeWidth={strokeW}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
            />
          ))}
          {/* Center hole bg */}
          <circle cx={cx} cy={cy} r={r - strokeW / 2 - 2} fill="var(--card)" />
        </svg>
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
          {slices.map((s) => (
            <div key={s.cat} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: CAT_COLORS[s.cat] || "#94a3b8" }}
              />
              <span className="text-foreground/70 font-medium">{s.cat}</span>
              <span className="text-muted-foreground font-bold">{Math.round(s.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Heatmap cell color ───────────────────────────────────────────────────
  function cellColor(cell: { hasEntry: boolean; score: number }) {
    if (!cell.hasEntry) return "bg-border/60";
    if (cell.score >= 4.5) return "bg-amber-400";
    if (cell.score >= 4) return "bg-teal-400";
    if (cell.score >= 3) return "bg-teal-500/70";
    if (cell.score >= 2) return "bg-sky-400/70";
    return "bg-slate-400/70";
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar title="Analytics" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Analytics & Insights" />

      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">

        {/* Weekly Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Flame className="w-5 h-5 text-amber-500" />, label: "Entries this week", value: weeklyReport.entriesCount.toString(), bg: "bg-amber-500/8" },
            { icon: <TrendingUp className="w-5 h-5 text-teal-500" />, label: "Avg mood score", value: weeklyReport.moodAvg + "/5", bg: "bg-teal-500/8" },
            { icon: <Clock className="w-5 h-5 text-indigo-500" />, label: "Hours logged", value: `${weeklyReport.hrs}h ${weeklyReport.mins}m`, bg: "bg-indigo-500/8" },
            { icon: <Sparkles className="w-5 h-5 text-violet-500" />, label: "Top category", value: weeklyReport.topCat ? weeklyReport.topCat[0] : "—", bg: "bg-violet-500/8" },
          ].map((card) => (
            <div key={card.label} className={`${card.bg} border border-border rounded-2xl p-4 calm-shadow`}>
              <div className="flex items-center gap-2 mb-2">{card.icon}</div>
              <p className="text-xl font-bold text-foreground tracking-tight">{card.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* 52-week Heatmap */}
        <div className="bg-card border border-border rounded-2xl p-6 calm-shadow space-y-4">
          <div>
            <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Year Activity Heatmap
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">52 weeks — color indicates mood: 🟡 Amazing · 🟢 Happy · 🔵 Tired/Sad · ⬜ No entry</p>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1 min-w-max">
              {heatmapWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((cell) => {
                    const isFuture = cell.date > today;
                    return (
                      <div
                        key={cell.dateStr}
                        title={`${cell.dateStr}${cell.hasEntry ? ` · ${cell.mood || "logged"}` : ""}`}
                        className={`w-3.5 h-3.5 rounded-sm transition-transform hover:scale-125 cursor-pointer ${
                          isFuture ? "opacity-0 pointer-events-none" : cellColor(cell)
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Month labels */}
          <div className="flex gap-1 overflow-x-auto text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
            {heatmapWeeks
              .filter((_, i) => i % 4 === 0)
              .map((week) => (
                <div key={week[0].dateStr} className="w-[15px] shrink-0 text-center">
                  {format(week[0].date, "MMM")}
                </div>
              ))}
          </div>
        </div>

        {/* Donut chart + mood distribution side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Breakdown Donut */}
          <div className="bg-card border border-border rounded-2xl p-6 calm-shadow space-y-4">
            <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Time Breakdown (Last 7 days)
            </h3>
            <DonutChart />
          </div>

          {/* Mood distribution bars */}
          <div className="bg-card border border-border rounded-2xl p-6 calm-shadow space-y-4">
            <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Mood Distribution (All time)
            </h3>
            <div className="space-y-3">
              {MOODS.map((m) => {
                const count = entries.filter((e) => e.mood === m.value).length;
                const pct = entries.length > 0 ? (count / entries.length) * 100 : 0;
                return (
                  <div key={m.value} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </span>
                      <span className="text-muted-foreground font-semibold">{count} logs ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Narrative Report */}
        <div className="bg-gradient-to-br from-teal-500/5 to-emerald-500/5 dark:from-teal-500/[0.02] border border-primary/10 rounded-2xl p-6 calm-shadow space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Weekly Summary
          </span>
          <p className="font-serif text-sm text-foreground/90 leading-relaxed">
            {weeklyReport.entriesCount === 0
              ? "No entries found this week. Start writing to see your weekly summary here!"
              : `This week you wrote ${weeklyReport.entriesCount} journal ${weeklyReport.entriesCount === 1 ? "entry" : "entries"}, 
                 logged ${weeklyReport.hrs > 0 ? `${weeklyReport.hrs}h ${weeklyReport.mins}m` : `${weeklyReport.mins}m`} of tasks, 
                 and maintained an average mood score of ${weeklyReport.moodAvg}/5.
                 ${weeklyReport.topCat ? `Your top activity was ${weeklyReport.topCat[0]} at ${Math.round(weeklyReport.topCat[1] / 60 * 10) / 10}h.` : ""}
                 ${Number(weeklyReport.moodAvg) >= 4
                   ? "You had a fantastic week! 🌟"
                   : Number(weeklyReport.moodAvg) >= 3
                   ? "A solid week overall. Keep building momentum! 💪"
                   : "Tough week — remember to rest and recharge. 🌿"}`
            }
          </p>
        </div>

      </main>
    </div>
  );
}
