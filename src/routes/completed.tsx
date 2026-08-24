import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { useTasks } from "@/lib/task-store";

export const Route = createFileRoute("/completed")({
  head: () => ({
    meta: [
      { title: "Completed Tasks — Campanion" },
      {
        name: "description",
        content: "A record of every assignment and reading you've finished this semester.",
      },
      { property: "og:title", content: "Completed Tasks — Campanion" },
      {
        property: "og:description",
        content: "A record of every assignment and reading you've finished this semester.",
      },
    ],
  }),
  component: Completed,
});

function Completed() {
  const { filteredTasks } = useTasks();
  const tasks = filteredTasks.filter((t) => t.status === "COMPLETED");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Completed"
        subtitle={`${tasks.length} task${tasks.length === 1 ? "" : "s"} finished`}
      />
      <TaskFilters lockStatus />
      <TaskList
        tasks={tasks}
        emptyTitle="Nothing completed yet"
        emptyMessage="Tick off a task and it will show up here."
      />
    </div>
  );
}
