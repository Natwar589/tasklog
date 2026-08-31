"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Save, Trash2, Calendar as CalendarIcon, Check, CloudLightning, ShieldCheck, HelpCircle } from "lucide-react";
import MoodSelector from "./MoodSelector";
import TagInput from "./TagInput";
import TimeLogger from "./TimeLogger";
import { DiaryEntry, TimeLog } from "@/lib/diaryService";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import confetti from "canvas-confetti";
import { format } from "date-fns";

interface DiaryEditorProps {
  initialEntry: DiaryEntry | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSave: (entry: Omit<DiaryEntry, "id" | "created_at" | "updated_at"> & { id?: string }) => Promise<DiaryEntry>;
  onDelete: (id: string) => Promise<void>;
}

export default function DiaryEditor({
  initialEntry,
  selectedDate,
  onDateChange,
  onSave,
  onDelete,
}: DiaryEditorProps) {
  const { success, error, warning } = useToast();
  const [id, setId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<DiaryEntry["mood"]>("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(true);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state with initialEntry when it changes
  useEffect(() => {
    if (initialEntry) {
      setId(initialEntry.id);
      setTitle(initialEntry.title);
      setContent(initialEntry.content);
      setMood(initialEntry.mood);
      setTags(initialEntry.tags || []);
      setIsPrivate(initialEntry.is_private);
      setTimeLogs(initialEntry.time_logs || []);
    } else {
      setId(undefined);
      setTitle("");
      setContent("");
      setMood("");
      setTags([]);
      setIsPrivate(true);
      setTimeLogs([]);
    }
    setSaveStatus("idle");
  }, [initialEntry, selectedDate]);

  // Main save function
  const handleSave = async (isAutoSave = false) => {
    if (!title.trim() && !content.trim()) {
      if (!isAutoSave) {
        warning("Please write a title or some content first.");
      }
      return;
    }

    setSaveStatus("saving");
    try {
      const saved = await onSave({
        id,
        entry_date: selectedDate,
        title: title.trim(),
        content: content.trim(),
        mood,
        tags,
        is_private: isPrivate,
        time_logs: timeLogs,
      });
      
      setId(saved.id);
      setSaveStatus("saved");

      if (!isAutoSave) {
        success("Journal saved beautifully!");
        // Launch a little confetti celebration!
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#2dd4bf", "#115e59", "#fde047", "#fbcfe8"],
        });
      }
      
      // Clear saved indicator after 3 seconds
      setTimeout(() => {
        setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
      }, 3000);
    } catch (err: any) {
      setSaveStatus("error");
      error(err.message || "Failed to save entry");
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    // Only auto-save if there is actually content/changes
    if (!title.trim() && !content.trim()) return;
    
    // Check if current values differ from initialEntry to prevent saving unchanged loads
    const hasChanges =
      title !== (initialEntry?.title || "") ||
      content !== (initialEntry?.content || "") ||
      mood !== (initialEntry?.mood || "") ||
      JSON.stringify(tags) !== JSON.stringify(initialEntry?.tags || []) ||
      isPrivate !== (initialEntry?.is_private ?? true) ||
      JSON.stringify(timeLogs) !== JSON.stringify(initialEntry?.time_logs || []);

    if (!hasChanges) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setSaveStatus("saving");
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(true);
    }, 2500); // Auto-save after 2.5s of typing inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, mood, tags, isPrivate, timeLogs, initialEntry]);

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      await onDelete(id);
      success("Journal entry deleted");
      setShowDeleteConfirm(false);
      // Reset state
      setId(undefined);
      setTitle("");
      setContent("");
      setMood("");
      setTags([]);
    } catch (err: any) {
      error(err.message || "Failed to delete entry");
    }
  };

  // Allow inserting prompt from outer widget
  useEffect(() => {
    const handlePromptInsert = (e: CustomEvent<string>) => {
      if (!title) {
        setTitle(e.detail);
      } else {
        setContent((prev) => (prev ? prev + "\n\n" + e.detail : e.detail));
      }
    };
    window.addEventListener("insert_prompt" as any, handlePromptInsert);
    return () => window.removeEventListener("insert_prompt" as any, handlePromptInsert);
  }, [title]);

  return (
    <div className="space-y-6 bg-card border border-border rounded-2xl p-6 md:p-8 calm-shadow relative">
      {/* Date & Privacy Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-xl border border-border">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="bg-transparent text-sm font-medium text-foreground outline-none border-none cursor-pointer p-0"
          />
        </div>

        {/* Auto-save & Status indicator */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            {saveStatus === "saving" && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full"
                />
                <span>Draft saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-4 h-4 text-teal-500" />
                <span className="text-teal-600 dark:text-teal-400 font-medium">Auto-saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <CloudLightning className="w-4 h-4 text-rose-500" />
                <span className="text-rose-500 font-medium">Save failed</span>
              </>
            )}
            {saveStatus === "idle" && (
              <span className="opacity-60 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary/70" /> Private Diary
              </span>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary"
            />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Private</span>
          </label>
        </div>
      </div>

      {/* Mood Selector Component */}
      <MoodSelector selectedMood={mood} onChange={(val) => setMood(val as DiaryEntry["mood"])} />

      {/* Time Tracker Component */}
      <TimeLogger timeLogs={timeLogs} onChange={setTimeLogs} />

      {/* Editor Main Content Area */}
      <div className="space-y-4 pt-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your entry..."
          className="w-full text-xl md:text-2xl font-serif font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/45 py-1 px-0"
        />

        {/* Notebook paper-like lined textarea */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts here..."
            rows={12}
            className="w-full text-base md:text-lg font-serif bg-transparent border-none outline-none text-foreground/90 placeholder:text-muted-foreground/35 leading-relaxed resize-none py-2 px-0 focus:ring-0"
          />
        </div>
      </div>

      {/* Tag Input Component */}
      <TagInput tags={tags} onChange={setTags} />

      {/* Editor Actions Bottom Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
        <div>
          {id && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 transition-all text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Entry</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleSave(false)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl transition-all calm-shadow text-sm font-medium font-sans"
        >
          <Save className="w-4 h-4" />
          <span>Save Journal</span>
        </button>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 calm-shadow relative"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-foreground">Delete Entry?</h3>
                  <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Are you sure you want to delete this journal entry for **{format(new Date(selectedDate), "MMMM d, yyyy")}**?
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-all calm-shadow"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
