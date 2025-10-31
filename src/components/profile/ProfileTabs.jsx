"use client";

import { cn } from "@/lib/utils";

export default function ProfileTabs({ tabs = [], activeId, onChange }) {
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-full bg-[#ECECEC] p-1">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-sm font-semibold transition",
                active ? "bg-white text-[#FEA800] shadow" : "text-gray-500"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
