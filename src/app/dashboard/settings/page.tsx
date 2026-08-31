"use client";

import React, { useState, useEffect } from "react";
import { Settings, ShieldCheck, Download, Trash2, Moon, Sun, AlertTriangle, Cloud, UserCheck, X } from "lucide-react";
import TopBar from "@/components/TopBar";
import { useTheme } from "@/hooks/useTheme";

import { authService, UserProfile } from "@/lib/authService";
import { diaryService } from "@/lib/diaryService";
import { useToast } from "@/components/ui/Toast";
import { AnimatePresence, motion } from "framer-motion";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { success, error, warning } = useToast();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  // Export JSON helper
  const handleExportData = async () => {
    try {
      const entries = await diaryService.getEntries();
      const dataStr = JSON.stringify(entries, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `dailylog_export_${new Date().toISOString().split("T")[0]}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      
      success("Entries exported as JSON file successfully!");
    } catch (err: any) {
      error("Failed to export data");
    }
  };

  const handleDeleteAccountSimulation = () => {
    setShowDeleteConfirm(false);
    warning("Account deletion is simulated. To delete fully, reset your browser cache.");
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Diary Settings" />

      <main className="flex-1 p-6 md:p-8 max-w-2xl mx-auto w-full space-y-6">
        {/* Profile Details */}
        <div className="bg-card border border-border rounded-2xl p-6 calm-shadow space-y-4">
          <h4 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" /> Profile Information
          </h4>

          {user && (
            <div className="flex items-center gap-4 pt-2">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold font-serif text-lg border border-border">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Preferences / Theme */}
        <div className="bg-card border border-border rounded-2xl p-6 calm-shadow space-y-4">
          <h4 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> App Customization
          </h4>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Theme Mode</p>
              <p className="text-xs text-muted-foreground">Toggle between light paper mode and deep dark mode</p>
            </div>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted text-foreground transition-all cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-teal-500" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Data Sync & Export */}
        <div className="bg-card border border-border rounded-2xl p-6 calm-shadow space-y-4">
          <h4 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" /> Sync & Export
          </h4>

          <div className="space-y-4 divide-y divide-border/60">
            {/* Export data */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Backup Journals</p>
                <p className="text-xs text-muted-foreground">Download all your journal entries as a structured JSON file</p>
              </div>

              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-semibold transition-all cursor-pointer calm-shadow"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Storage Provider</p>
                <p className="text-xs text-muted-foreground">
                  {diaryService.isBackendEnabled() ? "Connected to Server Database" : "Saving locally to your web browser"}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  diaryService.isBackendEnabled()
                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{diaryService.isBackendEnabled() ? "Cloud Server" : "Local Sandbox"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card border border-rose-500/10 rounded-2xl p-6 calm-shadow space-y-4">
          <h4 className="font-serif font-bold text-base text-rose-500 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h4>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Delete Diary Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your profile and all written records</p>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </main>

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
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-foreground">Permanently Delete?</h3>
                  <p className="text-xs text-muted-foreground font-semibold uppercase text-rose-500">Irreversible Action</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Are you sure you want to delete your DailyLog account and all associated journals? This action cannot be undone.
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
                  onClick={handleDeleteAccountSimulation}
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
