"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Hash, SlidersHorizontal, Calendar, ArrowRight, Eye, Edit2, Smile } from "lucide-react";
import TopBar from "@/components/TopBar";
import { diaryService, DiaryEntry, MOODS } from "@/lib/diaryService";
import { format } from "date-fns";

export default function TimelinePage() {
  const router = useRouter();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Load entries
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const data = await diaryService.getEntries();
        setEntries(data);
        setFilteredEntries(data);
      } catch (err) {
        console.error("Error loading timeline entries:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, []);

  // Filter processing effect
  useEffect(() => {
    let result = [...entries];

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q)
      );
    }

    // Mood filter match
    if (selectedMood !== "all") {
      result = result.filter((e) => e.mood === selectedMood);
    }

    // Tag filter match
    if (selectedTag !== "all") {
      result = result.filter((e) => e.tags && e.tags.includes(selectedTag));
    }

    setFilteredEntries(result);
  }, [searchQuery, selectedMood, selectedTag, entries]);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(entries.flatMap((e) => e.tags || []))
  ).sort();

  const handleCardClick = (dateStr: string) => {
    router.push(`/dashboard?date=${dateStr}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Your Journal History" />

      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="bg-card border border-border rounded-2xl p-4 calm-shadow space-y-4">
          <div className="flex gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search entries by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 rounded-xl border flex items-center gap-2 text-sm font-medium transition-all cursor-pointer ${
                showFilters || selectedMood !== "all" || selectedTag !== "all"
                  ? "bg-primary/5 border-primary text-primary"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Expanded Filters panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/60">
              {/* Mood Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Filter by Mood</label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm outline-none text-foreground"
                >
                  <option value="all">All Moods</option>
                  {MOODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.emoji} {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Filter by Tag</label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm outline-none text-foreground"
                >
                  <option value="all">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Entries list container */}
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-muted-foreground tracking-wider uppercase font-semibold">
                Gathering memories...
              </p>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          /* Encourgaging Empty State */
          <div className="bg-card border border-border rounded-2xl p-12 text-center calm-shadow space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary mx-auto">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground">No Logs Found</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We couldn't find any entries matching your filters. Try clearing your search query or selecting "All Moods".
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedMood("all");
                setSelectedTag("all");
              }}
              className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((e) => {
              const moodInfo = MOODS.find((m) => m.value === e.mood);
              const formattedDate = format(new Date(e.entry_date), "MMMM d, yyyy");

              return (
                <div
                  key={e.id}
                  onClick={() => handleCardClick(e.entry_date)}
                  className="bg-card border border-border rounded-2xl p-6 calm-shadow hover:border-primary/30 transition-all flex flex-col md:flex-row gap-4 md:items-start justify-between cursor-pointer group"
                >
                  <div className="space-y-3 flex-1">
                    {/* Entry Date, Mood Emoji, and Privacy status */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-muted-foreground border border-border">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>
                      {moodInfo && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gradient-to-br ${moodInfo.color} border border-primary/5`}>
                          <span>{moodInfo.emoji}</span>
                          <span className="capitalize">{moodInfo.label}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-lg md:text-xl text-foreground group-hover:text-primary transition-colors">
                      {e.title || "Untitled log"}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-3 font-serif italic">
                      "{e.content}"
                    </p>

                    {/* Render Tags */}
                    {e.tags && e.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {e.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary/80 uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-md"
                          >
                            <Hash className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 md:items-end justify-end pt-2 md:pt-0 border-t border-border/40 md:border-none">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCardClick(e.entry_date);
                      }}
                      className="p-2 border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-xl transition-all cursor-pointer text-xs font-medium flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
