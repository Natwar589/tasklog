// Roadmap data service with localStorage persistence and rich seed milestones

export interface SubGoal {
  id: string;
  title: string;
  completed: boolean;
}

export interface RoadmapGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string; // YYYY-MM-DD
  timeframe: string; // "Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026", "Long Term"
  category: "Career" | "Learning" | "Health" | "Project" | "Financial" | "Personal" | "Creative";
  priority: "High" | "Medium" | "Low";
  status: "planned" | "in_progress" | "completed" | "paused";
  color: string;
  subGoals: SubGoal[];
  manualProgress?: number; // 0-100 when no subgoals
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "dailylog_roadmap_goals";

export const ROADMAP_CATEGORIES = [
  "Career",
  "Learning",
  "Health",
  "Project",
  "Financial",
  "Personal",
  "Creative",
] as const;

export const TIMEFRAMES = [
  "Q1 2026",
  "Q2 2026",
  "Q3 2026",
  "Q4 2026",
  "Long Term",
] as const;

export const ROADMAP_COLORS = [
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#a855f7", // Purple
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#0ea5e9", // Sky
  "#ec4899", // Pink
];

const SEED_ROADMAP_GOALS: RoadmapGoal[] = [
  {
    id: "goal-seed-1",
    title: "Launch Fullstack SaaS Product",
    description: "Architect and deploy production-ready fullstack app with Stripe & Auth.",
    targetDate: "2026-04-15",
    timeframe: "Q2 2026",
    category: "Project",
    priority: "High",
    status: "in_progress",
    color: "#6366f1",
    subGoals: [
      { id: "sg-1", title: "Complete API specs & DB Schema", completed: true },
      { id: "sg-2", title: "Implement Auth & Subscription Billing", completed: true },
      { id: "sg-3", title: "Build responsive landing page & dashboard", completed: false },
      { id: "sg-4", title: "Beta testing with 20 early adopters", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-seed-2",
    title: "Master Advanced System Design & Distributed Systems",
    description: "Study microservices patterns, message queues, caching strategies, and event sourcing.",
    targetDate: "2026-03-31",
    timeframe: "Q1 2026",
    category: "Learning",
    priority: "High",
    status: "in_progress",
    color: "#14b8a6",
    subGoals: [
      { id: "sg-5", title: "Finish Designing Data-Intensive Applications reading", completed: true },
      { id: "sg-6", title: "Build prototype with Redis caching & Kafka", completed: true },
      { id: "sg-7", title: "Solve 10 classic system design mock cases", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-seed-3",
    title: "Run a 10K Marathon & Maintain Core Fitness",
    description: "Follow structured 12-week running program with zone 2 training and nutrition.",
    targetDate: "2026-05-20",
    timeframe: "Q2 2026",
    category: "Health",
    priority: "Medium",
    status: "in_progress",
    color: "#10b981",
    subGoals: [
      { id: "sg-8", title: "Achieve consistent 5km running pace", completed: true },
      { id: "sg-9", title: "Weekly strength training 3x/week", completed: false },
      { id: "sg-10", title: "Complete official 10k timed race", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-seed-4",
    title: "Build Personal Investment & Savings Portfolio",
    description: "Automate index fund investments and establish 6-month emergency buffer.",
    targetDate: "2026-06-30",
    timeframe: "Q2 2026",
    category: "Financial",
    priority: "Medium",
    status: "planned",
    color: "#f59e0b",
    subGoals: [
      { id: "sg-11", title: "Review monthly expense breakdown", completed: true },
      { id: "sg-12", title: "Setup automated monthly ETF allocations", completed: false },
      { id: "sg-13", title: "Reach 6-month emergency liquidity target", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-seed-5",
    title: "Publish 12 High-Quality Technical Essays",
    description: "Write in-depth engineering breakdowns on full-stack architecture and dev tools.",
    targetDate: "2026-12-31",
    timeframe: "Long Term",
    category: "Creative",
    priority: "Low",
    status: "planned",
    color: "#a855f7",
    subGoals: [
      { id: "sg-14", title: "Outline topics and research notes", completed: true },
      { id: "sg-15", title: "Publish first 3 blog posts", completed: false },
      { id: "sg-16", title: "Distribute across Hacker News and Dev communities", completed: false },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function loadGoals(): RoadmapGoal[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ROADMAP_GOALS));
    return SEED_ROADMAP_GOALS;
  }
  try {
    return JSON.parse(raw) as RoadmapGoal[];
  } catch {
    return [];
  }
}

function saveGoals(goals: RoadmapGoal[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export function computeGoalProgress(goal: RoadmapGoal): number {
  if (goal.subGoals && goal.subGoals.length > 0) {
    const completedCount = goal.subGoals.filter((s) => s.completed).length;
    return Math.round((completedCount / goal.subGoals.length) * 100);
  }
  return goal.manualProgress || (goal.status === "completed" ? 100 : 0);
}

export const roadmapService = {
  getAll(): RoadmapGoal[] {
    return loadGoals().sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  },

  add(goal: Omit<RoadmapGoal, "id" | "createdAt" | "updatedAt">): RoadmapGoal {
    const goals = loadGoals();
    const newGoal: RoadmapGoal = {
      ...goal,
      id: `goal-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    saveGoals(goals);
    return newGoal;
  },

  update(id: string, updates: Partial<RoadmapGoal>): void {
    const goals = loadGoals();
    const index = goals.findIndex((g) => g.id === id);
    if (index >= 0) {
      goals[index] = {
        ...goals[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      // Auto-update status if all subgoals completed
      if (goals[index].subGoals.length > 0) {
        const allDone = goals[index].subGoals.every((s) => s.completed);
        if (allDone && goals[index].status !== "completed") {
          goals[index].status = "completed";
        }
      }
      saveGoals(goals);
    }
  },

  delete(id: string): void {
    const goals = loadGoals().filter((g) => g.id !== id);
    saveGoals(goals);
  },

  toggleSubGoal(goalId: string, subGoalId: string): void {
    const goals = loadGoals();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    goal.subGoals = goal.subGoals.map((s) =>
      s.id === subGoalId ? { ...s, completed: !s.completed } : s
    );

    const allDone = goal.subGoals.every((s) => s.completed);
    if (allDone && goal.status !== "completed") {
      goal.status = "completed";
    } else if (!allDone && goal.status === "completed") {
      goal.status = "in_progress";
    }

    goal.updatedAt = new Date().toISOString();
    saveGoals(goals);
  },

  addSubGoal(goalId: string, title: string): void {
    const goals = loadGoals();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || !title.trim()) return;

    goal.subGoals.push({
      id: `sg-${crypto.randomUUID()}`,
      title: title.trim(),
      completed: false,
    });

    if (goal.status === "completed") {
      goal.status = "in_progress";
    }

    goal.updatedAt = new Date().toISOString();
    saveGoals(goals);
  },

  deleteSubGoal(goalId: string, subGoalId: string): void {
    const goals = loadGoals();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    goal.subGoals = goal.subGoals.filter((s) => s.id !== subGoalId);
    goal.updatedAt = new Date().toISOString();
    saveGoals(goals);
  },
};
