import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { TaskFilters } from "@/components/task-filters";
import { TaskList } from "@/components/task-list";
import { useTasks } from "@/lib/task-store";

export const Route = createFileRoute("/pending")({
  head: () => ({
    meta: [
      { title: "Pending Tasks — Campanion" },
      {
        name: "description",
        content: "Everything still to do or in progress, sorted so nothing slips past a deadline.",
      },
      { property: "og:title", content: "Pending Tasks — Campanion" },
      {
        property: "og:description",
        content: "Everything still to do or in progress, sorted so nothing slips past a deadline.",
      },
    ],
  }),
  component: Pending,
});

function Pending() {
  const { filteredTasks } = useTasks();
  const tasks = filteredTasks.filter((t) => t.status !== "COMPLETED");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending"
        subtitle={`${tasks.length} task${tasks.length === 1 ? "" : "s"} still open`}
      />
      <TaskFilters lockStatus />
      <TaskList
        tasks={tasks}
        emptyTitle="Nothing pending"
        emptyMessage="You're all caught up — every task has been completed."
      />
    </div>
  );
}
