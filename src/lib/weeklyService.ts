// Weekly Planner data service — localStorage-backed, no backend needed

export interface WeeklyTask {
  id: string;
  title: string;
  days: number[]; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  timeSlot: string; // "HH:MM" (24h)
  duration: number; // minutes
  category: string;
  priority: "P1" | "P2" | "P3" | "";
  color: string;
  completedDates: string[]; // YYYY-MM-DD strings
  createdAt: string;
}

const KEY = "dailylog_weekly_tasks";

const SEED_TASKS: WeeklyTask[] = [
  {
    id: "wt-seed-1",
    title: "Morning workout",
    days: [0, 2, 4], // Mon, Wed, Fri
    timeSlot: "07:00",
    duration: 45,
    category: "Health",
    priority: "P1",
    color: "#14b8a6",
    completedDates: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "wt-seed-2",
    title: "Deep focus work block",
    days: [0, 1, 2, 3, 4],
    timeSlot: "09:00",
    duration: 120,
    category: "Coding",
    priority: "P1",
    color: "#6366f1",
    completedDates: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "wt-seed-3",
    title: "Team standup",
    days: [0, 1, 2, 3, 4],
    timeSlot: "10:00",
    duration: 30,
    category: "Meeting",
    priority: "P2",
    color: "#f59e0b",
    completedDates: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "wt-seed-4",
    title: "Read & learn",
    days: [1, 3, 5], // Tue, Thu, Sat
    timeSlot: "19:00",
    duration: 45,
    category: "Learning",
    priority: "P2",
    color: "#a855f7",
    completedDates: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "wt-seed-5",
    title: "Journal & reflect",
    days: [0, 1, 2, 3, 4, 5, 6],
    timeSlot: "21:00",
    duration: 20,
    category: "Personal",
    priority: "P3",
    color: "#f43f5e",
    completedDates: [],
    createdAt: new Date().toISOString(),
  },
];

function load(): WeeklyTask[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(SEED_TASKS));
    return SEED_TASKS;
  }
  return JSON.parse(raw) as WeeklyTask[];
}

function save(tasks: WeeklyTask[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export const weeklyService = {
  getAll(): WeeklyTask[] {
    return load().sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  },

  add(task: Omit<WeeklyTask, "id" | "createdAt" | "completedDates">): WeeklyTask {
    const tasks = load();
    const newTask: WeeklyTask = {
      ...task,
      id: crypto.randomUUID(),
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    save(tasks);
    return newTask;
  },

  update(id: string, updates: Partial<WeeklyTask>): void {
    const tasks = load();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], ...updates };
      save(tasks);
    }
  },

  delete(id: string): void {
    save(load().filter((t) => t.id !== id));
  },

  toggleComplete(id: string, dateStr: string): void {
    const tasks = load();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const task = tasks[idx];
    const already = task.completedDates.includes(dateStr);
    task.completedDates = already
      ? task.completedDates.filter((d) => d !== dateStr)
      : [...task.completedDates, dateStr];
    tasks[idx] = task;
    save(tasks);
  },

  isCompleted(task: WeeklyTask, dateStr: string): boolean {
    return task.completedDates.includes(dateStr);
  },

  getTasksForDay(dayIndex: number): WeeklyTask[] {
    return load()
      .filter((t) => t.days.includes(dayIndex))
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  },
};

export const TASK_CATEGORIES = [
  "Coding", "Meeting", "Learning", "Health", "Personal",
  "Planning", "Design", "Reading", "Exercise", "Other",
];

export const TASK_COLORS = [
  "#14b8a6", "#6366f1", "#f59e0b", "#a855f7", "#f43f5e",
  "#10b981", "#3b82f6", "#ec4899", "#f97316", "#64748b",
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
