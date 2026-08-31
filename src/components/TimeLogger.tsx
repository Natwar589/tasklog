"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Trash2, Clock, Check, BarChart3, Activity, AlertCircle, Sparkles, TrendingUp, Share2 } from "lucide-react";
import { TimeLog } from "@/lib/diaryService";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

interface TimeLoggerProps {
  timeLogs: TimeLog[];
  onChange: (logs: TimeLog[]) => void;
}

const CATEGORIES = [
  { value: "Coding", label: "Coding 💻", color: "from-teal-500/10 to-teal-500/5 border-teal-500/20 text-teal-700 dark:text-teal-300", activeColor: "bg-teal-500 text-white border-teal-500", barColor: "bg-gradient-to-r from-teal-400 to-emerald-400", dotColor: "bg-teal-400" },
  { value: "Meeting", label: "Meeting 🤝", color: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 text-indigo-700 dark:text-indigo-300", activeColor: "bg-indigo-500 text-white border-indigo-500", barColor: "bg-gradient-to-r from-indigo-400 to-blue-400", dotColor: "bg-indigo-400" },
  { value: "Planning", label: "Planning 📋", color: "from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300", activeColor: "bg-amber-500 text-white border-amber-500", barColor: "bg-gradient-to-r from-amber-400 to-orange-400", dotColor: "bg-amber-400" },
  { value: "Learning", label: "Learning 📚", color: "from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-700 dark:text-violet-300", activeColor: "bg-violet-500 text-white border-violet-500", barColor: "bg-gradient-to-r from-violet-400 to-purple-400", dotColor: "bg-violet-400" },
  { value: "Design", label: "Design 🎨", color: "from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-300", activeColor: "bg-rose-500 text-white border-rose-500", barColor: "bg-gradient-to-r from-rose-400 to-pink-400", dotColor: "bg-rose-400" },
  { value: "Break", label: "Break ☕", color: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300", activeColor: "bg-emerald-500 text-white border-emerald-500", barColor: "bg-gradient-to-r from-emerald-400 to-teal-400", dotColor: "bg-emerald-400" },
  { value: "Other", label: "Other ⚙️", color: "from-slate-500/10 to-slate-500/5 border-slate-500/20 text-slate-700 dark:text-slate-300", activeColor: "bg-slate-500 text-white border-slate-500", barColor: "bg-gradient-to-r from-slate-400 to-zinc-400", dotColor: "bg-slate-400" }
];

interface CustomTimeInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function CustomTimeInput({ label, value, onChange }: CustomTimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInitializedScroll, setHasInitializedScroll] = useState(false);

  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // Parse time "HH:MM" (24h) to h (1-12), m (00-55), ap (AM/PM)
  const parsed = useMemo(() => {
    const [hStr, mStr] = value.split(":");
    let h = Number(hStr);
    const ap = h >= 12 ? "PM" : "AM";
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return {
      h: String(h).padStart(2, "0"),
      m: mStr,
      ap
    };
  }, [value]);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")), []);
  const periods = useMemo(() => ["AM", "PM"], []);

  const setTimePart = (part: "h" | "m" | "ap", newVal: string) => {
    let h = Number(part === "h" ? newVal : parsed.h);
    const m = part === "m" ? newVal : parsed.m;
    const ap = part === "ap" ? newVal : parsed.ap;

    if (ap === "PM" && h < 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;

    const formatted24h = `${String(h).padStart(2, "0")}:${m}`;
    onChange(formatted24h);
  };

  // Center initial values on dropdown open
  useEffect(() => {
    if (isOpen && !hasInitializedScroll) {
      const timer = setTimeout(() => {
        const hIndex = hours.indexOf(parsed.h);
        if (hourRef.current) hourRef.current.scrollTop = hIndex * 36;

        const mIndex = minutes.indexOf(parsed.m);
        if (minRef.current) minRef.current.scrollTop = mIndex * 36;

        const pIndex = periods.indexOf(parsed.ap);
        if (periodRef.current) periodRef.current.scrollTop = pIndex * 36;
        
        setHasInitializedScroll(true);
      }, 50);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      setHasInitializedScroll(false);
    }
  }, [isOpen, parsed, hours, minutes, periods, hasInitializedScroll]);

  // Handle Scroll to update active values
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, part: "h" | "m" | "ap") => {
    if (!hasInitializedScroll) return;
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = 36;
    const index = Math.round(scrollTop / itemHeight);
    
    const list = part === "h" ? hours : part === "m" ? minutes : periods;
    if (index >= 0 && index < list.length) {
      const val = list[index];
      if (part === "h" && parsed.h !== val) setTimePart("h", val);
      if (part === "m" && parsed.m !== val) setTimePart("m", val);
      if (part === "ap" && parsed.ap !== val) setTimePart("ap", val);
    }
  };

  // Handle click on specific item (smooth centers it)
  const handleItemClick = (part: "h" | "m" | "ap", val: string, index: number) => {
    setTimePart(part, val);
    const ref = part === "h" ? hourRef : part === "m" ? minRef : periodRef;
    if (ref.current) {
      ref.current.scrollTo({
        top: index * 36,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative space-y-1">
      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{label}</span>
      
      {/* Input-like Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 bg-muted/40 border border-border hover:border-primary/40 focus:border-primary rounded-xl text-sm font-semibold text-foreground transition-all cursor-pointer select-none text-left"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground/80" />
          <span>{parsed.h}:{parsed.m} {parsed.ap}</span>
        </span>
      </button>

      {/* Backdrop overlay to click outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Panel - iOS Alarm Wheel Theme */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-60 bg-card border border-border rounded-2xl calm-shadow p-3 grid grid-cols-3 gap-1.5 z-40 text-center select-none h-[204px] overflow-hidden">
          
          {/* Active indicator bar in absolute center */}
          <div className="absolute left-3 right-3 top-[84px] h-9 border-y border-primary/20 bg-primary/5 pointer-events-none rounded-lg z-10" />

          {/* Hours Column */}
          <div 
            ref={hourRef}
            onScroll={(e) => handleScroll(e, "h")}
            className="h-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 [scrollbar-width:none] [-ms-overflow-style:none] py-[84px]"
          >
            {hours.map((hr, idx) => {
              const isActive = parsed.h === hr;
              return (
                <div 
                  key={hr} 
                  className="h-9 flex items-center justify-center snap-center"
                >
                  <button
                    type="button"
                    onClick={() => handleItemClick("h", hr, idx)}
                    className={`w-full py-1 text-sm font-bold transition-all cursor-pointer ${
                      isActive ? "text-primary scale-110 font-extrabold" : "text-foreground/40 text-xs"
                    }`}
                  >
                    {hr}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Minutes Column */}
          <div 
            ref={minRef}
            onScroll={(e) => handleScroll(e, "m")}
            className="h-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 [scrollbar-width:none] [-ms-overflow-style:none] py-[84px]"
          >
            {minutes.map((mn, idx) => {
              const isActive = parsed.m === mn;
              return (
                <div 
                  key={mn} 
                  className="h-9 flex items-center justify-center snap-center"
                >
                  <button
                    type="button"
                    onClick={() => handleItemClick("m", mn, idx)}
                    className={`w-full py-1 text-sm font-bold transition-all cursor-pointer ${
                      isActive ? "text-primary scale-110 font-extrabold" : "text-foreground/40 text-xs"
                    }`}
                  >
                    {mn}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Period Column */}
          <div 
            ref={periodRef}
            onScroll={(e) => handleScroll(e, "ap")}
            className="h-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 [scrollbar-width:none] [-ms-overflow-style:none] py-[84px]"
          >
            {periods.map((pd, idx) => {
              const isActive = parsed.ap === pd;
              return (
                <div 
                  key={pd} 
                  className="h-9 flex items-center justify-center snap-center"
                >
                  <button
                    type="button"
                    onClick={() => handleItemClick("ap", pd, idx)}
                    className={`w-full py-1 text-sm font-bold transition-all cursor-pointer ${
                      isActive ? "text-primary scale-110 font-extrabold" : "text-foreground/40 text-xs"
                    }`}
                  >
                    {pd}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

export default function TimeLogger({ timeLogs = [], onChange }: TimeLoggerProps) {
  const { success, warning } = useToast();

  // Form states
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [activity, setActivity] = useState("");
  const [category, setCategory] = useState("Coding");
  const [validationError, setValidationError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Sort logs by start time
  const sortedLogs = useMemo(() => {
    return [...timeLogs].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [timeLogs]);

  // Duration Calculator
  const durationInMinutes = (start: string, end: string) => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const totalMinutes = useMemo(() => {
    return sortedLogs.reduce((acc, log) => {
      const duration = durationInMinutes(log.start_time, log.end_time);
      return acc + (duration > 0 ? duration : 0);
    }, 0);
  }, [sortedLogs]);

  const totalHoursFormatted = useMemo(() => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins}m`;
    return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
  }, [totalMinutes]);

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { minutes: number; barColor: string }> = {};
    sortedLogs.forEach((log) => {
      const duration = durationInMinutes(log.start_time, log.end_time);
      if (duration > 0) {
        const catInfo = CATEGORIES.find((c) => c.value === log.category) || CATEGORIES[6];
        if (!breakdown[log.category]) {
          breakdown[log.category] = { minutes: 0, barColor: catInfo.barColor };
        }
        breakdown[log.category].minutes += duration;
      }
    });
    return Object.entries(breakdown).map(([name, data]) => ({
      name,
      minutes: data.minutes,
      percentage: totalMinutes > 0 ? Math.round((data.minutes / totalMinutes) * 100) : 0,
      barColor: data.barColor
    }));
  }, [sortedLogs, totalMinutes]);

  const productivityRating = useMemo(() => {
    const workMinutes = sortedLogs.reduce((acc, log) => {
      if (["Coding", "Meeting", "Planning", "Learning", "Design"].includes(log.category)) {
        const duration = durationInMinutes(log.start_time, log.end_time);
        return acc + (duration > 0 ? duration : 0);
      }
      return acc;
    }, 0);

    const workHours = workMinutes / 60;
    if (workHours === 0) return { label: "Rest & Relax", desc: "No key workspace tasks logged yet.", color: "text-stone-500 bg-stone-500/5 border-stone-500/10 dark:bg-stone-500/[0.02] dark:border-stone-500/10" };
    if (workHours < 2) return { label: "Light Progress", desc: "Getting warmed up with some tasks.", color: "text-sky-600 dark:text-sky-400 bg-sky-500/5 border-sky-500/10" };
    if (workHours < 5) return { label: "Steady Flow", desc: "Healthy progress across key categories.", color: "text-teal-600 dark:text-teal-400 bg-teal-500/5 border-teal-500/10" };
    return { label: "Deep Focus Mode", desc: "Outstanding focus time logged today!", color: "text-violet-600 dark:text-violet-400 bg-violet-500/5 border-violet-500/10" };
  }, [sortedLogs]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) {
      setValidationError("Please specify what task you accomplished.");
      return;
    }

    const duration = durationInMinutes(startTime, endTime);
    if (duration <= 0) {
      setValidationError("End time must be after the start time.");
      return;
    }

    setValidationError("");
    const newLog: TimeLog = {
      id: crypto.randomUUID(),
      start_time: startTime,
      end_time: endTime,
      activity: activity.trim(),
      category: category
    };

    onChange([...timeLogs, newLog]);
    setActivity("");
    setIsFormOpen(false);
  };

  const handleDeleteLog = (id: string) => {
    onChange(timeLogs.filter((log) => log.id !== id));
  };

  const handleCopyLogs = () => {
    if (sortedLogs.length === 0) {
      warning("No time logs to copy.");
      return;
    }
    
    // Format: time log : task done -> e.g. 09:30 - 11:00 : Brainstorming dashboard layout
    const formattedText = sortedLogs
      .map((log) => `${log.start_time} - ${log.end_time} : ${log.activity}`)
      .join("\n");
      
    navigator.clipboard.writeText(formattedText)
      .then(() => success("Time logs exported to clipboard!"))
      .catch(() => warning("Failed to copy logs."));
  };

  return (
    <div className="space-y-6 pt-6 border-t border-border/80 mt-8">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary calm-shadow border border-primary/10">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-foreground tracking-tight flex items-center gap-1.5">
              Timeline & Time Logs
            </h3>
            <p className="text-[11px] text-muted-foreground font-sans font-medium tracking-wide uppercase">Track hourly accomplishments</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {sortedLogs.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleCopyLogs}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl transition-all text-xs font-bold calm-shadow cursor-pointer border border-primary/10"
                title="Copy formatted time logs to clipboard"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy logs</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-semibold calm-shadow text-foreground">
                <span className="text-muted-foreground">Work Hours:</span>
                <span className="text-primary font-bold">{totalHoursFormatted}</span>
              </div>
            </>
          )}
          
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl transition-all text-xs font-bold calm-shadow cursor-pointer"
          >
            <Plus className={`w-3.5 h-3.5 transition-transform duration-300 ${isFormOpen ? "rotate-45" : ""}`} />
            <span>{isFormOpen ? "Close panel" : "Log Task"}</span>
          </button>
        </div>
      </div>

      {/* Expandable Task Input form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, overflow: "hidden" }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transitionEnd: { overflow: "visible" }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              overflow: "hidden"
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <form onSubmit={handleAddLog} className="space-y-4 bg-card border border-border/80 p-5 rounded-2xl calm-shadow">
              
              {/* Row 1: Custom Time Pickers & Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Start Time Custom Picker */}
                <div className="md:col-span-3">
                  <CustomTimeInput
                    label="Start"
                    value={startTime}
                    onChange={setStartTime}
                  />
                </div>

                {/* End Time Custom Picker */}
                <div className="md:col-span-3">
                  <CustomTimeInput
                    label="End"
                    value={endTime}
                    onChange={setEndTime}
                  />
                </div>

                {/* Category selectors (horizontal pills instead of dropdown) */}
                <div className="md:col-span-6 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Select Category</span>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => {
                      const isSelected = category === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setCategory(c.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none ${
                            isSelected
                              ? c.activeColor + " shadow-sm scale-105"
                              : "bg-muted/40 hover:bg-muted/70 text-muted-foreground border-border"
                          }`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 2: Accomplishment input & Add button */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 border-t border-border/40">
                {/* Description Input */}
                <div className="md:col-span-9 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">What task did you log?</span>
                  <input
                    type="text"
                    placeholder="e.g. Redesigned user dashboard UI components"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full p-2.5 bg-muted/40 border border-border rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary focus:bg-card outline-none text-foreground placeholder:text-muted-foreground/45 transition-colors font-medium"
                  />
                </div>

                {/* Button */}
                <div className="md:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-xl transition-all font-bold text-xs calm-shadow flex items-center justify-center gap-1.5 cursor-pointer h-[42px]"
                  >
                    <Check className="w-4 h-4" />
                    <span>Add to Timeline</span>
                  </button>
                </div>
              </div>

              {validationError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main timeline + analytics area */}
      {sortedLogs.length === 0 ? (
        <div className="h-[200px] border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-muted/10">
          <Clock className="w-8 h-8 text-muted-foreground/35 mb-2.5" />
          <h4 className="font-serif font-bold text-sm text-foreground">Timeline is empty</h4>
          <p className="text-xs text-muted-foreground max-w-[320px] mt-1 leading-relaxed">
            Click the "Log Task" button above to track your specific work slots, build your day's schedule, and unlock progress analysis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Chronological Timeline */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" /> Daily Schedule
            </span>

            <div className="relative pl-6 border-l border-border/80 space-y-5 py-2 ml-3">
              <AnimatePresence initial={false}>
                {sortedLogs.map((log) => {
                  const duration = durationInMinutes(log.start_time, log.end_time);
                  const hrs = Math.floor(duration / 60);
                  const mins = duration % 60;
                  const durationText = hrs > 0 ? `${hrs}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
                  const catInfo = CATEGORIES.find((c) => c.value === log.category) || CATEGORIES[6];

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2 }}
                      className="relative group"
                    >
                      {/* Timeline dot with subtle glow */}
                      <div className={`absolute -left-[31.5px] top-2.5 w-2.5 h-2.5 rounded-full ring-4 ring-card ${catInfo.dotColor} calm-shadow`} />

                      {/* Content Card with hover zoom */}
                      <div className="flex items-start justify-between gap-4 p-4 bg-card hover:bg-muted/10 border border-border/80 hover:border-primary/20 rounded-2xl calm-shadow hover:-translate-y-0.5 transition-all duration-300">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground/85" />
                              {log.start_time} - {log.end_time}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground/80">
                              ({durationText})
                            </span>
                            <span className={`text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border bg-gradient-to-br ${catInfo.color}`}>
                              {log.category}
                            </span>
                          </div>

                          <p className="text-sm font-serif text-foreground/90 leading-relaxed pr-2">
                            {log.activity}
                          </p>
                        </div>

                        {/* Delete task button */}
                        <button
                          type="button"
                          onClick={() => log.id && handleDeleteLog(log.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 border border-transparent hover:border-rose-500/10 hover:bg-rose-500/5 text-muted-foreground hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Right panel: Analytics Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> Productivity breakdown
            </span>

            <div className="bg-card border border-border rounded-2xl p-5 calm-shadow space-y-5">
              {/* Productivity Rating widget */}
              <div className={`p-4 rounded-xl border ${productivityRating.color} flex flex-col gap-1 calm-shadow`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-75">Productivity State</span>
                  <Sparkles className="w-4 h-4 opacity-75" />
                </div>
                <span className="text-lg font-serif font-bold tracking-tight">{productivityRating.label}</span>
                <span className="text-xs opacity-90 leading-relaxed">{productivityRating.desc}</span>
              </div>

              {/* Progress bars list */}
              <div className="space-y-4">
                {categoryBreakdown.map((cat) => {
                  const hrs = Math.floor(cat.minutes / 60);
                  const mins = cat.minutes % 60;
                  const durationStr = hrs > 0 ? `${hrs}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;

                  return (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground/80">{cat.name}</span>
                        <span className="font-bold text-muted-foreground">{durationStr} ({cat.percentage}%)</span>
                      </div>
                      
                      {/* Bar Container */}
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden border border-border/40">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.percentage}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className={`h-full rounded-full ${cat.barColor}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
