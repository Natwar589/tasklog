"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, User, ShieldAlert, ArrowRight } from "lucide-react";
import { authService } from "@/lib/authService";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      if (user) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (activeTab === "signup" && !name)) {
      error("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "login") {
        await authService.login(email, password);
        success("Welcome to DailyLog!");
      } else {
        await authService.signup(email, password, name);
        success("Account created successfully!");
      }
      
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      error(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="flex-1 bg-background flex items-center justify-center p-6 relative overflow-hidden min-h-screen">
      {/* Decorative calm blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-teal-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-amber-500/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* App Logo */}
        <div className="flex flex-col items-center text-center gap-2 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground calm-shadow">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-serif font-semibold text-2xl tracking-wide text-foreground mt-2">DailyLog</h1>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Your personal, beautiful, and secure diary app.
          </p>
        </div>



        {/* Auth Card container */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 calm-shadow">
          {/* Tabs */}
          <div className="flex border-b border-border mb-6 relative">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide text-center transition-colors relative cursor-pointer ${
                activeTab === "login" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Log In
              {activeTab === "login" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wide text-center transition-colors relative cursor-pointer ${
                activeTab === "signup" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
              {activeTab === "signup" && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl font-semibold text-sm transition-all calm-shadow flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{activeTab === "login" ? "Enter Your Sanctuary" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>


          </form>
        </div>
      </div>
    </div>
  );
}
