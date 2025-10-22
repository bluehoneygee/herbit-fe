"use client";

import { useMemo } from "react";

const DAY_LABELS = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];

function buildCalendar(date) {
  const base = date ? new Date(date) : new Date();
  base.setHours(0, 0, 0, 0);

  const year = base.getFullYear();
  const month = base.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  const startDate = new Date(firstOfMonth);
  startDate.setDate(firstOfMonth.getDate() - startOffset);

  const days = [];

  for (let i = 0; i < 42; i += 1) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);

    const isCurrentMonth = current.getMonth() === month;
    days.push({
      date: current,
      isCurrentMonth,
      isToday: current.toDateString() === new Date().toDateString(),
    });
  }

  return {
    days,
    monthLabel: new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(base),
  };
}

export default function CalendarOverlay({ referenceDate, panelRef }) {
  const { days, monthLabel } = useMemo(
    () => buildCalendar(referenceDate),
    [referenceDate]
  );

  return (
    <div
      ref={panelRef}
      className="w-[288px] rounded-[28px] border border-white/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.12)] p-5 focus:outline-none"
      role="dialog"
      aria-label="Kalender"
      tabIndex={-1}
    >
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold capitalize text-gray-900">
          {monthLabel}
        </p>

        <span className="rounded-full bg-[#FEA800]/15 px-3 py-1 text-xs font-medium text-[#FEA800]">
          Hari ini
        </span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-[11px] font-semibold tracking-wide text-gray-500">
        {DAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-3 text-center text-sm">
        {days.map(({ date, isCurrentMonth, isToday }) => (
          <div key={date.toISOString()} className="flex justify-center">
            <span
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full transition",
                isToday
                  ? "bg-[#FEA800] text-white"
                  : isCurrentMonth
                  ? "text-gray-900"
                  : "text-gray-300",
              ].join(" ")}
              aria-current={isToday ? "date" : undefined}
            >
              {date.getDate()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
