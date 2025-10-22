"use client";

import { clampNumber } from "@/lib/utils";

function TimerIcon({ color = "#FEA800" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ProgressBar({ value = 0 }) {
  const width = `${clampNumber(value)}%`;
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
      <div className="h-full bg-[#FEA800] transition-all" style={{ width }} />
    </div>
  );
}

export default function EcoEnzymActive({ batch, info, progress = 40 }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-[#FEA800]/15">
          <TimerIcon />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{batch}</p>
          <p className="text-xs text-gray-500">{info}</p>
        </div>
      </div>

      <ProgressBar value={progress} />
    </div>
  );
}
