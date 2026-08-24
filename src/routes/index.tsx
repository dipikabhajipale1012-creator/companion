import { createFileRoute } from "@tanstack/react-router";
import {
  AlarmClock,
  CheckCircle2,
  CircleDot,
  ListTodo,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { TaskCard } from "@/components/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { isOverdue } from "@/lib/api";
import { useTasks } from "@/lib/task-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Campanion for Students" },
      {
        name: "description",
        content:
          "A calm dashboard for college students: track assignments, deadlines, and personal tasks with progress and overdue alerts.",
      },
      { property: "og:title", content: "Dashboard — Campanion for Students" },
      {
        property: "og:description",
        content:
          "Track assignments, deadlines, and personal tasks with progress and overdue alerts.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "primary" | "warning" | "success" | "danger";
}) {
  const tones = {
    primary: "bg-accent text-accent-foreground",
    warning: "bg-warning/12 text-warning",
    success: "bg-success/12 text-success",
    danger: "bg-destructive/12 text-destructive",
  } as const;
  return (
    <div className="card-lift rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { tasks, filteredTasks, stats, loading } = useTasks();

  const soon = new Date();
  soon.setHours(0, 0, 0, 0);
  soon.setDate(soon.getDate() + 7);

  const attention = tasks
    .filter(
      (t) =>
        t.status !== "COMPLETED" && (isOverdue(t) || new Date(t.dueDate).getTime() <= soon.getTime()),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Your semester at a glance — deadlines, progress, and what needs attention."
      />

      <section aria-label="Task statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[7.5rem] rounded-xl" />
            ))
          : [
              { label: "Total Tasks", value: stats.total, icon: ListTodo, tone: "primary" },
              { label: "Pending", value: stats.pending, icon: CircleDot, tone: "warning" },
              { label: "Completed", value: stats.completed, icon: CheckCircle2, tone: "success" },
              { label: "Overdue", value: stats.overdue, icon: AlarmClock, tone: "danger" },
            ].map((s) => (
              <StatCard
                key={s.label}
                label={s.label}
                value={s.value}
                icon={s.icon}
                tone={s.tone as "primary"}
              />
            ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold">Completion progress</h2>
            <p className="text-xs text-muted-foreground">
              {stats.completed} of {stats.total} tasks completed
            </p>
          </div>
          <span className="text-2xl font-semibold tabular-nums text-primary">
            {stats.completionRate}%
          </span>
        </div>
        <Progress value={stats.completionRate} className="mt-4 h-2.5" />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Upcoming &amp; overdue</h2>
        {loading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : attention.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
            Nothing due in the next week. Enjoy the breathing room.
          </p>
        ) : (
          <div className="space-y-3">
            {attention.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">All tasks</h2>
        <TaskFilters />
        <TaskList
          tasks={filteredTasks}
          emptyTitle="No tasks yet"
          emptyMessage="Add your assignments, readings, and reminders to get organised."
        />
      </section>
    </div>
  );
}
