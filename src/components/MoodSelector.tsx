"use client";

import React from "react";
import { motion } from "framer-motion";
import { MOODS } from "@/lib/diaryService";

interface MoodSelectorProps {
  selectedMood: string;
  onChange: (mood: string) => void;
}

export default function MoodSelector({ selectedMood, onChange }: MoodSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        How is your mood today?
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {MOODS.map((m) => {
          const isSelected = selectedMood === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange(m.value)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer select-none outline-none relative overflow-hidden ${
                isSelected
                  ? `border-primary bg-gradient-to-br ${m.color} calm-shadow font-semibold scale-[1.03]`
                  : "border-border bg-card hover:bg-muted/50 hover:border-border text-foreground hover:scale-[1.02]"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="selectedMoodHighlight"
                  className="absolute inset-0 bg-white/10 -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              <span className={`text-2xl mb-1 transition-transform duration-200 ${isSelected ? "scale-110 animate-bounce" : ""}`}>
                {m.emoji}
              </span>
              <span className="text-[10px] tracking-wide uppercase font-medium">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
