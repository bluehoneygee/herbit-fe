"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clampNumber } from "@/lib/utils";

export default function RewardsMilestone({
  milestone,
  milestones = [],
  onClaim,
}) {
  const items = useMemo(() => {
    if (Array.isArray(milestone)) return milestone;
    if (milestone) return [milestone];
    if (Array.isArray(milestones)) return milestones;
    return [];
  }, [milestone, milestones]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [items.length, activeIndex]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  const activeItem = items[activeIndex];
  const rawTarget = activeItem.targetDays ?? 0;
  const target = clampNumber(rawTarget, 1, Infinity);
  const rawCurrent = activeItem.claim?.progressDays ?? 0;
  const current = clampNumber(rawCurrent, 0, target);
  const percent = clampNumber((current / target) * 100);
  const isClaimed = Boolean(
    activeItem.claim?.claimedAt || (activeItem.claim?.pointsAwarded ?? 0) > 0
  );
  const canClaim = Boolean(activeItem.claim?.canClaim);
  const pointsLabel =
    typeof activeItem.pointsReward === "number"
      ? `+${activeItem.pointsReward} poin`
      : null;
  const title = activeItem.name ?? "Selamat";
  const subtitle = isClaimed
    ? "Reward sudah diklaim"
    : canClaim
    ? "Siap klaim!"
    : current > 0
    ? "Sedikit lagi!"
    : "Yuk mulai hari ini!";
  const description = activeItem.description;
  const ctaLabel = canClaim ? "Klaim sekarang" : "Belum bisa diklaim";
  const displayImage = activeItem.image;

  return (
    <section className="relative overflow-hidden rounded-[20px] border border-[#FACC15] bg-white px-4 py-4 text-gray-900 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-36 w-36 shrink-0 overflow-hidden rounded-full border border-[#FACC15]/40 bg-white p-2">
          <img
            src={displayImage}
            alt={title}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A6A2F]">
            {title}
          </p>
          <h2 className="text-lg font-extrabold text-[#3D1B0F]">{subtitle}</h2>
          <p className="text-[10px] text-gray-700/80">{description}</p>
          <ProgressBar current={current} target={target} percent={percent} />
        </div>
      </div>

      {isClaimed ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#FACC15] bg-white/80 px-4 py-2.5 text-center text-xs font-semibold text-[#9A6A2F]">
          Reward bulan ini sudah diklaim. Sampai jumpa di tantangan berikutnya!
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onClaim?.(activeItem)}
          disabled={!canClaim}
          className={`relative mt-4 inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
            canClaim
              ? "bg-[#4A2D8B] hover:bg-[#3C2374]"
              : "cursor-not-allowed bg-gray-300 text-gray-500"
          }`}
        >
          {ctaLabel}
          {pointsLabel && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {pointsLabel}
            </span>
          )}
        </button>
      )}

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
            aria-label="Milestone sebelumnya"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
            aria-label="Milestone berikutnya"
          >
            ›
          </button>
          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex justify-end gap-1">
            {items.map((item, index) => (
              <button
                key={item.id ?? item.code ?? `dot-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Milestone ${index + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === activeIndex ? "bg-[#4A2D8B]" : "bg-gray-300/80"
                }`}
                style={{ pointerEvents: "auto" }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function ProgressBar({ current, target, percent }) {
  const label = `${Math.min(current, target)}/${target} hari`;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
        <span>{label}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="relative flex items-center gap-2.5">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#FFF7E0]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#FEA800] transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <img
          src="/icons/chest.svg"
          alt="Chest icon"
          className="h-7 w-7 shrink-0"
        />
      </div>
    </div>
  );
}
