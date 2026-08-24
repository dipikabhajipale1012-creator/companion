import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useTasks } from "@/lib/task-store";
import { isOverdue } from "@/lib/api";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Campanion" },
      {
        name: "description",
        content: "See how your workload breaks down across courses, projects, and personal life.",
      },
      { property: "og:title", content: "Categories — Campanion" },
      {
        property: "og:description",
        content: "See how your workload breaks down across courses, projects, and personal life.",
      },
    ],
  }),
  component: Categories,
});

function Categories() {
  const { tasks, categories, loading, setFilter, openDrawer } = useTasks();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Your workload grouped by course, project, and personal life"
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No categories yet"
          message="Categories appear as soon as you create your first task."
          actionLabel="Create your first task"
          onAction={() => openDrawer()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const items = tasks.filter((t) => t.category === category);
            const done = items.filter((t) => t.status === "COMPLETED").length;
            const overdue = items.filter(isOverdue).length;
            const pct = items.length ? Math.round((done / items.length) * 100) : 0;
            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setFilter("category", category);
                  void navigate({ to: "/tasks" });
                }}
                className="card-lift rounded-xl border border-border bg-card p-5 text-left shadow-[var(--shadow-card)]"
              >
                <h2 className="text-sm font-semibold">{category}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {items.length} task{items.length === 1 ? "" : "s"} · {done} completed
                  {overdue > 0 ? (
                    <span className="font-medium text-destructive"> · {overdue} overdue</span>
                  ) : null}
                </p>
                <Progress value={pct} className="mt-4 h-2" />
                <p className="mt-2 text-xs font-medium text-muted-foreground">{pct}% complete</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
