"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Sparkles, Smile, Info } from "lucide-react";
import TopBar from "@/components/TopBar";
import { diaryService, DiaryEntry, MOODS } from "@/lib/diaryService";

export default function CalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const data = await diaryService.getEntries();
        setEntries(data);
      } catch (err) {
        console.error("Error loading calendar entries:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Calendar logic helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate day of the week offset for month start (0: Sunday, 1: Monday, etc.)
  const startDayOfWeek = getDay(monthStart);

  const handleDateClick = (date: Date) => {
    const today = new Date();
    // Cannot write in future
    if (date > today) return;

    const dateStr = format(date, "yyyy-MM-dd");
    router.push(`/dashboard?date=${dateStr}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Your Journal Calendar" />

      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Calendar Card container */}
        <div className="bg-card border border-border rounded-2xl p-6 calm-shadow">
          {/* Calendar Header controls */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <h3 className="font-serif font-semibold text-lg text-foreground">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="w-9 h-9 border border-border rounded-xl flex items-center justify-center hover:bg-muted text-foreground transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="w-9 h-9 border border-border rounded-xl flex items-center justify-center hover:bg-muted text-foreground transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-2 text-center py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="space-y-3 text-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground tracking-wider uppercase font-semibold">
                  Structuring calendar...
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Render empty boxes for leading offset days */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-xl bg-muted/20 border border-transparent" />
              ))}

              {/* Render month days */}
              {daysInMonth.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayEntry = entries.find((e) => e.entry_date === dateStr);
                const isToday = isSameDay(day, new Date());
                const isFuture = day > new Date();

                // Find mood configuration
                const dayMood = dayEntry ? MOODS.find((m) => m.value === dayEntry.mood) : null;

                return (
                  <button
                    key={dateStr}
                    disabled={isFuture}
                    onClick={() => handleDateClick(day)}
                    className={`aspect-square p-2 rounded-2xl border text-left flex flex-col justify-between relative overflow-hidden transition-all group ${
                      isFuture
                        ? "bg-muted/10 border-transparent text-muted-foreground/30 cursor-not-allowed"
                        : "bg-card hover:border-primary/50 cursor-pointer"
                    } ${
                      isToday
                        ? "border-primary ring-1 ring-primary/30 font-semibold"
                        : "border-border"
                    } ${
                      dayEntry && dayMood
                        ? `bg-gradient-to-br ${dayMood.color} border-primary/20`
                        : ""
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        isToday ? "text-primary" : "text-foreground/80"
                      } ${dayEntry ? "font-semibold" : ""}`}
                    >
                      {format(day, "d")}
                    </span>

                    {/* Render entry detail indicator inside calendar cell */}
                    {dayEntry && (
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-lg leading-none" title={dayMood?.label}>
                          {dayMood?.emoji || "📝"}
                        </span>
                        
                        {/* Title tooltip on hover for larger screens */}
                        <div className="hidden group-hover:block absolute bottom-1 right-1 left-1 bg-black/80 dark:bg-zinc-800 text-[10px] text-white p-1 rounded border border-border/20 truncate z-10">
                          {dayEntry.title || "Untitled Log"}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-card border border-border rounded-2xl p-4 calm-shadow flex flex-wrap gap-4 items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-primary" />
            <span>Click any day to read or edit its log. Today is outlined in Teal.</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {MOODS.map((m) => (
              <div key={m.value} className="flex items-center gap-1">
                <span>{m.emoji}</span>
                <span className="capitalize">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
