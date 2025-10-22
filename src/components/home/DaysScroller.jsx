"use client";

import { useMemo, useState } from "react";

const WEEKDAY_SHORT = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];

function buildCurrentWeek(baseDate = new Date()) {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay(); // 0 = Sunday
  // Align to Monday as the first day of week
  const mondayOffset = (dayOfWeek + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - mondayOffset);

  const result = [];

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const id = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    result.push({
      id,
      date,
      dayNumber: date.getDate(),
      dayLabel: WEEKDAY_SHORT[date.getDay()],
    });
  }

  return {
    days: result,
    todayId: [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-"),
  };
}

export default function DaysScroller({ onSelect }) {
  const { days, todayId } = useMemo(() => buildCurrentWeek(), []);
  const [activeId, setActiveId] = useState(todayId);

  const handleSelect = (day) => {
    setActiveId(day.id);
    if (typeof onSelect === "function") {
      onSelect(day.date);
    }
  };

  return (
    <div className="overflow-x-auto no-scrollbar">
      <ul className="flex items-center gap-2.5 pr-1">
        {days.map((day) => {
          const active = day.id === activeId;
          return (
            <li key={day.id} className="shrink-0">
              <button
                type="button"
                onClick={() => handleSelect(day)}
                className={[
                  "relative h-[70px] w-[56px] rounded-[16px] grid place-items-center",
                  "bg-white shadow-sm transition active:scale-95",
                  active
                    ? "border-[2px] border-[#FEA800]"
                    : "border border-black/10",
                ].join(" ")}
                aria-pressed={active}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-2 top-1 h-3 rounded-[12px] bg-white/60 blur-[6px]"
                />

                <span className="relative z-10 flex flex-col items-center leading-none">
                  <span
                    className={[
                      "text-[18px] font-bold",
                      active ? "text-[#FEA800]" : "text-gray-900",
                    ].join(" ")}
                  >
                    {day.dayNumber}
                  </span>
                  <span
                    className={[
                      "mt-[2px] text-[10px] font-semibold tracking-wide",
                      active ? "text-[#FEA800]" : "text-gray-500",
                    ].join(" ")}
                  >
                    {day.dayLabel}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
