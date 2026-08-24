import { ClipboardList, SearchX, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { TaskCard } from "@/components/task-card";
import { useTasks } from "@/lib/task-store";
import type { Task } from "@/lib/types";

export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <div className="flex gap-3">
            <Skeleton className="mt-1 size-4 rounded" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskList({
  tasks,
  emptyTitle,
  emptyMessage,
}: {
  tasks: Task[];
  emptyTitle: string;
  emptyMessage: string;
}) {
  const { loading, error, reload, activeFilterCount, clearFilters, openDrawer } = useTasks();

  if (loading) return <TaskListSkeleton />;

  if (error)
    return (
      <div className="flex flex-col items-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
        <AlertTriangle className="size-6 text-destructive" />
        <h3 className="mt-3 text-base font-semibold">{error}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Check your connection and try loading again.
        </p>
        <Button className="mt-5" onClick={reload}>
          Retry
        </Button>
      </div>
    );

  if (tasks.length === 0) {
    return activeFilterCount > 0 ? (
      <EmptyState
        icon={SearchX}
        title="No matching tasks"
        message="No tasks match your current search and filters."
        actionLabel="Clear filters"
        onAction={clearFilters}
      />
    ) : (
      <EmptyState
        icon={ClipboardList}
        title={emptyTitle}
        message={emptyMessage}
        actionLabel="Create your first task"
        onAction={() => openDrawer()}
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
