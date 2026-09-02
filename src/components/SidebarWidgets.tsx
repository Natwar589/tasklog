"use client";

import React, { useState, useEffect } from "react";
import { Flame, Sparkles, BookOpen, CheckCircle, RefreshCw, MessageSquareCode, Trophy } from "lucide-react";
import { DiaryEntry } from "@/lib/diaryService";
import { format, subDays } from "date-fns";
import PomodoroTimer from "./PomodoroTimer";
import confetti from "canvas-confetti";

interface SidebarWidgetsProps {
  entries: DiaryEntry[];
  streak: { currentStreak: number; longestStreak: number };
  currentDateStr: string;
  onUsePrompt: (prompt: string) => void;
}

const PROMPTS = [
  "What made today meaningful?",
  "What drained your energy today?",
  "What did you learn today?",
  "What are you grateful for today?",
  "How should tomorrow be better than today?",
  "What was the most peaceful moment of your day?",
  "Did you step outside your comfort zone today? How?",
  "Write about a person who made you smile today.",
];

const STREAK_MILESTONES = [7, 30, 100, 365];

export default function SidebarWidgets({ entries, streak, currentDateStr, onUsePrompt }: SidebarWidgetsProps) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [memory, setMemory] = useState<DiaryEntry | null>(null);
  const [checklist, setChecklist] = useState({
    water: false,
    nature: false,
    lovedOne: false,
  });
  const [lastCelebrated, setLastCelebrated] = useState<number>(0);

  // Build 7-day entry map
  const entryDates = new Set(entries.map((e) => e.entry_date));
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = d.toISOString().split("T")[0];
    return {
      dateStr,
      label: format(d, "EEE"),
      hasEntry: entryDates.has(dateStr),
      isToday: dateStr === new Date().toISOString().split("T")[0],
    };
  });

  // Pick prompt based on date or rotate
  useEffect(() => {
    const day = new Date(currentDateStr).getDate() || 0;
    setPromptIndex(day % PROMPTS.length);
  }, [currentDateStr]);

  // Milestone celebrations
  useEffect(() => {
    const milestone = STREAK_MILESTONES.find(
      (m) => streak.currentStreak >= m && lastCelebrated < m
    );
    if (milestone) {
      setLastCelebrated(milestone);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#2dd4bf", "#f59e0b", "#f472b6", "#a78bfa"],
      });
    }
  }, [streak.currentStreak, lastCelebrated]);

  const rotatePrompt = () => {
    setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
  };

  // Find previous entries on the same date (excluding current date itself)
  useEffect(() => {
    if (entries.length === 0) {
      setMemory(null);
      return;
    }

    const currentD = new Date(currentDateStr);
    const currentMonth = currentD.getMonth();
    const currentDate = currentD.getDate();

    const pastEntries = entries.filter((e) => {
      if (e.entry_date === currentDateStr) return false;
      const d = new Date(e.entry_date);
      return d.getMonth() === currentMonth && d.getDate() === currentDate;
    });

    if (pastEntries.length > 0) {
      setMemory(pastEntries[0]);
    } else {
      setMemory(null);
    }
  }, [entries, currentDateStr]);

  // Streak milestone label
  const nextMilestone = STREAK_MILESTONES.find((m) => streak.currentStreak < m);

  return (
    <div className="space-y-6">
      {/* Streak Card with 7-day strip */}
      <div className="bg-card border border-border rounded-2xl p-5 calm-shadow relative overflow-hidden">
        {/* Background Subtle Flame Glow */}
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -z-10" />

        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Writing Streak</span>
            <h4 className="text-2xl font-bold tracking-tight text-foreground mt-1 flex items-baseline gap-1.5">
              {streak.currentStreak} <span className="text-sm font-medium text-muted-foreground">days</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Longest: <span className="font-semibold text-foreground">{streak.longestStreak} days</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 calm-shadow">
            <Flame className="w-5.5 h-5.5 fill-amber-500/20" />
          </div>
        </div>

        {/* 7-day strip */}
        <div className="flex items-center justify-between gap-1">
          {last7Days.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground">{day.label}</span>
              <div
                className={`w-full h-2 rounded-full transition-all ${
                  day.hasEntry
                    ? "bg-amber-400"
                    : day.isToday
                    ? "bg-border border-2 border-amber-300/40"
                    : "bg-border"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Next milestone progress */}
        {nextMilestone && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-500" />
                Next milestone: {nextMilestone} days
              </span>
              <span>{streak.currentStreak}/{nextMilestone}</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((streak.currentStreak / nextMilestone) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pomodoro Timer */}
      <PomodoroTimer />

      {/* Daily Writing Prompt */}
      <div className="bg-card border border-border rounded-2xl p-5 calm-shadow space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Daily Prompt
          </span>
          <button
            onClick={rotatePrompt}
            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            title="Next prompt"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="font-serif italic text-sm text-foreground/90 leading-relaxed">
          &ldquo;{PROMPTS[promptIndex]}&rdquo;
        </p>
        <button
          onClick={() => onUsePrompt(PROMPTS[promptIndex])}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 pt-1"
        >
          <BookOpen className="w-3.5 h-3.5" /> Use this prompt
        </button>
      </div>

      {/* On This Day / Memory Card */}
      {memory && (
        <div className="bg-gradient-to-br from-teal-500/5 to-emerald-500/5 dark:from-teal-500/[0.02] dark:to-emerald-500/[0.02] border border-primary/10 rounded-2xl p-5 calm-shadow space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1.5">
            <MessageSquareCode className="w-3.5 h-3.5" /> On This Day ({format(new Date(memory.entry_date), "yyyy")})
          </span>
          <h5 className="font-semibold text-sm text-foreground truncate">{memory.title || "Untitled log"}</h5>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic">
            &ldquo;{memory.content}&rdquo;
          </p>
        </div>
      )}

      {/* Reflection Checklist */}
      <div className="bg-card border border-border rounded-2xl p-5 calm-shadow space-y-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-primary" /> Quick Reflections
        </span>
        <div className="space-y-2">
          {[
            { key: "water" as const, label: "Drank enough water today" },
            { key: "nature" as const, label: "Spent time outside/in nature" },
            { key: "lovedOne" as const, label: "Connected with a loved one" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 text-xs text-foreground/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checklist[key]}
                onChange={(e) => setChecklist({ ...checklist, [key]: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
              />
              <span className={checklist[key] ? "line-through text-muted-foreground" : ""}>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
