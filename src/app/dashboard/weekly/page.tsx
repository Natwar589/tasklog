"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Trash2, CheckCircle2, Circle, X, Check, Clock,
  Flame, ChevronLeft, ChevronRight, Sparkles, Target,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { motion, AnimatePresence } from "framer-motion";
import {
  weeklyService, WeeklyTask, TASK_CATEGORIES, TASK_COLORS, DAYS, DAYS_FULL,
} from "@/lib/weeklyService";
import { format, startOfWeek, addDays } from "date-fns";

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function durationLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
}

// ── Add Task Drawer ──────────────────────────────────────────────────────────
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (t: Omit<WeeklyTask, "id" | "createdAt" | "completedDates">) => void;
  defaultDay?: number;
}

function AddTaskDrawer({ open, onClose, onAdd, defaultDay }: DrawerProps) {
  const [title, setTitle] = useState("");
  const [days, setDays] = useState<number[]>(defaultDay !== undefined ? [defaultDay] : [0, 1, 2, 3, 4]);
  const [timeSlot, setTimeSlot] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState("Coding");
  const [priority, setPriority] = useState<"P1" | "P2" | "P3" | "">("");
  const [color, setColor] = useState(TASK_COLORS[0]);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(""); setErr("");
      if (defaultDay !== undefined) setDays([defaultDay]);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, defaultDay]);

  const toggleDay = (d: number) =>
    setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d].sort()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErr("Please enter a task title."); return; }
    if (days.length === 0) { setErr("Pick at least one day."); return; }
    onAdd({ title: title.trim(), days, timeSlot, duration, category, priority, color });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sliding panel */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border flex flex-col"
            style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
              <div>
                <h2 className="font-serif font-bold text-lg text-foreground">New Task</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Add a recurring task to your week</p>
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

              {/* Color strip preview */}
              <div
                className="h-1.5 rounded-full w-full transition-all"
                style={{ background: color }}
              />

              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Task Name</label>
                <input
                  ref={inputRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What do you want to do?"
                  className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Days */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Repeat on</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS.map((d, i) => (
                    <button
                      key={d} type="button" onClick={() => toggleDay(i)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        days.includes(i)
                          ? "text-primary-foreground border-transparent"
                          : "bg-muted/40 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                      }`}
                      style={days.includes(i) ? { background: color } : {}}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Start Time</label>
                  <input
                    type="time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Duration</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={5} max={480} step={5}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-muted/40 border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary/50 transition-colors pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">min</span>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {TASK_CATEGORIES.map((c) => (
                    <button
                      key={c} type="button"
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        category === c
                          ? "text-primary-foreground border-transparent"
                          : "bg-muted/40 text-muted-foreground border-border hover:border-primary/30"
                      }`}
                      style={category === c ? { background: color } : {}}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Priority</label>
                <div className="flex gap-2">
                  {([{ v: "P1", label: "🔴 Critical", bg: "#ef4444" }, { v: "P2", label: "🟡 Normal", bg: "#f59e0b" }, { v: "P3", label: "🔵 Low", bg: "#3b82f6" }] as const).map(({ v, label, bg }) => (
                    <button
                      key={v} type="button"
                      onClick={() => setPriority(priority === v ? "" : v)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        priority === v ? "text-white border-transparent" : "bg-muted/40 text-muted-foreground border-border hover:border-primary/20"
                      }`}
                      style={priority === v ? { background: bg } : {}}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Task Color</label>
                <div className="flex gap-2.5 flex-wrap">
                  {TASK_COLORS.map((c) => (
                    <button
                      key={c} type="button" onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-all ${color === c ? "scale-125 ring-2 ring-offset-2 ring-offset-card ring-primary" : "hover:scale-110"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              {err && (
                <p className="text-xs text-rose-500 font-medium">{err}</p>
              )}
            </form>

            {/* Footer actions */}
            <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
              <button
                type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-primary-foreground calm-shadow transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
                style={{ background: color }}
              >
                <Check className="w-4 h-4" /> Add to Planner
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({
  task, dateStr, onToggle, onDelete,
}: {
  task: WeeklyTask; dateStr: string; onToggle: () => void; onDelete: () => void;
}) {
  const done = weeklyService.isCompleted(task, dateStr);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className={`group relative rounded-2xl border border-border/60 bg-card p-3.5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${done ? "opacity-60" : ""}`}
      style={{ borderLeft: `3px solid ${task.color}` }}
      onClick={onToggle}
    >
      <div className="flex items-start gap-2.5">
        {/* Checkbox */}
        <div className="mt-0.5 shrink-0 transition-transform">
          {done
            ? <CheckCircle2 className="w-4.5 h-4.5" style={{ color: task.color, width: 18, height: 18 }} />
            : <Circle className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" style={{ width: 18, height: 18 }} />
          }
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title */}
          <p className={`text-sm font-semibold leading-snug ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {task.title}
          </p>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground">
              <Clock style={{ width: 10, height: 10 }} />
              {fmt12(task.timeSlot)}
            </span>
            <span className="text-muted-foreground/40 text-[10px]">·</span>
            <span className="text-[10px] font-bold text-muted-foreground">{durationLabel(task.duration)}</span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: task.color + "20", color: task.color }}
            >
              {task.category}
            </span>
            {task.priority && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                task.priority === "P1" ? "bg-rose-500/10 text-rose-500"
                : task.priority === "P2" ? "bg-amber-500/10 text-amber-500"
                : "bg-sky-500/10 text-sky-500"
              }`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
        >
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Circular progress ring ───────────────────────────────────────────────────
function ProgressRing({ pct, size = 36, stroke = 3.5, color }: { pct: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-border" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function WeeklyPlannerPage() {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [defaultDay, setDefaultDay] = useState<number | undefined>(undefined);
  const [weekOffset, setWeekOffset] = useState(0);

  const reload = () => setTasks(weeklyService.getAll());
  useEffect(() => { reload(); }, []);

  const weekDates = useMemo(() => {
    const base = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(base, i));
  }, [weekOffset]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayDayIdx = (new Date().getDay() + 6) % 7;

  // Overall week stats
  const weekStats = useMemo(() => {
    let total = 0, done = 0;
    weekDates.forEach((d, di) => {
      const ds = d.toISOString().split("T")[0];
      tasks.filter((t) => t.days.includes(di)).forEach((t) => {
        total++;
        if (weeklyService.isCompleted(t, ds)) done++;
      });
    });
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [tasks, weekDates]);

  // Today's tasks
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.days.includes(todayDayIdx)).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)),
    [tasks, todayDayIdx]
  );
  const todayDone = todayTasks.filter((t) => weeklyService.isCompleted(t, todayStr)).length;

  const openDrawer = (day?: number) => { setDefaultDay(day); setShowDrawer(true); };
  const handleAdd = (t: Omit<WeeklyTask, "id" | "createdAt" | "completedDates">) => { weeklyService.add(t); reload(); };
  const handleToggle = (id: string, ds: string) => { weeklyService.toggleComplete(id, ds); reload(); };
  const handleDelete = (id: string) => { weeklyService.delete(id); reload(); };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Weekly Planner" />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ── Hero stats bar ───────────────────────────────────────── */}
        <div className="shrink-0 px-6 md:px-8 py-5 border-b border-border bg-card/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">

            {/* Left: week title + navigator */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWeekOffset((p) => p - 1)}
                className="w-8 h-8 rounded-xl border border-border bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  {weekOffset === 0 ? "This Week" : weekOffset === -1 ? "Last Week" : `${Math.abs(weekOffset)} weeks ago`}
                </p>
                <h3 className="font-serif font-bold text-foreground text-base leading-tight">
                  {format(weekDates[0], "MMM d")} – {format(weekDates[6], "MMM d, yyyy")}
                </h3>
              </div>
              <button
                onClick={() => setWeekOffset((p) => p + 1)}
                disabled={weekOffset >= 0}
                className="w-8 h-8 rounded-xl border border-border bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wide"
                >
                  → Today
                </button>
              )}
            </div>

            {/* Right: stats + add */}
            <div className="flex items-center gap-3">
              {/* Today focus pill */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-muted/40 border border-border rounded-2xl">
                <div className="relative">
                  <ProgressRing pct={todayTasks.length > 0 ? Math.round((todayDone / todayTasks.length) * 100) : 0} color="#14b8a6" size={32} stroke={3} />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-teal-500">
                    {todayTasks.length > 0 ? `${Math.round((todayDone / todayTasks.length) * 100)}%` : "—"}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Today</p>
                  <p className="text-xs font-bold text-foreground">{todayDone}/{todayTasks.length} done</p>
                </div>
              </div>

              {/* Week pill */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-muted/40 border border-border rounded-2xl">
                <div className="relative">
                  <ProgressRing pct={weekStats.pct} color="#6366f1" size={32} stroke={3} />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-indigo-500">
                    {weekStats.pct}%
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Week</p>
                  <p className="text-xs font-bold text-foreground">{weekStats.done}/{weekStats.total} done</p>
                </div>
              </div>

              <button
                onClick={() => openDrawer(todayDayIdx)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl text-sm font-bold calm-shadow transition-all"
              >
                <Plus className="w-4 h-4" /> New Task
              </button>
            </div>
          </div>
        </div>

        {/* ── Kanban board ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 h-full px-6 md:px-8 py-6 min-w-max max-w-none">
            {weekDates.map((d, dayIdx) => {
              const dateStr = d.toISOString().split("T")[0];
              const isToday = dateStr === todayStr;
              const dayTasks = tasks
                .filter((t) => t.days.includes(dayIdx))
                .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
              const doneTasks = dayTasks.filter((t) => weeklyService.isCompleted(t, dateStr));
              const pct = dayTasks.length > 0 ? Math.round((doneTasks.length / dayTasks.length) * 100) : 0;

              return (
                <div
                  key={dayIdx}
                  className={`flex flex-col w-64 shrink-0 rounded-2xl border transition-all ${
                    isToday
                      ? "border-primary/30 bg-gradient-to-b from-primary/5 to-transparent"
                      : "border-border bg-muted/10"
                  }`}
                >
                  {/* Column header */}
                  <div className={`px-4 py-3.5 border-b ${isToday ? "border-primary/20" : "border-border/60"} shrink-0`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center font-bold text-center ${
                            isToday ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
                          }`}
                        >
                          <span className="text-[8px] uppercase tracking-wider font-bold leading-none">{DAYS[dayIdx]}</span>
                          <span className="text-base font-bold leading-tight">{format(d, "d")}</span>
                        </div>
                        <div>
                          <p className={`text-xs font-bold leading-none ${isToday ? "text-primary" : "text-foreground/80"}`}>
                            {DAYS_FULL[dayIdx].slice(0, 3)}
                            {isToday && <span className="ml-1.5 text-[8px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full align-middle uppercase tracking-wide font-bold">Today</span>}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{format(d, "MMM d")}</p>
                        </div>
                      </div>

                      {/* Add button */}
                      <button
                        onClick={() => openDrawer(dayIdx)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                          isToday
                            ? "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress row */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={`h-full rounded-full ${isToday ? "bg-primary" : "bg-foreground/30"}`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                        {doneTasks.length}/{dayTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Task list */}
                  <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-[200px]">
                    <AnimatePresence initial={false}>
                      {dayTasks.length === 0 ? (
                        <button
                          key="empty"
                          onClick={() => openDrawer(dayIdx)}
                          className="w-full h-24 flex flex-col items-center justify-center gap-2 text-muted-foreground/40 border-2 border-dashed border-border/40 rounded-2xl hover:border-primary/30 hover:text-muted-foreground transition-all group"
                        >
                          <Plus className="w-5 h-5 group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Add a task</span>
                        </button>
                      ) : (
                        dayTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            dateStr={dateStr}
                            onToggle={() => handleToggle(task.id, dateStr)}
                            onDelete={() => handleDelete(task.id)}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Column footer — add link if there are tasks */}
                  {dayTasks.length > 0 && (
                    <button
                      onClick={() => openDrawer(dayIdx)}
                      className="shrink-0 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold text-muted-foreground hover:text-primary uppercase tracking-wider border-t border-border/50 transition-colors rounded-b-2xl"
                    >
                      <Plus className="w-3 h-3" /> Add task
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Today's focus strip ──────────────────────────────────── */}
        {todayTasks.length > 0 && weekOffset === 0 && (
          <div className="shrink-0 px-6 md:px-8 py-4 border-t border-border bg-card/40 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground shrink-0">Today&apos;s Focus</span>
                </div>
                <div className="flex items-center gap-2 flex-nowrap">
                  {todayTasks.map((task) => {
                    const done = weeklyService.isCompleted(task, todayStr);
                    return (
                      <button
                        key={task.id}
                        onClick={() => handleToggle(task.id, todayStr)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all hover:scale-105 ${done ? "opacity-50" : ""}`}
                        style={{
                          background: task.color + "15",
                          borderColor: task.color + "30",
                          color: task.color,
                        }}
                      >
                        {done
                          ? <CheckCircle2 style={{ width: 12, height: 12 }} />
                          : <Circle style={{ width: 12, height: 12 }} />
                        }
                        <span className={done ? "line-through" : ""}>{task.title}</span>
                        <span className="opacity-60">{fmt12(task.timeSlot)}</span>
                      </button>
                    );
                  })}
                </div>
                {todayDone === todayTasks.length && todayTasks.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0 text-teal-500 font-bold text-xs">
                    <Flame className="w-4 h-4" /> All done! 🎉
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Drawer */}
      <AddTaskDrawer
        open={showDrawer}
        onClose={() => { setShowDrawer(false); setDefaultDay(undefined); }}
        onAdd={handleAdd}
        defaultDay={defaultDay}
      />
    </div>
  );
}
