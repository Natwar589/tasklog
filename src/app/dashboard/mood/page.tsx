"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Sparkles, Smile, Info, Calendar } from "lucide-react";
import TopBar from "@/components/TopBar";
import { diaryService, DiaryEntry, MOODS } from "@/lib/diaryService";
import { format } from "date-fns";

const MOOD_VALUES: Record<string, number> = {
  amazing: 5,
  grateful: 4.5,
  happy: 4,
  okay: 3,
  tired: 2,
  anxious: 1.8,
  sad: 1,
  angry: 0.5,
};

export default function MoodPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [stats, setStats] = useState<{
    distribution: Record<string, number>;
    totalMoodsCount: number;
    totalEntries: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const logs = await diaryService.getEntries();
        setEntries(logs);
        const data = await diaryService.getMoodStats();
        setStats(data);
      } catch (err) {
        console.error("Error loading mood analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Prepare chart coordinates for last 7 entries (chronological order)
  const chartEntries = [...entries]
    .filter((e) => e.mood)
    .slice(0, 7)
    .reverse();

  // Width and height parameters for SVG
  const width = 600;
  const height = 240;
  const padding = 40;

  // Generate SVG chart coordinates
  const points = chartEntries.map((e, idx) => {
    const x = padding + (idx * (width - padding * 2)) / Math.max(chartEntries.length - 1, 1);
    
    // Scale value between 0.5 and 5 to the SVG height (inverted coordinates)
    const val = MOOD_VALUES[e.mood] || 3;
    const y = height - padding - ((val - 0.5) / 4.5) * (height - padding * 2);
    
    return { x, y, entry: e };
  });

  // Construct path string
  let linePath = "";
  let areaPath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    points.forEach((p, idx) => {
      if (idx > 0) {
        linePath += ` L ${p.x} ${p.y}`;
      }
    });

    // For area chart fill
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Your Mood Analytics" />

      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground tracking-wider uppercase font-semibold">
                Plotting your vibes...
              </p>
            </div>
          </div>
        ) : entries.filter((e) => e.mood).length === 0 ? (
          /* Empty State */
          <div className="bg-card border border-border rounded-2xl p-12 text-center calm-shadow space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mx-auto">
              <Smile className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground">No Mood Data Found</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Start journaling and logging your mood daily! Once you log a few entries, your emotional trend line and distribution summary will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Custom SVG Trend Chart */}
            <div className="bg-card border border-border rounded-2xl p-6 calm-shadow space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Mood Progression
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Tracking your latest 7 logged moods</p>
                </div>
              </div>

              {chartEntries.length < 2 ? (
                <div className="h-48 border border-dashed border-border rounded-xl flex items-center justify-center text-xs text-muted-foreground">
                  Need at least 2 logged days to calculate a progression curve. Keep journaling!
                </div>
              ) : (
                <div className="overflow-x-auto pt-2">
                  <div className="min-w-[600px] relative">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Y Axis Gridlines and labels */}
                      {[0.5, 2, 3.5, 5].map((val) => {
                        const y = height - padding - ((val - 0.5) / 4.5) * (height - padding * 2);
                        let label = "Okay";
                        if (val === 0.5) label = "Angry/Sad";
                        if (val === 2) label = "Tired/Anxious";
                        if (val === 5) label = "Amazing";
                        
                        return (
                          <g key={val} className="opacity-40">
                            <line
                              x1={padding}
                              y1={y}
                              x2={width - padding}
                              y2={y}
                              stroke="var(--border)"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                            <text x={padding - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-muted-foreground font-semibold uppercase tracking-wider">
                              {label}
                            </text>
                          </g>
                        );
                      })}

                      {/* Area Fill */}
                      {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}

                      {/* Line Curve */}
                      {linePath && (
                        <path
                          d={linePath}
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Data Point Circles and Labels */}
                      {points.map((p, idx) => {
                        const moodInfo = MOODS.find((m) => m.value === p.entry.mood);
                        const dateFormatted = format(new Date(p.entry.entry_date), "MMM d");
                        return (
                          <g key={p.entry.id} className="group/node cursor-pointer">
                            {/* Glow */}
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="8"
                              className="fill-primary/20 opacity-0 group-hover/node:opacity-100 transition-opacity"
                            />
                            {/* Point */}
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="5"
                              className="fill-background stroke-primary stroke-[2.5]"
                            />
                            {/* Emoji Label floating */}
                            <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-sm">
                              {moodInfo?.emoji}
                            </text>
                            {/* Date Label on X Axis */}
                            <text
                              x={p.x}
                              y={height - padding + 16}
                              textAnchor="middle"
                              className="text-[9px] font-bold fill-muted-foreground uppercase tracking-wider"
                            >
                              {dateFormatted}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Mood Distribution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Distributions Card */}
              <div className="bg-card border border-border rounded-2xl p-6 calm-shadow space-y-4">
                <h4 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Mood Distribution
                </h4>
                
                {stats && (
                  <div className="space-y-3 pt-2">
                    {MOODS.map((m) => {
                      const count = stats.distribution[m.value] || 0;
                      const pct = stats.totalMoodsCount > 0 ? (count / stats.totalMoodsCount) * 100 : 0;
                      return (
                        <div key={m.value} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-foreground flex items-center gap-1.5">
                              <span>{m.emoji}</span>
                              <span className="capitalize">{m.label}</span>
                            </span>
                            <span className="text-muted-foreground font-semibold">
                              {count} {count === 1 ? "log" : "logs"} ({pct.toFixed(0)}%)
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Advice/Encouragement Panel */}
              <div className="bg-gradient-to-br from-teal-500/5 to-emerald-500/5 dark:from-teal-500/[0.01] dark:to-emerald-500/[0.01] border border-primary/10 rounded-2xl p-6 calm-shadow flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Journaling Insight
                  </span>
                  
                  <p className="font-serif text-base text-foreground/90 leading-relaxed italic">
                    "Journaling is not just mapping where you are, but realizing that every emotion is transient. Logging your mood brings conscious awareness to your patterns."
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-6 mt-4 border-t border-primary/5">
                  <Calendar className="w-4 h-4" />
                  <span>You have written in {entries.length} total days. Keep checking in.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
