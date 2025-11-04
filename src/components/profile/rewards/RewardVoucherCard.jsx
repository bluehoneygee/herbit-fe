"use client";

import { clampNumber } from "@/lib/utils";
import Image from "next/image";

const borderColor = "#FACC15";

export default function RewardVoucherCard({ voucher, onRedeem }) {
  if (!voucher) return null;

  const current = clampNumber(voucher.progress?.current ?? 0, 0, Infinity);
  const target = voucher.progress?.target ?? 1;
  const percent = clampNumber((current / target) * 100);
  const requiredPoints = voucher.pointsRequired;
  const canRedeem = current >= requiredPoints;
  const progressLabel = `${current}/${target}`;

  return (
    <div className="relative overflow-hidden rounded-[12px] bg-white ">
      <TicketBorder color={borderColor} />
      <div className="relative z-10 px-4 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3 pl-4 pr-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
              {voucher.image ? (
                <Image
                  src={voucher.image}
                  alt={voucher.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-gray-400">
                  IMG
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-900">
                {voucher.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {voucher.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRedeem?.(voucher)}
            className={`rounded-full px-2 py-1 text-[10px] font-semibold text-white shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              canRedeem
                ? "bg-[#4A2D8B] hover:bg-[#3C2374] focus-visible:ring-[#4A2D8B]"
                : "bg-gray-300 text-gray-600 hover:bg-gray-300 cursor-default focus-visible:ring-gray-300"
            }`}
          >
            {canRedeem ? "Tukar Sekarang" : "Belum Cukup"}
          </button>
        </div>

        <div className="mt-4 h-px w-full border-t border-dashed" />

        <div className="flex items-center gap-3 pt-1">
          <div className="relative flex-1">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#FFE6BF]">
              <div
                className="h-full rounded-full bg-[#FEA800] transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[#B45309]">
              {progressLabel}
            </span>
          </div>
          <Image
            src="/icons/chest.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

function TicketBorder({ color }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 rounded-[12px] border-2"
        style={{ borderColor: color }}
        aria-hidden="true"
      />
      <div
        className="absolute -left-[18px] top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border-2 bg-white"
        style={{ borderColor: color }}
      />
      <div
        className="absolute -right-[18px] top-1/2 h-10 w-10 -translate-y-1/2 rounded-full border-2 bg-white"
        style={{ borderColor: color }}
      />
    </>
  );
}
