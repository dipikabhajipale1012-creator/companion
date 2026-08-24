import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTasks, type PriorityFilter, type StatusFilter } from "@/lib/task-store";

export function TaskFilters({ lockStatus = false }: { lockStatus?: boolean }) {
  const { filters, setFilter, clearFilters, activeFilterCount, categories } = useTasks();

  const chips: { label: string; onClear: () => void }[] = [];
  if (filters.search.trim())
    chips.push({ label: `Search: "${filters.search}"`, onClear: () => setFilter("search", "") });
  if (!lockStatus && filters.status !== "ALL")
    chips.push({ label: `Status: ${filters.status}`, onClear: () => setFilter("status", "ALL") });
  if (filters.priority !== "ALL")
    chips.push({
      label: `Priority: ${filters.priority}`,
      onClear: () => setFilter("priority", "ALL"),
    });
  if (filters.category !== "ALL")
    chips.push({
      label: `Category: ${filters.category}`,
      onClear: () => setFilter("category", "ALL"),
    });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        {!lockStatus && (
          <div className="space-y-1.5">
            <Label htmlFor="filter-status" className="text-xs text-muted-foreground">
              Status
            </Label>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilter("status", v as StatusFilter)}
            >
              <SelectTrigger id="filter-status" className="w-[150px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="TODO">To do</SelectItem>
                <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="filter-priority" className="text-xs text-muted-foreground">
            Priority
          </Label>
          <Select
            value={filters.priority}
            onValueChange={(v) => setFilter("priority", v as PriorityFilter)}
          >
            <SelectTrigger id="filter-priority" className="w-[140px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-category" className="text-xs text-muted-foreground">
            Category
          </Label>
          <Select value={filters.category} onValueChange={(v) => setFilter("category", v)}>
            <SelectTrigger id="filter-category" className="w-[170px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
          </span>
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onClear}
              className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/70"
            >
              {chip.label}
              <X className="size-3" />
            </button>
          ))}
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
