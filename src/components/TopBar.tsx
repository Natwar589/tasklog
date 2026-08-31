"use client";

import React, { useState } from "react";
import { Moon, Sun, ShieldAlert, Sparkles, X, Database } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { diaryService } from "@/lib/diaryService";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

interface TopBarProps {
  title?: string;
  userName?: string;
}

export default function TopBar({ title, userName }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showSandboxInfo, setShowSandboxInfo] = useState(false);
  const todayStr = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <>
      <header className="flex items-center justify-between py-4 px-6 md:px-8 border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-20">
        <div>
          {userName ? (
            <p className="text-xs text-muted-foreground font-medium tracking-wide">
              Welcome back, <span className="text-foreground/80 font-semibold">{userName}</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground font-medium tracking-wide">{todayStr}</p>
          )}
          <h2 className="font-serif font-semibold text-lg md:text-xl tracking-tight text-foreground">
            {title || "How was your day?"}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Backend connection status indicator */}
          {!diaryService.isBackendEnabled() && (
            <button
              onClick={() => setShowSandboxInfo(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all calm-shadow"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Sandbox Mode</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted text-foreground transition-all calm-shadow relative overflow-hidden"
            aria-label="Toggle dark mode"
          >
            <motion.div
              initial={false}
              animate={{ y: theme === "dark" ? -40 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-10"
            >
              <Sun className="w-5 h-5 text-amber-500 shrink-0" />
              <Moon className="w-5 h-5 text-teal-400 shrink-0" />
            </motion.div>
          </button>
        </div>
      </header>

      {/* Sandbox Explanation Dialog */}
      <AnimatePresence>
        {showSandboxInfo && (
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-6 calm-shadow relative"
            >
              <button
                onClick={() => setShowSandboxInfo(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-foreground">Local Sandbox Mode</h3>
                  <p className="text-xs text-muted-foreground">No database credentials set</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  You are currently operating in **Local Sandbox Mode**. All your journal entries, moods, and settings are
                  securely saved to your browser's **localStorage**.
                </p>
                <p>
                  To sync this app with a database for real-time cloud storage and secure multi-user authentication, add
                  the backend server URL to your client settings or environment:
                </p>
                <pre className="bg-muted p-3 rounded-lg text-xs font-mono text-foreground overflow-x-auto border border-border">
                  NEXT_PUBLIC_API_URL=http://localhost:5000/api
                </pre>
              </div>

              <button
                onClick={() => setShowSandboxInfo(false)}
                className="w-full mt-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/95 transition-all calm-shadow"
              >
                Continue Writing
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
