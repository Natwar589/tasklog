"use client";

import React, { useState } from "react";
import { LayoutTemplate, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Template {
  id: string;
  name: string;
  emoji: string;
  description: string;
  title: string;
  content: string;
}

const TEMPLATES: Template[] = [
  {
    id: "standup",
    name: "Daily Standup",
    emoji: "🚀",
    description: "What I did, doing, and blockers",
    title: "Daily Standup",
    content:
      "✅ What I accomplished yesterday:\n\n\n🔨 What I'm working on today:\n\n\n🚧 Blockers / Dependencies:\n\n\n💡 Notes & observations:\n",
  },
  {
    id: "weekly-review",
    name: "Weekly Review",
    emoji: "📋",
    description: "End-of-week reflection & planning",
    title: "Weekly Review",
    content:
      "🏆 This week's wins:\n\n\n📉 What didn't go well:\n\n\n🌱 Key learnings:\n\n\n🎯 Priorities for next week:\n\n\n⚖️ Work-life balance check (1–10): \n",
  },
  {
    id: "brain-dump",
    name: "Brain Dump",
    emoji: "🧠",
    description: "Free-form thoughts and ideas",
    title: "Brain Dump",
    content:
      "💭 Everything on my mind right now:\n\n\n🔖 Ideas to explore later:\n\n\n❓ Open questions I have:\n\n\n📌 Random observations:\n",
  },
  {
    id: "gratitude",
    name: "Deep Gratitude",
    emoji: "🙏",
    description: "Extended gratitude reflection",
    title: "Gratitude & Reflection",
    content:
      "💛 People I appreciate deeply right now:\n\n\n🌟 Moments that made me feel alive this week:\n\n\n🌿 Small things I often overlook but am thankful for:\n\n\n💌 Letter to my future self:\n",
  },
  {
    id: "retro",
    name: "Project Retrospective",
    emoji: "🔄",
    description: "Post-project lessons learned",
    title: "Project Retrospective",
    content:
      "🎉 What went really well:\n\n\n😬 What could have been better:\n\n\n🔍 Root cause of key issues:\n\n\n📚 Top 3 lessons learned:\n1. \n2. \n3. \n\n🚀 Action items for next project:\n",
  },
];

interface TemplateSelectorProps {
  onSelect: (title: string, content: string) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (t: Template) => {
    onSelect(t.title, t.content);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-xl border border-border transition-all"
      >
        <LayoutTemplate className="w-3.5 h-3.5" />
        Templates
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl calm-shadow overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <LayoutTemplate className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-base text-foreground">
                      Entry Templates
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      Choose a structured starting point
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Templates grid */}
              <div className="p-4 grid grid-cols-1 gap-2 max-h-[440px] overflow-y-auto">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t)}
                    className="text-left flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{t.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    </div>
                    <span className="ml-auto text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 font-semibold">
                      Use →
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
