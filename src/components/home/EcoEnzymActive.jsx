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

export default function EcoEnzymActive({
  batch,
  info,
  progress,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-gray-200" />
            <div className="h-2.5 w-48 max-w-full rounded bg-gray-200" />
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200" />
      </div>
    );
  }

  const hasData = Boolean(batch || info || Number.isFinite(progress));
  if (!hasData) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-4 text-center text-sm text-gray-500 shadow-sm">
        Belum ada progres eco-enzym yang aktif.
      </div>
    );
  }

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

      <ProgressBar value={progress ?? 0} />
    </div>
  );
}
