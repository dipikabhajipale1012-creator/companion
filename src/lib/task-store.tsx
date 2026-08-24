import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import * as api from "./api";
import type { Priority, Status, Task, TaskInput } from "./types";

export type StatusFilter = Status | "ALL";
export type PriorityFilter = Priority | "ALL";

interface Filters {
  search: string;
  status: StatusFilter;
  priority: PriorityFilter;
  category: string; // "ALL" or category name
}

const DEFAULT_FILTERS: Filters = {
  search: "",
  status: "ALL",
  priority: "ALL",
  category: "ALL",
};

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  filteredTasks: Task[];
  categories: string[];
  stats: ReturnType<typeof api.computeStats>;
  addTask: (input: TaskInput) => Promise<void>;
  editTask: (id: string, input: TaskInput) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  toggleComplete: (task: Task) => Promise<void>;
  drawerTask: Task | null;
  drawerOpen: boolean;
  openDrawer: (task?: Task | null) => void;
  closeDrawer: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTask, setDrawerTask] = useState<Task | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .getTasks()
      .then(setTasks)
      .catch(() => setError("We couldn't load your tasks."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) =>
      setFilters((f) => ({ ...f, [key]: value })),
    [],
  );

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const activeFilterCount =
    (filters.search.trim() ? 1 : 0) +
    (filters.status !== "ALL" ? 1 : 0) +
    (filters.priority !== "ALL" ? 1 : 0) +
    (filters.category !== "ALL" ? 1 : 0);

  const filteredTasks = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !(t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)))
        return false;
      if (filters.status !== "ALL" && t.status !== filters.status) return false;
      if (filters.priority !== "ALL" && t.priority !== filters.priority) return false;
      if (filters.category !== "ALL" && t.category !== filters.category) return false;
      return true;
    });
  }, [tasks, filters]);

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category).filter(Boolean))).sort(),
    [tasks],
  );

  const stats = useMemo(() => api.computeStats(tasks), [tasks]);

  const addTask = useCallback(async (input: TaskInput) => {
    const created = await api.createTask(input);
    setTasks((prev) => [created, ...prev]);
    toast.success("Task created", { description: created.title });
  }, []);

  const editTask = useCallback(async (id: string, input: TaskInput) => {
    const updated = await api.updateTask(id, input);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    toast.success("Task updated", { description: updated.title });
  }, []);

  const removeTask = useCallback(async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Could not delete task");
    }
  }, []);

  const toggleComplete = useCallback(async (task: Task) => {
    const next = task.status !== "COMPLETED";
    try {
      const updated = await api.completeTask(task.id, next);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      toast.success(next ? "Task completed" : "Task reopened", { description: task.title });
    } catch {
      toast.error("Could not update task");
    }
  }, []);

  const openDrawer = useCallback((task?: Task | null) => {
    setDrawerTask(task ?? null);
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value: TaskContextValue = {
    tasks,
    loading,
    error,
    reload: load,
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    filteredTasks,
    categories,
    stats,
    addTask,
    editTask,
    removeTask,
    toggleComplete,
    drawerTask,
    drawerOpen,
    openDrawer,
    closeDrawer,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}
