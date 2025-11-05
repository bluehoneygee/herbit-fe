"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import getFallbackAvatar from "@/lib/avatarFallback";
import { API_BASE_URL } from "@/lib/absoluteUrl";

function ChevronRightIcon({ size = 16, color = "#9CA3AF" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9 5L16 12L9 19"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SettingsClient({ profile }) {
  const router = useRouter();

  console.log("[settings] SettingsClient profile:", profile);

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const username = profile?.username ?? "";
  const email = profile?.email ?? "";

  const normalizedUsername = useMemo(() => {
    if (!username) return "";
    return username.startsWith("@")
      ? username.slice(1)
      : username.replace(/\s+/g, "").toLowerCase();
  }, [username]);

  const displayName = useMemo(() => {
    if (profile?.displayName) return profile.displayName;
    if (profile?.name) return profile.name;
    if (profile?.username) return profile.username;
    if (profile?.email) return profile.email.split("@")[0];
    return "Teman Herbit";
  }, [profile?.displayName, profile?.email, profile?.name, profile?.username]);

  const avatarUrl = useMemo(() => {
    if (profile?.photoUrl) return profile.photoUrl;
    if (profile?.photo_url) return profile.photo_url;
    return getFallbackAvatar(displayName);
  }, [displayName, profile?.photoUrl, profile?.photo_url]);

  const handleLogout = useCallback(async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    setLogoutError("");
    try {
      const endpoint = API_BASE_URL
        ? `${API_BASE_URL.replace(/\/+$/, "")}/auth/logout`
        : "/api/auth/logout";

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message =
          data?.message || data?.error || "Gagal keluar. Coba lagi.";
        throw new Error(message);
      }

      router.replace("/login");
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Gagal keluar. Coba lagi."
      );
      setLogoutLoading(false);
    }
  }, [logoutLoading, router]);

  const summary = useMemo(
    () => [
      {
        id: "photo",
        label: "Foto profil",
        value:
          profile?.photoUrl || profile?.photo_url
            ? "Perbarui foto"
            : "Belum diatur",
        href: "/settings/photo",
      },
      {
        id: "username",
        label: "Username",
        value: normalizedUsername ? `@${normalizedUsername}` : "Belum diatur",
        href: "/settings/username",
      },
      {
        id: "email",
        label: "Email",
        value: email || "Belum diatur",
        href: "/settings/email",
      },
    ],
    [email, normalizedUsername, profile?.photoUrl, profile?.photo_url]
  );

  return (
    <main className="min-h-screen bg-white text-[#0A0A19]">
      <header
        className="px-4"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm"
            aria-label="Kembali"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M15.5 19L8.5 12L15.5 5"
                stroke="#0A0A19"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex flex-col">
            <span className="text-xl font-bold">Account</span>
            <span className="text-sm font-medium text-gray-500">
              @{normalizedUsername || "username"}
            </span>
          </div>
        </div>
      </header>

      <section className="px-5 pb-10">
        <div className="mt-8 flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-black/10">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mt-8 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          {summary.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => router.push(item.href)}
              className="flex w-full items-center justify-between px-4 py-5 text-left transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0A0A19]">
                  {item.label}
                </p>
                <p className="mt-1 truncate text-sm text-gray-500">
                  {item.value}
                </p>
              </div>
              <ChevronRightIcon size={18} color="#9CA3AF" />
            </button>
          ))}
        </div>

        {logoutError && (
          <p className="mt-10 text-sm text-red-500 text-center">
            {logoutError}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          className="mt-12 w-full rounded-full border border-rose-500 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {logoutLoading ? "Keluar…" : "Keluar Akun"}
        </button>
      </section>
    </main>
  );
}
