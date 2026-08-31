"use client";

import React, { useState, useEffect } from "react";
import { Flame, Sparkles, BookOpen, CheckCircle, RefreshCw, MessageSquareCode } from "lucide-react";
import { DiaryEntry } from "@/lib/diaryService";
import { format } from "date-fns";

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

export default function SidebarWidgets({ entries, streak, currentDateStr, onUsePrompt }: SidebarWidgetsProps) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [memory, setMemory] = useState<DiaryEntry | null>(null);
  const [checklist, setChecklist] = useState({
    water: false,
    nature: false,
    lovedOne: false,
  });

  // Pick prompt based on date or rotate
  useEffect(() => {
    const day = new Date(currentDateStr).getDate() || 0;
    setPromptIndex(day % PROMPTS.length);
  }, [currentDateStr]);

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
      // Pick the most recent memory from same calendar day
      setMemory(pastEntries[0]);
    } else {
      setMemory(null);
    }
  }, [entries, currentDateStr]);

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <div className="bg-card border border-border rounded-2xl p-5 calm-shadow relative overflow-hidden">
        {/* Background Subtle Flame Glow */}
        <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -z-10" />

        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Writing Streak</span>
            <h4 className="text-2xl font-bold tracking-tight text-foreground mt-1 flex items-baseline gap-1.5">
              {streak.currentStreak} <span className="text-sm font-medium text-muted-foreground">days</span>
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Longest streak: <span className="font-semibold text-foreground">{streak.longestStreak} days</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 calm-shadow">
            <Flame className="w-5.5 h-5.5 fill-amber-500/20" />
          </div>
        </div>
      </div>

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
          "{PROMPTS[promptIndex]}"
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
            "{memory.content}"
          </p>
        </div>
      )}

      {/* Reflection Checklist */}
      <div className="bg-card border border-border rounded-2xl p-5 calm-shadow space-y-3">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Quick Reflections</span>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-foreground/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.water}
              onChange={(e) => setChecklist({ ...checklist, water: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
            />
            <span className={checklist.water ? "line-through text-muted-foreground" : ""}>Drank enough water today</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-foreground/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.nature}
              onChange={(e) => setChecklist({ ...checklist, nature: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
            />
            <span className={checklist.nature ? "line-through text-muted-foreground" : ""}>Spent time outside/in nature</span>
          </label>
          <label className="flex items-center gap-2.5 text-xs text-foreground/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.lovedOne}
              onChange={(e) => setChecklist({ ...checklist, lovedOne: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
            />
            <span className={checklist.lovedOne ? "line-through text-muted-foreground" : ""}>Connected with a loved one</span>
          </label>
        </div>
      </div>
    </div>
  );
}
