"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { DiaryEntry, MOODS } from "@/lib/diaryService";

interface ExportButtonProps {
  entry: DiaryEntry | null;
  selectedDate: string;
}

export default function ExportButton({ entry, selectedDate }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!entry && !selectedDate) return;
    setExporting(true);

    try {
      // Dynamic import so jspdf is only loaded when needed (code-splits it)
      const jspdfModule = await import("jspdf");
      const jsPDF = jspdfModule.jsPDF || (jspdfModule as any).default;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageW = 210;
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ── Header band ──────────────────────────────────────────────
      doc.setFillColor(17, 94, 89); // teal primary
      doc.rect(0, 0, pageW, 22, "F");

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(250, 249, 246);
      doc.text("DailyLog", margin, 14);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 235, 230);
      doc.text("Your Personal Journal", margin + 38, 14);

      // Date on right
      const dateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const dateW = doc.getTextWidth(dateLabel);
      doc.text(dateLabel, pageW - margin - dateW, 14);
      y = 34;

      // ── Title ────────────────────────────────────────────────────
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 42, 38);
      const title = entry?.title || "Untitled Entry";
      doc.text(title, margin, y);
      y += 10;

      // ── Mood pill ───────────────────────────────────────────────
      if (entry?.mood) {
        const moodInfo = MOODS.find((m) => m.value === entry.mood);
        if (moodInfo) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setFillColor(244, 241, 234);
          doc.roundedRect(margin, y - 5, 40, 8, 2, 2, "F");
          doc.setTextColor(17, 94, 89);
          doc.text(`${moodInfo.emoji}  ${moodInfo.label}`, margin + 3, y + 0.5);
          y += 12;
        }
      }

      // ── Tags ─────────────────────────────────────────────────────
      if (entry?.tags && entry.tags.length > 0) {
        doc.setFontSize(8);
        doc.setTextColor(120, 113, 108);
        doc.text(entry.tags.map((t) => `#${t}`).join("  "), margin, y);
        y += 8;
      }

      // Divider
      doc.setDrawColor(240, 237, 230);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      // ── Content ──────────────────────────────────────────────────
      if (entry?.content) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(45, 42, 38);
        const lines = doc.splitTextToSize(entry.content, contentW);
        lines.forEach((line: string) => {
          if (y > 265) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 6;
        });
        y += 6;
      }

      // ── Gratitude ─────────────────────────────────────────────────
      if (entry?.gratitude && entry.gratitude.length > 0) {
        if (y > 240) { doc.addPage(); y = margin; }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(17, 94, 89);
        doc.text("Gratitude", margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(45, 42, 38);
        entry.gratitude.forEach((g, i) => {
          if (y > 270) { doc.addPage(); y = margin; }
          doc.text(`${i + 1}. ${g}`, margin + 2, y);
          y += 6;
        });
        y += 4;
      }

      // ── Time Logs ────────────────────────────────────────────────
      if (entry?.time_logs && entry.time_logs.length > 0) {
        if (y > 220) { doc.addPage(); y = margin; }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(17, 94, 89);
        doc.text("Time Logs", margin, y);
        y += 7;

        // Table header
        doc.setFillColor(244, 241, 234);
        doc.rect(margin, y - 4, contentW, 7, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(120, 113, 108);
        doc.text("TIME", margin + 2, y + 0.5);
        doc.text("ACTIVITY", margin + 32, y + 0.5);
        doc.text("CATEGORY", margin + 120, y + 0.5);
        doc.text("PRIORITY", margin + 155, y + 0.5);
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(45, 42, 38);
        entry.time_logs.forEach((log) => {
          if (y > 270) { doc.addPage(); y = margin; }
          doc.setDrawColor(240, 237, 230);
          doc.line(margin, y - 1, pageW - margin, y - 1);
          doc.text(`${log.start_time}–${log.end_time}`, margin + 2, y + 4);
          const actLines = doc.splitTextToSize(log.activity, 80);
          doc.text(actLines[0], margin + 32, y + 4);
          doc.text(log.category, margin + 120, y + 4);
          doc.text(log.priority || "—", margin + 155, y + 4);
          y += 8;

          if (log.description) {
            doc.setFontSize(7.5);
            doc.setTextColor(100, 95, 90);
            const descLines = doc.splitTextToSize(`Note: ${log.description}`, 150);
            descLines.forEach((dLine: string) => {
              if (y > 275) { doc.addPage(); y = margin; }
              doc.text(dLine, margin + 32, y);
              y += 4;
            });
            doc.setFontSize(9);
            doc.setTextColor(45, 42, 38);
          }
        });
        y += 4;
      }

      // ── Footer ───────────────────────────────────────────────────
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(178, 170, 160);
        doc.text(`DailyLog export  •  ${new Date().toLocaleDateString()}  •  Page ${p} of ${totalPages}`, margin, 290);
      }

      doc.save(`dailylog-${selectedDate}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting || !entry}
      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-card border border-border hover:border-primary/30 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed calm-shadow"
      title="Export as PDF"
    >
      {exporting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      <span>Export PDF</span>
    </button>
  );
}
