"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TopBar from "@/components/TopBar";
import DiaryEditor from "@/components/DiaryEditor";
import SidebarWidgets from "@/components/SidebarWidgets";
import { diaryService, DiaryEntry } from "@/lib/diaryService";
import { authService, UserProfile } from "@/lib/authService";

function DashboardContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);

  // Set date from query param or default to today
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(dateParam || today);
  }, [dateParam]);

  // Fetch user profile
  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  // Load entry for selected date and refresh entries/streaks
  const loadDashboardData = async (dateStr: string) => {
    if (!dateStr) return;
    setIsLoadingEntry(true);
    try {
      // Load current date entry
      const fetchedEntry = await diaryService.getEntryByDate(dateStr);
      setEntry(fetchedEntry);

      // Load all entries for lists/streaks
      const allEntries = await diaryService.getEntries();
      setEntries(allEntries);

      // Load streak info
      const currentStreak = await diaryService.getStreak();
      setStreak(currentStreak);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoadingEntry(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadDashboardData(selectedDate);
    }
  }, [selectedDate]);

  const handleSaveEntry = async (
    entryData: Omit<DiaryEntry, "id" | "created_at" | "updated_at"> & { id?: string }
  ) => {
    const saved = await diaryService.saveEntry(entryData);
    
    // Refresh all entries and streak data
    const allEntries = await diaryService.getEntries();
    setEntries(allEntries);
    const currentStreak = await diaryService.getStreak();
    setStreak(currentStreak);

    // Keep entry state current
    setEntry(saved);
    return saved;
  };

  const handleDeleteEntry = async (id: string) => {
    await diaryService.deleteEntry(id);
    // Reload
    loadDashboardData(selectedDate);
  };

  const handleUsePrompt = (prompt: string) => {
    // Dispatch a custom event to insert the prompt text inside the editor
    const event = new CustomEvent("insert_prompt", { detail: prompt });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header bar */}
      <TopBar title="Today's Sanctuary" userName={user?.name} />

      {/* Workspace Area */}
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: The Journal Editor */}
        <div className="lg:col-span-2 space-y-6">
          {isLoadingEntry ? (
            <div className="bg-card border border-border rounded-2xl p-8 calm-shadow h-[500px] flex items-center justify-center">
              <div className="space-y-3 text-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground tracking-wider uppercase font-semibold">
                  Drawing your canvas...
                </p>
              </div>
            </div>
          ) : (
            <DiaryEditor
              initialEntry={entry}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onSave={handleSaveEntry}
              onDelete={handleDeleteEntry}
            />
          )}
        </div>

        {/* Right 1/3: Sidebar Widgets */}
        <div className="lg:col-span-1">
          <SidebarWidgets
            entries={entries}
            streak={streak}
            currentDateStr={selectedDate || new Date().toISOString().split("T")[0]}
            onUsePrompt={handleUsePrompt}
          />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-screen bg-background text-foreground">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

