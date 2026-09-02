"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Compass,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  Trash2,
  X,
  Check,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  GitBranch,
  Target,
  Edit2,
  Clock,
  Search,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  ListTodo,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { motion, AnimatePresence } from "framer-motion";
import {
  roadmapService,
  RoadmapGoal,
  computeGoalProgress,
  ROADMAP_CATEGORIES,
  TIMEFRAMES,
  ROADMAP_COLORS,
} from "@/lib/roadmapService";
import { format } from "date-fns";
import confetti from "canvas-confetti";

// ── Goal Creation & Edit Drawer ──────────────────────────────────────────────
interface GoalDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (goal: Omit<RoadmapGoal, "id" | "createdAt" | "updatedAt">) => void;
  editingGoal?: RoadmapGoal | null;
}

function GoalDrawer({ open, onClose, onSave, editingGoal }: GoalDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [timeframe, setTimeframe] = useState<string>(TIMEFRAMES[0]);
  const [category, setCategory] = useState<RoadmapGoal["category"]>("Project");
  const [priority, setPriority] = useState<RoadmapGoal["priority"]>("High");
  const [status, setStatus] = useState<RoadmapGoal["status"]>("planned");
  const [color, setColor] = useState(ROADMAP_COLORS[0]);
  const [subGoalsText, setSubGoalsText] = useState("");
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (editingGoal) {
        setTitle(editingGoal.title);
        setDescription(editingGoal.description || "");
        setTargetDate(editingGoal.targetDate || "");
        setTimeframe(editingGoal.timeframe || TIMEFRAMES[0]);
        setCategory(editingGoal.category);
        setPriority(editingGoal.priority);
        setStatus(editingGoal.status);
        setColor(editingGoal.color);
        setSubGoalsText(editingGoal.subGoals.map((s) => s.title).join("\n"));
      } else {
        setTitle("");
        setDescription("");
        setTargetDate(new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0]);
        setTimeframe(TIMEFRAMES[0]);
        setCategory("Project");
        setPriority("High");
        setStatus("planned");
        setColor(ROADMAP_COLORS[0]);
        setSubGoalsText("");
      }
      setErr("");
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, editingGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErr("Please give your milestone a clear title.");
      return;
    }
    if (!targetDate) {
      setErr("Please set a target completion date.");
      return;
    }

    const subGoalItems = subGoalsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((lineText) => {
        const existing = editingGoal?.subGoals.find((s) => s.title === lineText);
        return {
          id: existing ? existing.id : `sg-${crypto.randomUUID()}`,
          title: lineText,
          completed: existing ? existing.completed : false,
        };
      });

    onSave({
      title: title.trim(),
      description: description.trim(),
      targetDate,
      timeframe,
      category,
      priority,
      status,
      color,
      subGoals: subGoalItems,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card border-l border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground calm-shadow"
                  style={{ background: color }}
                >
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-foreground">
                    {editingGoal ? "Edit Milestone" : "Add New Milestone"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Define what you want to achieve and key steps to get there
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Goal Title *
                </label>
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Next.js 16 & System Design"
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Description & Why This Matters
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe why this goal is important and what success looks like..."
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40 resize-none leading-relaxed"
                />
              </div>

              {/* Timeframe & Target Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Target Quarter / Phase
                  </label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground outline-none focus:border-primary/50"
                  >
                    {TIMEFRAMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RoadmapGoal["category"])}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground outline-none focus:border-primary/50"
                  >
                    {ROADMAP_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Current Stage
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RoadmapGoal["status"])}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground outline-none focus:border-primary/50"
                  >
                    <option value="planned">📋 Planned</option>
                    <option value="in_progress">🚀 In Progress</option>
                    <option value="completed">✅ Completed</option>
                    <option value="paused">⏸️ Paused</option>
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(["High", "Medium", "Low"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        priority === p
                          ? p === "High"
                            ? "bg-rose-500 text-white border-rose-500"
                            : p === "Medium"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-sky-500 text-white border-sky-500"
                          : "bg-muted/40 text-muted-foreground border-border hover:border-primary/20"
                      }`}
                    >
                      {p === "High" ? "🔥 High" : p === "Medium" ? "⚡ Medium" : "🌱 Low"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color swatch */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Theme Accent
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {ROADMAP_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${
                        color === c ? "scale-125 ring-2 ring-offset-2 ring-offset-card ring-primary" : "hover:scale-110"
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Action deliverables list */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Action Steps & Milestones (one per line)
                </label>
                <textarea
                  value={subGoalsText}
                  onChange={(e) => setSubGoalsText(e.target.value)}
                  rows={4}
                  placeholder="Step 1: Complete online course&#10;Step 2: Build practice project&#10;Step 3: Deploy to production"
                  className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs font-mono text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40 leading-relaxed resize-none"
                />
              </div>

              {err && <p className="text-xs text-rose-500 font-medium">{err}</p>}
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-primary-foreground calm-shadow transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ background: color }}
              >
                <Check className="w-4 h-4" />
                {editingGoal ? "Update Milestone" : "Save Milestone"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Journey Milestone Item (Timeline Stepper) ────────────────────────────────
function JourneyItem({
  goal,
  index,
  total,
  onToggleSubGoal,
  onAddSubGoal,
  onDelete,
  onEdit,
  onStatusChange,
}: {
  goal: RoadmapGoal;
  index: number;
  total: number;
  onToggleSubGoal: (subGoalId: string) => void;
  onAddSubGoal: (title: string) => void;
  onDelete: () => void;
  onEdit: () => void;
  onStatusChange: (status: RoadmapGoal["status"]) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newSubTitle, setNewSubTitle] = useState("");
  const progress = computeGoalProgress(goal);

  const statusConfig = {
    planned: { label: "Planned", icon: Clock, bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
    in_progress: { label: "In Progress", icon: PlayCircle, bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    completed: { label: "Completed", icon: CheckCircle, bg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
    paused: { label: "Paused", icon: PauseCircle, bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  }[goal.status];

  const handleNextStatus = () => {
    const cycle: Record<RoadmapGoal["status"], RoadmapGoal["status"]> = {
      planned: "in_progress",
      in_progress: "completed",
      completed: "planned",
      paused: "in_progress",
    };
    onStatusChange(cycle[goal.status]);
  };

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTitle.trim()) return;
    onAddSubGoal(newSubTitle.trim());
    setNewSubTitle("");
  };

  return (
    <div className="relative flex gap-6 group">
      {/* Vertical Connecting Line */}
      {index < total - 1 && (
        <div className="absolute left-5 top-11 bottom-0 w-0.5 bg-border/80 group-hover:bg-primary/30 transition-colors" />
      )}

      {/* Node Step Icon */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110 shadow-sm"
          style={{
            background: goal.status === "completed" ? "#14b8a6" : goal.color,
            color: "#ffffff",
          }}
        >
          {goal.status === "completed" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
      </div>

      {/* Milestone Card Body */}
      <motion.div
        layout
        className="flex-1 bg-card border border-border/80 rounded-2xl p-5 calm-shadow transition-all hover:border-border hover:shadow-md mb-6"
        style={{ borderLeft: `3.5px solid ${goal.color}` }}
      >
        {/* Top bar */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Cycle Status Button */}
              <button
                onClick={handleNextStatus}
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-all hover:scale-105 cursor-pointer flex items-center gap-1 ${statusConfig.bg}`}
                title="Click to cycle status"
              >
                <statusConfig.icon className="w-3 h-3" />
                <span>{statusConfig.label}</span>
              </button>

              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: goal.color + "20", color: goal.color }}
              >
                {goal.category}
              </span>

              <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {goal.timeframe}
              </span>

              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                  goal.priority === "High"
                    ? "bg-rose-500/10 text-rose-500"
                    : goal.priority === "Medium"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-sky-500/10 text-sky-500"
                }`}
              >
                {goal.priority}
              </span>
            </div>

            <h3
              className={`text-base font-serif font-bold text-foreground tracking-tight leading-snug ${
                goal.status === "completed" ? "line-through text-muted-foreground/80" : ""
              }`}
            >
              {goal.title}
            </h3>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Edit milestone"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
              title="Delete milestone"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Narrative Description */}
        {goal.description && (
          <p className="text-xs text-muted-foreground/90 mt-2 leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/40 font-sans">
            {goal.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3 text-primary" /> Milestone Progress
            </span>
            <span className="font-bold text-foreground text-xs">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full transition-all"
              style={{ background: goal.color }}
            />
          </div>
        </div>

        {/* Action Steps Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-3 border-t border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span>Target: {format(new Date(goal.targetDate), "MMMM d, yyyy")}</span>
          </div>

          {goal.subGoals.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>
                {goal.subGoals.filter((s) => s.completed).length} of {goal.subGoals.length} Steps Done
              </span>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          )}
        </div>

        {/* Sub-goals list */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-border/50 space-y-2"
            >
              <div className="space-y-1.5">
                {goal.subGoals.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onToggleSubGoal(sub.id)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    <div className="shrink-0">
                      {sub.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/40" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium leading-snug flex-1 ${
                        sub.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Inline add next action step */}
              <form onSubmit={handleAddSub} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newSubTitle}
                  onChange={(e) => setNewSubTitle(e.target.value)}
                  placeholder="Add next step..."
                  className="flex-1 px-3 py-1.5 bg-muted/40 border border-border rounded-xl text-xs text-foreground outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition-all shrink-0"
                >
                  Add Step
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [goals, setGoals] = useState<RoadmapGoal[]>([]);
  const [view, setView] = useState<"journey" | "cards">("journey");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingGoal, setEditingGoal] = useState<RoadmapGoal | null>(null);

  const reload = () => setGoals(roadmapService.getAll());
  useEffect(() => {
    reload();
  }, []);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchCat = selectedCategory === "All" || g.category === selectedCategory;
      const matchStatus = selectedStatus === "All" || g.status === selectedStatus;
      const matchSearch =
        !searchQuery.trim() ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    });
  }, [goals, selectedCategory, selectedStatus, searchQuery]);

  // Key metrics
  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const inProgress = goals.filter((g) => g.status === "in_progress").length;
    const planned = goals.filter((g) => g.status === "planned").length;
    const overallProgress =
      total > 0
        ? Math.round(
            goals.reduce((acc, g) => acc + computeGoalProgress(g), 0) / total
          )
        : 0;
    return { total, completed, inProgress, planned, overallProgress };
  }, [goals]);

  const handleSaveGoal = (goalData: Omit<RoadmapGoal, "id" | "createdAt" | "updatedAt">) => {
    if (editingGoal) {
      roadmapService.update(editingGoal.id, goalData);
    } else {
      roadmapService.add(goalData);
    }
    reload();
    setEditingGoal(null);
  };

  const handleToggleSubGoal = (goalId: string, subGoalId: string) => {
    roadmapService.toggleSubGoal(goalId, subGoalId);
    reload();
  };

  const handleAddSubGoal = (goalId: string, title: string) => {
    roadmapService.addSubGoal(goalId, title);
    reload();
  };

  const handleDeleteGoal = (goalId: string) => {
    roadmapService.delete(goalId);
    reload();
  };

  const handleStatusChange = (goalId: string, status: RoadmapGoal["status"]) => {
    roadmapService.update(goalId, { status });
    if (status === "completed") {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#14b8a6", "#6366f1", "#f59e0b"],
      });
    }
    reload();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Roadmap & Long-Term Goals" />

      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">

        {/* ── Summary Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedStatus("All")}
            className={`text-left p-4 rounded-2xl border transition-all calm-shadow ${
              selectedStatus === "All"
                ? "bg-card border-primary ring-1 ring-primary/30"
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Total Goals
            </span>
            <p className="text-2xl font-serif font-bold text-foreground mt-1">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">All strategic items</p>
          </button>

          <button
            onClick={() => setSelectedStatus("in_progress")}
            className={`text-left p-4 rounded-2xl border transition-all calm-shadow ${
              selectedStatus === "in_progress"
                ? "bg-card border-amber-500 ring-1 ring-amber-500/30"
                : "bg-card border-border hover:border-amber-500/30"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 block">
              In Progress
            </span>
            <p className="text-2xl font-serif font-bold text-foreground mt-1">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Currently active</p>
          </button>

          <button
            onClick={() => setSelectedStatus("completed")}
            className={`text-left p-4 rounded-2xl border transition-all calm-shadow ${
              selectedStatus === "completed"
                ? "bg-card border-teal-500 ring-1 ring-teal-500/30"
                : "bg-card border-border hover:border-teal-500/30"
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400 block">
              Completed
            </span>
            <p className="text-2xl font-serif font-bold text-foreground mt-1">{stats.completed}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Unlocked milestones</p>
          </button>

          <div className="bg-gradient-to-br from-primary/10 to-teal-500/10 border border-primary/20 rounded-2xl p-4 calm-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Overall Progress
              </span>
              <span className="text-xs font-bold text-foreground">{stats.overallProgress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Toolbar: Search, Category Filters, View Switcher & Add ──── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Search + Category Filter */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milestones..."
                className="w-full pl-8 pr-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-xl text-xs font-medium text-foreground outline-none focus:border-primary/50 transition-colors cursor-pointer"
            >
              <option value="All">All Categories</option>
              {ROADMAP_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Right Toolbar: View Switcher & Create Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted/40 border border-border rounded-xl p-1 gap-1">
              <button
                onClick={() => setView("journey")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  view === "journey"
                    ? "bg-card text-foreground calm-shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" /> Journey
              </button>
              <button
                onClick={() => setView("cards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  view === "cards"
                    ? "bg-card text-foreground calm-shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grid
              </button>
            </div>

            <button
              onClick={() => {
                setEditingGoal(null);
                setShowDrawer(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-xl text-xs font-bold calm-shadow transition-all"
            >
              <Plus className="w-4 h-4" /> Add Milestone
            </button>
          </div>
        </div>

        {/* ── View 1: Step-by-Step Journey View ─────────────────────── */}
        {view === "journey" ? (
          <div className="pt-4 space-y-1">
            {filteredGoals.length === 0 ? (
              <div className="p-12 border border-dashed border-border/80 rounded-2xl text-center bg-muted/10 space-y-3">
                <Compass className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <h4 className="font-serif font-bold text-base text-foreground">No milestones found</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || selectedCategory !== "All" || selectedStatus !== "All"
                    ? "Try clearing your filters or search query."
                    : "Add your first long-term milestone to build your journey."}
                </p>
                <button
                  onClick={() => {
                    setEditingGoal(null);
                    setShowDrawer(true);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition-all inline-block mt-2"
                >
                  + Create Your First Goal
                </button>
              </div>
            ) : (
              filteredGoals.map((goal, index) => (
                <JourneyItem
                  key={goal.id}
                  goal={goal}
                  index={index}
                  total={filteredGoals.length}
                  onToggleSubGoal={(subId) => handleToggleSubGoal(goal.id, subId)}
                  onAddSubGoal={(subTitle) => handleAddSubGoal(goal.id, subTitle)}
                  onDelete={() => handleDeleteGoal(goal.id)}
                  onEdit={() => {
                    setEditingGoal(goal);
                    setShowDrawer(true);
                  }}
                  onStatusChange={(newStatus) => handleStatusChange(goal.id, newStatus)}
                />
              ))
            )}
          </div>
        ) : (
          /* ── View 2: Simple Grid Cards View ───────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {filteredGoals.map((goal, index) => (
              <JourneyItem
                key={goal.id}
                goal={goal}
                index={index}
                total={1} // no connecting line in grid
                onToggleSubGoal={(subId) => handleToggleSubGoal(goal.id, subId)}
                onAddSubGoal={(subTitle) => handleAddSubGoal(goal.id, subTitle)}
                onDelete={() => handleDeleteGoal(goal.id)}
                onEdit={() => {
                  setEditingGoal(goal);
                  setShowDrawer(true);
                }}
                onStatusChange={(newStatus) => handleStatusChange(goal.id, newStatus)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Goal Drawer */}
      <GoalDrawer
        open={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
      />
    </div>
  );
}
