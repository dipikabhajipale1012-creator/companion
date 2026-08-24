import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTasks } from "@/lib/task-store";
import type { Priority, Status } from "@/lib/types";

interface FormState {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  dueDate: string;
}

const empty: FormState = {
  title: "",
  description: "",
  category: "",
  priority: "MEDIUM",
  status: "TODO",
  dueDate: new Date().toISOString().slice(0, 10),
};

export function TaskDrawer() {
  const { drawerOpen, drawerTask, closeDrawer, addTask, editTask, categories } = useTasks();
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    setErrors({});
    setSubmitting(false);
    if (drawerTask) {
      setForm({
        title: drawerTask.title,
        description: drawerTask.description,
        category: drawerTask.category,
        priority: drawerTask.priority,
        status: drawerTask.status,
        dueDate: drawerTask.dueDate.slice(0, 10),
      });
      setNewCategory(false);
    } else {
      setForm(empty);
      setNewCategory(categories.length === 0);
    }
  }, [drawerOpen, drawerTask, categories.length]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function validate() {
    const next: Partial<Record<keyof FormState, string>> = {};
    const title = form.title.trim();
    if (title.length < 3) next.title = "Title must be at least 3 characters.";
    else if (title.length > 100) next.title = "Title must be 100 characters or fewer.";
    if (!form.category.trim()) next.category = "Pick or enter a category.";
    if (!form.dueDate) next.dueDate = "Choose a due date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate,
      };
      if (drawerTask) await editTask(drawerTask.id, payload);
      else await addTask(payload);
      closeDrawer();
    } catch {
      toast.error("Something went wrong", { description: "Your task could not be saved." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={drawerOpen} onOpenChange={(o) => (o ? null : closeDrawer())}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{drawerTask ? "Edit task" : "New task"}</SheetTitle>
          <SheetDescription>
            {drawerTask
              ? "Update the details of this task."
              : "Add a task to keep your semester on track."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5 px-4 pb-2">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Finish statistics assignment"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "task-title-error" : undefined}
            />
            {errors.title && (
              <p id="task-title-error" className="text-xs font-medium text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional details, links, or notes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-category">Category</Label>
            {newCategory || categories.length === 0 ? (
              <Input
                id="task-category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="e.g. Mathematics"
                aria-invalid={!!errors.category}
              />
            ) : (
              <Select
                value={form.category}
                onValueChange={(v) => {
                  if (v === "__new") {
                    setNewCategory(true);
                    set("category", "");
                  } else set("category", v);
                }}
              >
                <SelectTrigger id="task-category" aria-invalid={!!errors.category}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new">+ New category…</SelectItem>
                </SelectContent>
              </Select>
            )}
            {newCategory && categories.length > 0 && (
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setNewCategory(false)}
              >
                Choose an existing category
              </button>
            )}
            {errors.category && (
              <p className="text-xs font-medium text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v as Priority)}>
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as Status)}>
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              aria-invalid={!!errors.dueDate}
            />
            {errors.dueDate && (
              <p className="text-xs font-medium text-destructive">{errors.dueDate}</p>
            )}
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {drawerTask ? "Save changes" : "Create task"}
            </Button>
            <Button type="button" variant="outline" onClick={closeDrawer} disabled={submitting}>
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
