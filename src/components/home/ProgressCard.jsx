"use client";

import { clampNumber } from "@/lib/utils";

export default function ProgressCard({ percent = 60, title, subtitle }) {
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
