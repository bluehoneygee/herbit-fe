"use client";

import Image from "next/image";

const MAX_ITEMS = 3;

export default function RewardHistoryList({ history = [], onSelect }) {
  const items = Array.isArray(history) ? history.slice(0, MAX_ITEMS) : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Riwayat Redeem</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <HistoryCard key={item.id} item={item} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

function HistoryCard({ item, onSelect }) {
  const redeemedAt = item.redeemedAt ?? item.redeemed_at;
  const dateLabel = formatDateLabel(redeemedAt);
  const pointsLabel = `-${item.points} poin`;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className="flex w-full items-center rounded-2xl border border-black/10 bg-white p-3 text-left shadow-sm transition hover:border-[#FACC15]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
    >
      <div className="mr-3 h-10 w-10 overflow-hidden rounded-2xl">
        <Image
          src={item.image}
          alt={item.name}
          width={40}
          height={40}
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-semibold text-gray-900">
          {item.name}
        </p>
        <p className="text-xs text-gray-500">{dateLabel}</p>
      </div>

      {pointsLabel && (
        <span className="ml-3 whitespace-nowrap text-xs font-semibold text-rose-600">
          {pointsLabel}
        </span>
      )}
    </button>
  );
}

function formatDateLabel(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
