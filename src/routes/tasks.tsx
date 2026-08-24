import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { useTasks } from "@/lib/task-store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "All Tasks — Campanion" },
      {
        name: "description",
        content: "Browse, search, and filter every academic and personal task in one place.",
      },
      { property: "og:title", content: "All Tasks — Campanion" },
      {
        property: "og:description",
        content: "Browse, search, and filter every academic and personal task in one place.",
      },
    ],
  }),
  component: AllTasks,
});

function AllTasks() {
  const { filteredTasks } = useTasks();
  return (
    <div className="space-y-6">
      <PageHeader
        title="All Tasks"
        subtitle={`${filteredTasks.length} task${filteredTasks.length === 1 ? "" : "s"} matching your view`}
      />
      <TaskFilters />
      <TaskList
        tasks={filteredTasks}
        emptyTitle="No tasks yet"
        emptyMessage="Add your assignments, readings, and reminders to get organised."
      />
    </div>
  );
}
