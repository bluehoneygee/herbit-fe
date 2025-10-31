"use client";

function GearIcon({ size = 28, color = "#111827" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PencilIcon({ size = 14, color = "#6B7280" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12.5 4.5L15.5 7.5M3.75 14.25V17H6.5L15.13 8.37C15.4963 8.00368 15.7039 7.51097 15.7039 7C15.7039 6.48903 15.4963 5.99632 15.13 5.63L14.37 4.87C14.0037 4.50368 13.511 4.29606 13 4.29606C12.489 4.29606 11.9963 4.50368 11.63 4.87L3 13.5L3.75 14.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProfileHeader({ user, onEdit, onSettings, loading = false }) {
  if (loading || !user) {
    return (
      <header
        className="relative z-40 text-gray-900"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="mt-6 flex items-start gap-3">
          <div className="h-14 w-14 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-28 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
      </header>
    );
  }
  const displayName = user?.name ?? user?.username ?? user?.email ?? "Teman Herbit";
  const username = user?.username ?? user?.email ?? displayName;
  const avatar = (() => {
    if (user?.photoUrl) return user.photoUrl;
    if (user?.photo_url) return user.photo_url;
    const source = displayName || username;
    const cleaned = source.replace(/[^a-zA-Z\s]/g, " ").trim();
    const initials = cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "T";
    const params = new URLSearchParams({
      name: initials,
      background: "FACC15",
      color: "ffffff",
      size: "128",
    });
    return `https://ui-avatars.com/api/?${params.toString()}`;
  })();
  const points =
    typeof user?.totalPoints === "number"
      ? user.totalPoints
      : typeof user?.total_points === "number"
      ? user.total_points
      : user?.points ?? 0;

  return (
    <header
      className="relative z-40 text-gray-900"
      style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Your Profile</h1>
        <button
          type="button"
          onClick={() => onSettings?.()}
          aria-label="Pengaturan profil"
          className="p-0 m-0 bg-transparent border-0 inline-flex items-center justify-center cursor-pointer"
          style={{ lineHeight: 0 }}
        >
          <GearIcon size={28} />
        </button>
      </div>

      <div className="mt-6 flex items-start gap-3" aria-live="polite">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full shadow ring-2 ring-white/60 bg-white">
          <img
            src={avatar}
            alt={user?.name ? `Foto ${user.name}` : "Avatar pengguna"}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex flex-1 flex-col gap-1">
          <p className="text-xl font-bold text-[#111827]">{displayName}</p>
          <p className="text-sm font-semibold text-[#FEA800]">
            🏅 {points} Points
          </p>
          <button
            type="button"
            onClick={() => onEdit?.()}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FEA800]"
          >
            Edit Profile
            <PencilIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
