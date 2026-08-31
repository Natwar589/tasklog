"use client";

import Link from "next/link";
import { Sparkles, BookOpen, Heart, Calendar, Shield, ArrowRight, Activity, Smile } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  } as const;


  return (
    <div className="flex-1 bg-background flex flex-col justify-between relative overflow-hidden">
      {/* Decorative calm blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-3xl -z-10" />

      {/* Header bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground calm-shadow">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <span className="font-serif font-semibold text-lg tracking-wide text-foreground">DailyLog</span>
        </div>
        
        <Link
          href="/login"
          className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary rounded-full hover:bg-primary/95 transition-all calm-shadow"
        >
          Sign In
        </Link>
      </header>

      {/* Hero section */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 md:py-20 flex-1 flex flex-col justify-center items-center text-center z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-3xl"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border calm-shadow"
          >
            <Smile className="w-3.5 h-3.5 text-primary" />
            <span>Meet your calm journaling space</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-foreground leading-[1.15]"
          >
            Write daily. Reflect deeply. <br />
            <span className="text-primary italic font-normal">Understand yourself.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
          >
            DailyLog is a beautiful, private space to write entries, track your emotional patterns, view memories, and build an intentional journaling habit.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-2xl font-semibold tracking-wide text-sm flex items-center justify-center gap-2 calm-shadow hover:scale-[1.01] transition-all"
            >
              <span>Start Your Journaling Journey</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-card hover:bg-muted text-foreground border border-border rounded-2xl font-semibold tracking-wide text-sm flex items-center justify-center gap-2 calm-shadow transition-all"
            >
              <span>Explore Sandbox Demo</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-20 md:mt-28"
        >
          {/* Card 1 */}
          <motion.div
            variants={itemVariants}
            className="bg-card border border-border p-6 rounded-2xl text-left calm-shadow hover:border-primary/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground mb-2">Focused Writing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A distraction-free, beautiful canvas that autosaves as you write. Toggle privacy locks so your logs remain yours.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={itemVariants}
            className="bg-card border border-border p-6 rounded-2xl text-left calm-shadow hover:border-primary/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <Activity className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground mb-2">Mood & Sentiment</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Log daily moods alongside entries. Over time, view interactive visual analytics representing your emotional trends.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={itemVariants}
            className="bg-card border border-border p-6 rounded-2xl text-left calm-shadow hover:border-primary/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <Calendar className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground mb-2">Timeline & Calendar</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Map out writing history on a gorgeous grid calendar. Filter logs by tags, text queries, or specific moods easily.
            </p>
          </motion.div>
        </motion.section>
      </main>

      {/* Footer bar */}
      <footer className="border-t border-border bg-card/20 py-8 text-center text-xs text-muted-foreground z-10 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} DailyLog. Made with care for your emotional health.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> End-to-End Encrypted Option
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
