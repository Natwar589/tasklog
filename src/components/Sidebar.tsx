"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Calendar, BookText, BarChart3, Settings, LogOut, Sparkles, LineChart, CalendarCheck, Compass } from "lucide-react";
import { authService, UserProfile } from "@/lib/authService";
import { useToast } from "@/components/ui/Toast";

interface SidebarProps {
  user: UserProfile | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { success, error } = useToast();

  const handleLogout = async () => {
    try {
      await authService.logout();
      success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (err: any) {
      error(err.message || "Failed to log out");
    }
  };

  const navItems = [
    { name: "Today", href: "/dashboard", icon: BookOpen },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Timeline", href: "/dashboard/timeline", icon: BookText },
    { name: "Weekly", href: "/dashboard/weekly", icon: CalendarCheck },
    { name: "Roadmap", href: "/dashboard/roadmap", icon: Compass },
    { name: "Moods", href: "/dashboard/mood", icon: BarChart3 },
    { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0 shrink-0 p-6 z-10">
        {/* App Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground calm-shadow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-lg tracking-wide text-foreground">DailyLog</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase font-medium">Calm Sanctuary</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-colors relative ${
                  isActive
                    ? "text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 bg-primary rounded-xl -z-10 calm-shadow"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground/80"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-border mt-auto space-y-4">
          {user && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold font-serif text-sm border border-border">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/85 backdrop-blur-md border-t border-border px-4 py-2 flex justify-around items-center z-30 shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-5.5 h-5.5" />
              <span className="text-[10px] tracking-wide font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
