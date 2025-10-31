"use client";

import { clampNumber } from "@/lib/utils";

export default function ProgressCard({
  percent = 0,
  title,
  subtitle,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-[#F3C45B] p-4 shadow-sm animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-[#F7D98A]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-[#F7D98A]" />
            <div className="h-3 w-48 max-w-full rounded bg-[#F7D98A]" />
          </div>
        </div>
      </div>
    );
  }

  const p = clampNumber(percent);

  const size = 44;
  const stroke = 3;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = (p / 100) * C;

  return (
    <div className="rounded-2xl bg-[#F3C45B] p-4 shadow-sm">
      <div className="flex items-center gap-3">
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

        <div className="flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-gray-700/70 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
