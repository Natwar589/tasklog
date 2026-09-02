"use client";

import { useEffect, useCallback } from "react";

const REMINDER_KEY = "dailylog_reminder";
const REMINDER_ENABLED_KEY = "dailylog_reminder_enabled";

function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    // Play two-tone chime
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // AudioContext blocked or not supported
  }
}

export function useStreakReminder() {
  const requestPermission = useCallback(async (): Promise<NotificationPermission | "unsupported"> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    if (Notification.permission === "granted") return "granted";
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch {
      return Notification.permission;
    }
  }, []);

  const setReminder = useCallback((timeStr: string, enabled: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(REMINDER_KEY, timeStr);
    localStorage.setItem(REMINDER_ENABLED_KEY, String(enabled));
  }, []);

  const getReminderSettings = useCallback((): { time: string; enabled: boolean } => {
    if (typeof window === "undefined") return { time: "21:00", enabled: false };
    const time = localStorage.getItem(REMINDER_KEY) || "21:00";
    const enabled = localStorage.getItem(REMINDER_ENABLED_KEY) === "true";
    return { time, enabled };
  }, []);

  const sendTestNotification = useCallback(
    async (
      onFeedback?: (type: "success" | "warning" | "info", message: string) => void
    ) => {
      // Play audio chime
      playNotificationChime();

      if (typeof window === "undefined" || !("Notification" in window)) {
        onFeedback?.(
          "warning",
          "Browser notifications not supported on this device. (In-app sound played)"
        );
        return;
      }

      let permission = Notification.permission;
      if (permission === "default") {
        try {
          permission = await Notification.requestPermission();
        } catch {
          permission = Notification.permission;
        }
      }

      if (permission === "granted") {
        try {
          new Notification("DailyLog Reminder 🌟", {
            body: "Don't forget to log your day! Take a moment to reflect.",
            icon: "/favicon.ico",
          });
          onFeedback?.("success", "Test notification sent & chime played!");
        } catch (e: unknown) {
          console.warn("Notification constructor error:", e);
          onFeedback?.(
            "info",
            "Test notification triggered! (Check OS Notification Center or browser permission settings)"
          );
        }
      } else if (permission === "denied") {
        onFeedback?.(
          "warning",
          "Notifications are blocked in your browser settings. (Chime sound played)"
        );
      } else {
        onFeedback?.("info", "Test chime played. Please allow notification permissions.");
      }
    },
    []
  );

  // Check every minute if it's time to remind
  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = () => {
      const { time, enabled } = getReminderSettings();
      if (!enabled) return;
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const now = new Date();
      const [rH, rM] = time.split(":").map(Number);
      const isTime = now.getHours() === rH && now.getMinutes() === rM;

      // Use a daily cooldown — only fire once per day
      const lastKey = "dailylog_reminder_last";
      const lastFired = localStorage.getItem(lastKey);
      const todayStr = now.toISOString().split("T")[0];

      if (isTime && lastFired !== todayStr) {
        localStorage.setItem(lastKey, todayStr);
        playNotificationChime();
        try {
          new Notification("DailyLog Reminder 🌟", {
            body: "Time to log your day! Reflect and track your progress.",
            icon: "/favicon.ico",
          });
        } catch (e) {
          console.warn("Daily notification failed", e);
        }
      }
    };

    const interval = setInterval(check, 60_000);
    check();
    return () => clearInterval(interval);
  }, [getReminderSettings]);

  return { requestPermission, setReminder, getReminderSettings, sendTestNotification };
}
