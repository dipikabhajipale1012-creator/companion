import { useState } from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { isOverdue } from "@/lib/api";
import type { Task } from "@/lib/types";
import { useTasks } from "@/lib/task-store";

const priorityClass: Record<Task["priority"], string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-warning/12 text-warning",
  HIGH: "bg-destructive/12 text-destructive",
};

const statusLabel: Record<Task["status"], string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function TaskCard({ task }: { task: Task }) {
  const { toggleComplete, removeTask, openDrawer } = useTasks();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const completed = task.status === "COMPLETED";
  const overdue = isOverdue(task);

  return (
    <article
      className={cn(
        "card-lift rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5",
        completed && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={completed}
          onCheckedChange={() => void toggleComplete(task)}
          aria-label={completed ? `Reopen ${task.title}` : `Mark ${task.title} complete`}
          className="mt-1 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "text-[0.975rem] font-semibold leading-snug text-card-foreground",
                completed && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </h3>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                aria-label={`Edit ${task.title}`}
                onClick={() => openDrawer(task)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${task.title}`}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          {task.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md bg-accent px-2 py-1 font-medium text-accent-foreground">
              {task.category || "Uncategorised"}
            </span>
            <span
              className={cn("rounded-md px-2 py-1 font-medium", priorityClass[task.priority])}
            >
              {task.priority}
            </span>
            <span className="rounded-md border border-border px-2 py-1 font-medium text-muted-foreground">
              {statusLabel[task.status]}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-medium",
                overdue ? "text-destructive" : "text-muted-foreground",
              )}
            >
              <CalendarDays className="size-3.5" />
              {formatDate(task.dueDate)}
              {overdue ? " · Overdue" : ""}
            </span>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{task.title}&rdquo; will be permanently removed. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void removeTask(task.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
