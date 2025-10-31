"use client";

import { cn } from "@/lib/utils";

export default function ActivityFilters({ filters = [], activeId, onChange }) {
  if (!Array.isArray(filters) || filters.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center gap-2 rounded-full bg-[#F1F1F1] p-1">
      {filters.map((filter) => {
        const active = filter.id === activeId;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange?.(filter.id)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-xs font-semibold transition",
              active ? "bg-[#FEA800] text-white shadow" : "text-gray-500"
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </nav>
  );
}
