"use client";

import { cn } from "@/lib/utils";

const TYPE_STYLES = {
  gain: {
    bg: "bg-emerald-50",
    src: "/activity-list/gain.svg",
  },
  leaf: {
    bg: "bg-emerald-50",
    src: "/activity-list/leaf.svg",
  },
  redeem: {
    bg: "bg-rose-50",
    src: "/activity-list/redeem.svg",
  },
  prepoint: {
    bg: "bg-indigo-50",
    src: "/activity-list/pre-point.svg",
  },
  fruit: {
    bg: "bg-orange-50",
    src: "/activity-list/fruit.svg",
  },
  game: {
    bg: "bg-sky-50",
    src: "/activity-list/game.svg",
  },
  streak: {
    bg: "bg-purple-50",
  },
};

function ActivityIcon({ type = "gain", activity }) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.gain;
  let iconSrc = style.src;

  if (type === "streak") {
    const milestone =
      typeof activity?.milestone === "number"
        ? activity.milestone
        : typeof activity?.streakDays === "number"
        ? activity.streakDays
        : null;
    const isBroken =
      activity?.status === "broken" ||
      activity?.status === "break" ||
      activity?.status === "stopped";
    if (milestone && milestone > 0) {
      iconSrc = "/activity-list/streak.svg";
    } else if (isBroken || milestone === 0) {
      iconSrc = "/activity-list/streak-nol.svg";
    } else {
      iconSrc = "/activity-list/streak.svg";
    }
  }

  if (!iconSrc) {
    iconSrc = TYPE_STYLES.gain.src;
  }

  return (
    <div
      className={cn("grid h-10 w-10 place-items-center rounded-2xl", style.bg)}
    >
      <img src={iconSrc} alt={type} className="h-5 w-5 object-contain" />
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
            className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-sm"
          >
            <div className="h-10 w-10 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-gray-100 animate-pulse" />
              <div className="h-2 w-24 rounded bg-gray-100 animate-pulse" />
            </div>
            <div className="h-2 w-12 rounded bg-gray-100 animate-pulse" />
          </li>
        ))}
      </ul>
    );
  }

  const normalizedItems = Array.isArray(items)
    ? items
        .map((activity, index) => normalizeActivity(activity, index))
        .filter(Boolean)
    : [];

  if (normalizedItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        Belum ada aktivitas untuk periode ini.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {normalizedItems.map((activity, index) => {
        const key = activity.time
          ? `${activity.type ?? "activity"}-${activity.time}`
          : `${activity.type ?? "activity"}-${index}`;
        return (
          <li
            key={key}
            className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-sm"
          >
            <ActivityIcon type={activity.type} activity={activity} />
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
        );
      })}
    </ul>
  );
}

function renderPrimaryText(activity) {
  if (!activity || typeof activity !== "object") {
    return "Aktivitas";
  }

  const type = activity.type;

  const formatValue = (value, unit = "poin") => {
    if (typeof value !== "number" || value === 0) return null;
    const prefix = value > 0 ? "+" : "";
    return `${prefix}${value} ${unit}`;
  };

  switch (type) {
    case "leaf":
      return "+1 daun hijau";
    case "redeem": {
      const label = formatValue(activity.points, "poin");
      return label ?? "Penukaran poin!";
    }
    case "gain": {
      const label = formatValue(activity.points, "poin");
      return label ?? "Eco-enzym dipanen!";
    }
    case "prepoint": {
      const value =
        typeof activity.prePoints === "number"
          ? activity.prePoints
          : typeof activity.pre_points === "number"
          ? activity.pre_points
          : activity.points;
      const label = formatValue(value, "prepoint");
      return label ?? "Upload progress eco-enzym";
    }
    case "fruit": {
      const label = formatValue(activity.points, "poin");
      return label ?? "Panen buah pohon";
    }
    case "game": {
      const label = formatValue(activity.points, "poin");
      return label ?? "Main Game Sorting Sampah";
    }
    case "streak": {
      if (
        activity.status === "broken" ||
        activity.status === "break" ||
        activity.status === "stopped" ||
        (typeof activity.streakDays === "number" && activity.streakDays === 0)
      ) {
        return "Streak Putus!";
      }
      if (activity.milestone === 30) {
        return "Streak 30 Hari!";
      }
      if (activity.milestone === 7) {
        return "Streak 7 Hari!";
      }
      if (typeof activity.streakDays === "number" && activity.streakDays > 0) {
        return `Streak ${activity.streakDays} Hari`;
      }
      return "Update streak";
    }
    default: {
      if (typeof activity.title === "string") {
        return activity.title;
      }
      const label = formatValue(activity.points, "poin");
      return label ?? "Aktivitas";
    }
  }
}

function normalizeActivity(activity, index = 0) {
  if (!activity || typeof activity !== "object") {
    return null;
  }

  const type = activity.type;
  const time = activity.time ?? null;
  const timeLabel = formatActivityTime(activity.time);

  const computedPeriods = resolveActivityPeriods(time);
  const incomingPeriods = Array.isArray(activity.periods)
    ? activity.periods
    : [];
  const periods = Array.from(
    new Set(["all", ...incomingPeriods, ...computedPeriods])
  );

  const normalized = {
    ...activity,
    type,
    time,
    timeLabel,
    periods,
  };

  switch (type) {
    case "leaf": {
      normalized.points =
        typeof activity.points === "number" ? activity.points : 0;
      normalized.title = activity.title ?? "Checklist kebiasaan";
      normalized.description =
        activity.description ?? "1 Habit harian kamu sudah ditandai selesai.";
      break;
    }
    case "redeem": {
      normalized.points =
        typeof activity.points === "number" ? activity.points : 0;
      normalized.description =
        activity.description ?? "Kamu menukar poin untuk voucher.";
      break;
    }
    case "gain": {
      normalized.points =
        typeof activity.points === "number" ? activity.points : 0;
      normalized.description =
        activity.description ?? "Kamu berhasil panen eco-enzym";
      break;
    }
    case "prepoint": {
      const prePointValue =
        typeof activity.prePoints === "number"
          ? activity.prePoints
          : typeof activity.pre_points === "number"
          ? activity.pre_points
          : typeof activity.points === "number"
          ? activity.points
          : 0;
      normalized.points = 0;
      normalized.prePoints =
        typeof activity.prePoints === "number"
          ? activity.prePoints
          : prePointValue;
      normalized.description =
        activity.description ??
        (prePointValue > 0
          ? `+${prePointValue} prepoint eco-enzym`
          : "Pre-point eco-enzym diperbarui.");
      normalized.title = activity.title ?? "Pre-point eco-enzym";
      break;
    }
    case "fruit": {
      normalized.points =
        typeof activity.points === "number" ? activity.points : 0;
      normalized.description =
        activity.description ?? "Kamu berhasil panen buah pohon ";
      normalized.title = activity.title ?? "Tree Fruit";
      break;
    }
    case "game": {
      normalized.points =
        typeof activity.points === "number" ? activity.points : 0;
      const dayLabel =
        typeof activity.dayBucket === "string"
          ? activity.dayBucket.replace(/^day-/, "")
          : null;
      normalized.description =
        activity.description ?? "Kamu bermain game sorting sampah.";
      normalized.title =
        activity.title ??
        (dayLabel ? `Sorting Game Hari ${dayLabel}` : "Sorting Game");
      break;
    }
    case "streak": {
      normalized.points = 0;
      const milestone =
        typeof activity.milestone === "number" ? activity.milestone : null;
      const streakDays =
        typeof activity.streakDays === "number"
          ? activity.streakDays
          : typeof activity.streak_days === "number"
          ? activity.streak_days
          : null;

      if (
        activity.status === "broken" ||
        activity.status === "break" ||
        activity.status === "stopped" ||
        (typeof streakDays === "number" && streakDays === 0)
      ) {
        const missedDays =
          typeof activity.missedDays === "number"
            ? activity.missedDays
            : typeof activity.missed_days === "number"
            ? activity.missed_days
            : null;
        normalized.description =
          activity.description ??
          (missedDays
            ? `Streak berhenti selama ${missedDays} hari. Yuk mulai lagi!`
            : "Streak kebiasaan sedang terhenti. Mulai lagi hari ini!");
        normalized.title = activity.title ?? "Streak Putus!";
      } else if (milestone === 30) {
        normalized.description =
          activity.description ??
          (streakDays
            ? `Kamu menjaga streak selama ${streakDays} hari berturut-turut.`
            : "Kamu mencapai 30 hari streak kebiasaan!");
        normalized.title = activity.title ?? "Streak 30 Hari!";
      } else if (milestone === 7) {
        normalized.description =
          activity.description ??
          (streakDays
            ? `Kamu menjaga streak selama ${streakDays} hari berturut-turut.`
            : "Kamu mencapai 7 hari streak kebiasaan!");
        normalized.title = activity.title ?? "Streak 7 Hari!";
      } else {
        normalized.description =
          activity.description ??
          (streakDays
            ? `Streak saat ini: ${streakDays} hari.`
            : "Kebiasaanmu tercatat berjalan.");
        normalized.title =
          activity.title ??
          (streakDays ? `Streak ${streakDays} Hari` : "Streak kebiasaan");
      }
      break;
    }
    default: {
      normalized.points =
        typeof activity.points === "number" ? activity.points : 0;
      break;
    }
  }

  return normalized;
}

function formatActivityTime(isoDate) {
  if (!isoDate) {
    return undefined;
  }
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveActivityPeriods(isoDate) {
  const periods = ["all"];
  if (!isoDate) {
    return periods;
  }
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return periods;
  }
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays <= 7) {
    periods.push("week");
  }
  if (diffDays <= 30) {
    periods.push("month");
  }
  return periods;
}
