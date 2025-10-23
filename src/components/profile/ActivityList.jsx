"use client";

import { cn } from "@/lib/utils";

const TYPE_STYLES = {
  gain: {
    bg: "bg-emerald-50",
    iconColor: "#047857",
    Icon: GainIcon,
  },
  loss: {
    bg: "bg-rose-50",
    iconColor: "#B91C1C",
    Icon: LossIcon,
  },
  badge: {
    bg: "bg-amber-50",
    iconColor: "#B45309",
    Icon: BadgeIcon,
  },
  leaf: {
    bg: "bg-emerald-50",
    iconColor: "#047857",
    Icon: LeafIcon,
  },
};

function GainIcon({ color = "#047857" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 5V19M12 5L6.5 10.5M12 5L17.5 10.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LossIcon({ color = "#B91C1C" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 19V5M12 19L6.5 13.5M12 19L17.5 13.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BadgeIcon({ color = "#B45309" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 5L14.295 9.657L19.5 10.327L15.75 13.883L16.59 19L12 16.657L7.41 19L8.25 13.883L4.5 10.327L9.705 9.657L12 5Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeafIcon({ size = 18, color = "#047857" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Bentuk daun utama */}
      <path
        d="M5 16.8C1.8 9.5 8 3.5 18.5 5.5C19.3 5.65 19.9 6.35 19.85 7.15C19.55 13.2 16.5 17.2 7 17.45C6.3 17.45 5.6 17.2 5 16.8Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tangkai daun */}
      <path
        d="M4.5 21C5.8 16.2 6.5 12.8 12 10.2"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActivityIcon({ type = "gain" }) {
  const { bg, iconColor, Icon } = TYPE_STYLES[type] ?? TYPE_STYLES.gain;
  return (
    <div className={cn("grid h-10 w-10 place-items-center rounded-2xl", bg)}>
      <Icon color={iconColor} />
    </div>
  );
}

export default function ActivityList({ items = [], loading = false }) {
  if (loading) {
    return (
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={`placeholder-${i}`}
            className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-sm"
          >
            <div className="h-10 w-10 rounded-2xl bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-gray-100" />
              <div className="h-2 w-24 rounded bg-gray-100" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        Belum ada aktivitas untuk periode ini.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((activity) => (
        <li
          key={activity.id}
          className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-sm"
        >
          <ActivityIcon type={activity.type} />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">
                {renderPrimaryText(activity)}
              </p>
              {activity.timeLabel && (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.timeLabel}
                </span>
              )}
            </div>
            {activity.description && (
              <p className="mt-1 text-xs text-gray-500">
                {activity.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function renderPrimaryText(activity) {
  const hasPoints =
    typeof activity.points === "number" && activity.points !== 0;
  const hasPrePoints =
    typeof activity.pre_points === "number" && activity.pre_points !== 0;

  const segments = [];
  if (hasPoints) {
    const prefix = activity.points > 0 ? "+" : "";
    segments.push(`${prefix}${activity.points} points`);
  }
  if (hasPrePoints) {
    const prefix = activity.pre_points > 0 ? "+" : "";
    segments.push(`${prefix}${activity.pre_points} pre-points`);
  }

  if (segments.length > 0) {
    return segments.join(" • ");
  }
  if (activity.metricLabel) {
    return activity.metricLabel;
  }
  return activity.title ?? "Aktivitas";
}
