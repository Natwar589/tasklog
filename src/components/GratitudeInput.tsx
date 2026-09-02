"use client";

import React, { useState } from "react";
import { Plus, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GratitudeInputProps {
  items: string[];
  onChange: (items: string[]) => void;
}

const PLACEHOLDER = [
  "I'm grateful for...",
  "Something that made me smile...",
  "A person I appreciate...",
];

export default function GratitudeInput({ items, onChange }: GratitudeInputProps) {
  const [inputVal, setInputVal] = useState("");

  const addItem = () => {
    const trimmed = inputVal.trim();
    if (!trimmed || items.length >= 3) return;
    onChange([...items, trimmed]);
    setInputVal("");
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-3 pt-6 border-t border-border/80">
      {/* Section header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/15 to-pink-500/10 flex items-center justify-center border border-rose-500/15">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
        </div>
        <div>
          <h4 className="font-serif font-semibold text-sm text-foreground">Gratitude Journal</h4>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {items.length}/3 things you&apos;re grateful for
          </p>
        </div>
      </div>

      {/* Gratitude items list */}
      <AnimatePresence initial={false}>
        {items.map((item, idx) => (
          <motion.div
            key={`${item}-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500/6 to-pink-500/4 border border-rose-500/12 group"
          >
            <span className="text-rose-400 font-bold text-xs w-5 text-center shrink-0">
              {idx + 1}.
            </span>
            <p className="flex-1 text-sm font-serif text-foreground/90 leading-relaxed">{item}</p>
            <button
              onClick={() => removeItem(idx)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Input row */}
      {items.length < 3 && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER[items.length] || "Add another..."}
            maxLength={120}
            className="flex-1 px-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm text-foreground placeholder:text-muted-foreground/45 outline-none focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/30 transition-all"
          />
          <button
            onClick={addItem}
            disabled={!inputVal.trim()}
            className="w-10 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all calm-shadow disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {items.length === 3 && (
        <p className="text-[11px] text-muted-foreground italic text-center py-1">
          ✨ Beautiful — three things to be grateful for today.
        </p>
      )}
    </div>
  );
}
