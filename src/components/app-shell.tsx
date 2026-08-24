import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CheckCircle2,
  Circle,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTasks } from "@/lib/task-store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "All Tasks", icon: ListTodo },
  { to: "/pending", label: "Pending", icon: Circle },
  { to: "/completed", label: "Completed", icon: CheckCircle2 },
  { to: "/categories", label: "Categories", icon: FolderKanban },
] as const;

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem("stm.theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("stm.theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active &&
                "border-l-primary bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/campanion.svg" alt="Campanion" className="h-8 w-auto object-contain" />
      <span className="text-[0.95rem] font-semibold tracking-tight">Campanion</span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { filters, setFilter, openDrawer } = useTasks();
  const { dark, toggle } = useTheme();
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Brand />
        <div className="mt-7">
          <NavLinks />
        </div>
        <p className="mt-auto text-xs text-muted-foreground">Stay on top of your semester.</p>
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 duration-200 animate-in slide-in-from-left">
            <div className="flex items-center justify-between">
              <Brand />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
                onClick={() => setDrawer(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="mt-7">
              <NavLinks onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setDrawer(true)}
            >
              <Menu className="size-5" />
            </Button>
            <div className="lg:hidden">
              <span className="text-sm font-semibold tracking-tight">Campanion</span>
            </div>

            <div className="relative ml-auto w-full max-w-md lg:ml-0">
              <Label htmlFor="global-search" className="sr-only">
                Search tasks
              </Label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="global-search"
                type="search"
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                placeholder="Search tasks…"
                className="h-10 bg-card pl-9"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              >
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
              <Button onClick={() => openDrawer()} className="gap-1.5">
                <Plus className="size-4" />
                <span className="hidden sm:inline">Add Task</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
