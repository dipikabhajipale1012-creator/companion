import type { Stats, Task, TaskInput } from "./types";

/**
 * Single data-access layer. Currently backed by an in-memory store
 * (persisted to localStorage) but shaped so each function can be swapped
 * for a fetch call to a REST backend:
 *   getTasks()      -> GET    /api/tasks
 *   createTask()    -> POST   /api/tasks
 *   updateTask()    -> PUT    /api/tasks/{id}
 *   deleteTask()    -> DELETE /api/tasks/{id}
 *   completeTask()  -> PATCH  /api/tasks/{id}/complete
 *   getStats()      -> GET    /api/tasks/stats
 */

const STORAGE_KEY = "stm.tasks.v1";
const LATENCY = 380;

const delay = (ms = LATENCY) => new Promise((r) => setTimeout(r, ms));

function iso(offsetDays: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function now() {
  return new Date().toISOString();
}

export function seedTasks(): Task[] {
  const t = now();
  return [
    {
      id: "t1",
      title: "Data Structures problem set 4",
      description:
        "Complete the AVL tree rotation exercises and submit the written proofs on the course portal.",
      category: "Computer Science",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: iso(-2),
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t2",
      title: "Read Chapter 7 — Microeconomics",
      description: "Elasticity and consumer surplus. Take notes for Thursday's seminar discussion.",
      category: "Economics",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: iso(1),
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t3",
      title: "Group project — slide deck draft",
      description: "Draft slides 1–8 covering the research methodology and share with the team.",
      category: "Group Work",
      priority: "HIGH",
      status: "TODO",
      dueDate: iso(3),
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t4",
      title: "Renew library books",
      description: "Three titles are due back this week — renew online before late fees apply.",
      category: "Personal",
      priority: "LOW",
      status: "TODO",
      dueDate: iso(5),
      createdAt: t,
      updatedAt: t,
    },
    {
      id: "t5",
      title: "Lab report — titration experiment",
      description: "Write up results, include the error analysis table and submit as PDF.",
      category: "Chemistry",
      priority: "MEDIUM",
      status: "COMPLETED",
      dueDate: iso(-6),
      createdAt: t,
      updatedAt: t,
    },
  ];
}

let memory: Task[] | null = null;

function read(): Task[] {
  if (memory) return memory;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        memory = JSON.parse(raw) as Task[];
        return memory;
      }
    } catch {
      /* ignore corrupt storage */
    }
  }
  memory = seedTasks();
  write(memory);
  return memory;
}

function write(tasks: Task[]) {
  memory = tasks;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      /* ignore quota errors */
    }
  }
}

export async function getTasks(): Promise<Task[]> {
  await delay();
  return [...read()];
}

export async function createTask(input: TaskInput): Promise<Task> {
  await delay(250);
  const t = now();
  const task: Task = {
    ...input,
    id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now()),
    createdAt: t,
    updatedAt: t,
  };
  write([task, ...read()]);
  return task;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  await delay(250);
  const tasks = read();
  const idx = tasks.findIndex((t) => t.id === id);
  const existing = tasks[idx];
  if (!existing) throw new Error("Task not found");
  const updated: Task = { ...existing, ...input, updatedAt: now() };
  const next = [...tasks];
  next[idx] = updated;
  write(next);
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  await delay(200);
  write(read().filter((t) => t.id !== id));
}

export async function completeTask(id: string, completed = true): Promise<Task> {
  return updateTask(id, { status: completed ? "COMPLETED" : "TODO" });
}

export function isOverdue(task: Task): boolean {
  if (task.status === "COMPLETED") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate).getTime() < today.getTime();
}

export function computeStats(tasks: Task[]): Stats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const pending = total - completed;
  const overdue = tasks.filter(isOverdue).length;
  return {
    total,
    pending,
    completed,
    overdue,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export async function getStats(): Promise<Stats> {
  await delay(150);
  return computeStats(read());
}
