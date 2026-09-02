"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, SkipForward, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FOCUS_DURATION = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

type Phase = "focus" | "break" | "longbreak";

function playBell() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch {
    // Audio not supported — silently skip
  }
}

export default function PomodoroTimer() {
  const [phase, setPhase] = useState<Phase>("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = phase === "focus" ? FOCUS_DURATION : phase === "break" ? SHORT_BREAK : LONG_BREAK;
  const progress = 1 - secondsLeft / totalSeconds;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  const advancePhase = useCallback(() => {
    playBell();
    setIsRunning(false);
    if (phase === "focus") {
      const next = sessionCount + 1;
      setSessionCount(next);
      if (next % 4 === 0) {
        setPhase("longbreak");
        setSecondsLeft(LONG_BREAK);
      } else {
        setPhase("break");
        setSecondsLeft(SHORT_BREAK);
      }
    } else {
      setPhase("focus");
      setSecondsLeft(FOCUS_DURATION);
    }
  }, [phase, sessionCount]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          advancePhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, advancePhase]);

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(phase === "focus" ? FOCUS_DURATION : phase === "break" ? SHORT_BREAK : LONG_BREAK);
  };

  const phaseColor =
    phase === "focus"
      ? "text-teal-500 stroke-teal-500"
      : phase === "break"
      ? "text-emerald-500 stroke-emerald-500"
      : "text-violet-500 stroke-violet-500";

  const phaseLabel =
    phase === "focus" ? "Focus Time" : phase === "break" ? "Short Break" : "Long Break";

  const phaseBg =
    phase === "focus"
      ? "bg-teal-500/8 border-teal-500/15"
      : phase === "break"
      ? "bg-emerald-500/8 border-emerald-500/15"
      : "bg-violet-500/8 border-violet-500/15";

  return (
    <div className={`bg-card border rounded-2xl p-5 calm-shadow space-y-4 ${phaseBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5 text-primary" />
          Pomodoro Timer
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={phase}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              phase === "focus"
                ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                : phase === "break"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
            }`}
          >
            {phaseLabel}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Circular Progress */}
      <div className="flex items-center justify-center py-2">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Track */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-border"
            />
            {/* Progress */}
            <motion.circle
              cx="50" cy="50" r={radius}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className={phaseColor}
              style={{ strokeDasharray: circumference, strokeDashoffset }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono text-foreground tracking-tight">
              {mins}:{secs}
            </span>
          </div>
        </div>
      </div>

      {/* Session pips */}
      <div className="flex items-center justify-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i < (sessionCount % 4)
                ? "bg-teal-500 scale-110"
                : "bg-border"
            }`}
          />
        ))}
        <span className="text-[10px] text-muted-foreground font-medium ml-1">
          Session {sessionCount + 1}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={reset}
          className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsRunning((p) => !p)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all calm-shadow font-bold ${
            phase === "focus"
              ? "bg-teal-500 hover:bg-teal-600 text-white"
              : phase === "break"
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-violet-500 hover:bg-violet-600 text-white"
          }`}
          title={isRunning ? "Pause" : "Start"}
        >
          <motion.div
            key={isRunning ? "pause" : "play"}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </motion.div>
        </button>

        <button
          onClick={advancePhase}
          className="w-9 h-9 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          title="Skip phase"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
