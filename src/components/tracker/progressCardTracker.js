"use client";
import { useEffect, useState } from "react";
import { getDailyTasks } from "@/lib/taskTracker";
import { clampNumber } from "@/lib/utils";

export default function ProgressCardTracker() {
  const [percent, setPercent] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await getDailyTasks();
      const tasks = res.data.tasks || [];
      const done = tasks.filter((t) => t.isCompleted).length;
      const total = tasks.length || 1;
      setDoneCount(done);
      setTotalCount(tasks.length);
      setPercent(Math.round((done / total) * 100));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    // Dengarkan event global setiap kali user toggle checklist
    const handleTaskUpdate = () => {
      refresh();
    };

    window.addEventListener("taskUpdated", handleTaskUpdate);
    return () => {
      window.removeEventListener("taskUpdated", handleTaskUpdate);
    };
  }, []);

  const p = clampNumber(percent);
  const size = 44;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = (p / 100) * C;

  if (loading) {
    return (
      <div className="rounded-2xl bg-[#F3C45B] p-4 shadow-sm animate-pulse mx-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-[#F7D98A]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-[#F7D98A]/70 rounded" />
            <div className="h-2 w-20 bg-[#F7D98A]/50 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-4 rounded-2xl bg-[#F3C45B] px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Progress Circle */}
        <div className="relative" style={{ width: size, height: size }}>
          <div className="absolute inset-0 grid place-items-center">
            <div
              className="h-[36px] w-[36px] rounded-full grid place-items-center"
              style={{ backgroundColor: "#F7D98A" }}
            >
              <span className="text-[12px] font-semibold text-black">%{p}</span>
            </div>
          </div>

          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="#111827"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${C - dash}`}
            />
          </svg>
        </div>

        {/* Text info */}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Progress Harian</p>
          <p className="text-gray-700/70 text-sm">
            {doneCount} dari {totalCount} tugas selesai
          </p>
        </div>
      </div>
    </div>
  );
}
