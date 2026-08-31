"use client";

import React, { useState } from "react";
import { X, Hash, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const cleanTag = inputValue.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (cleanTag && !tags.includes(cleanTag)) {
      onChange([...tags, cleanTag]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Tags & Keywords
      </label>
      <div className="flex flex-wrap items-center gap-2 p-3 bg-card border border-border rounded-xl focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all calm-shadow">
        {/* Render existing tags */}
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border"
            >
              <Hash className="w-3 h-3 opacity-60" />
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-primary/10 p-0.5 rounded transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Input box */}
        <div className="flex-1 min-w-[120px] flex items-center gap-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? "Add tags (e.g. mindfulness, work)..." : ""}
            className="w-full text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 p-0"
          />
          {inputValue.trim() && (
            <button
              type="button"
              onClick={addTag}
              className="p-1 rounded-lg hover:bg-muted text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
