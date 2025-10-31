"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

/* ---------------- icons ---------------- */
function ArrowLeftIcon({ size = 16, color = "#0A0A19" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15.5 19L8.5 12L15.5 5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon({ size = 14, color = "#9CA3AF" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 7v5l3 2"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

function TrashIcon({ size = 18, color = "#EF4444" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeafBadge() {
  return (
    <div className="h-11 w-11 shrink-0 rounded-full bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center overflow-hidden">
      <Image
        src="/icons/leaf.png"
        alt="Notification icon"
        width={24}
        height={24}
        className="object-contain"
      />
    </div>
  );
}

/* -------------- utils -------------- */
function formatRelativeTime(dateStr) {
  try {
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 45) return "Baru saja";
    if (diff < 90) return "1 menit";
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m} menit`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days} hari`;
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks} minggu`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} bulan`;
    const years = Math.floor(days / 365);
    return `${years} tahun`;
  } catch {
    return "Baru saja";
  }
}

function NotificationItem({ item }) {
  const timeLabel = useMemo(
    () => formatRelativeTime(item?.createdAt),
    [item?.createdAt]
  );
  return (
    <article className="rounded-3xl border border-black/5 bg-white px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex gap-3 sm:gap-4">
        <LeafBadge />
        <div className="flex-1">
          <h3 className="text-[15px] sm:text-base font-semibold text-[#0A0A19]">
            {item?.title ?? "Ayo mulai tantanganmu hari ini!"}
          </h3>
          <p className="mt-1 text-sm leading-5 text-[#0A0A19]/70">
            {item?.message ??
              "Ada 5 aksi kecil menunggumu. Yuk checklist biar pohonmu makin rimbun!"}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <ClockIcon />
            <span>{timeLabel}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------------- Modal Konfirmasi -------------- */
function ConfirmModal({ isOpen, onClose, onConfirm, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
            <TrashIcon size={24} />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Hapus Semua Notifikasi?
        </h3>

        <p className="text-sm text-gray-600 text-center mb-6">
          Semua notifikasi akan dihapus secara permanen. Tindakan ini tidak
          dapat dibatalkan.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 rounded-2xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------- API base -------------- */
const RAW_API = (process.env.NEXT_PUBLIC_API_URL || "").trim();
const API =
  RAW_API && /^https?:\/\//.test(RAW_API)
    ? RAW_API.replace(/\/+$/, "")
    : "http://localhost:5000/api";

/* -------------- page -------------- */
export default function NotificationPage() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function getUserId() {
    try {
      const r = await fetch(`${API}/auth/me`, { credentials: "include" });
      if (r.ok) {
        const me = await r.json();
        return me?.id || me?._id || me?.user?._id || null;
      }
    } catch {}
    return null;
  }

  const fetchData = useCallback(async () => {
    try {
      let url = `${API}/notifications`;
      let res = await fetch(url, { credentials: "include" });

      let ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const html = await res.text();
        console.error(
          "[Notifications] Non-JSON:",
          res.status,
          html.slice(0, 400)
        );
        throw new Error(
          `Non-JSON response (${res.status}). Cek NEXT_PUBLIC_API_URL / CORS / auth.`
        );
      }

      let payload = await res.json();
      if (
        res.status === 401 ||
        (Array.isArray(payload) && payload.length === 0)
      ) {
        const uid = await getUserId();
        if (uid) {
          url = `${API}/notifications?userId=${encodeURIComponent(uid)}`;
          res = await fetch(url, { credentials: "include" });
          ct = res.headers.get("content-type") || "";
          if (!ct.includes("application/json")) {
            const html = await res.text();
            console.error(
              "[Notifications] Fallback Non-JSON:",
              res.status,
              html.slice(0, 400)
            );
            throw new Error(`Non-JSON response fallback (${res.status}).`);
          }
          payload = await res.json();

          await fetch(`${API}/notifications/read-all`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: null, userId: uid }),
          });
        }
      } else {
        await fetch(`${API}/notifications/read-all`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: null }),
        });
      }

      setItems(Array.isArray(payload) ? payload : []);
    } catch (e) {
      console.error("[Notifications] fetch failed:", e);
      setItems([]);
    }
  }, []);

  const handleClearAll = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API}/notifications/clear-all`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setItems([]);
        setShowModal(false);
        // Optional: tampilkan toast success
        console.log("✅ Semua notifikasi berhasil dihapus");
      } else {
        throw new Error("Gagal menghapus notifikasi");
      }
    } catch (e) {
      console.error("[Notifications] clear all failed:", e);
      // Optional: tampilkan toast error
      alert("Gagal menghapus notifikasi. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    console.log("[Notifications] API =", API);
    fetchData();
  }, [fetchData]);

  const handleBack = useCallback(() => router.push("/"), [router]);

  const hasData = (items?.length ?? 0) > 0;

  return (
    <main className="min-h-screen bg-white">
      <header
        className="px-4"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="h-11 w-11 rounded-2xl border border-black/10 bg-white shadow-sm flex items-center justify-center"
            aria-label="Kembali ke Home"
          >
            <ArrowLeftIcon />
          </button>
          <span className="text-xl font-bold text-gray-900">Home</span>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#0A0A19]">
            Notifications
          </h1>

          {hasData && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <TrashIcon size={16} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </header>

      <section className="px-4 py-8">
        {items === null && (
          <div className="space-y-4 animate-pulse">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-black/5 bg-white p-4"
              >
                <div className="flex gap-3">
                  <div className="h-11 w-11 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-11/12" />
                    <div className="h-3 bg-gray-100 rounded w-7/12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items?.length === 0 && (
          <div className="rounded-3xl border border-black/5 bg-white p-6 text-center text-sm text-gray-500">
            Belum ada notifikasi terbaru.
          </div>
        )}

        {hasData && (
          <div className="space-y-4">
            {items.map((it) => (
              <NotificationItem key={it._id} item={it} />
            ))}
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleClearAll}
        isDeleting={isDeleting}
      />
    </main>
  );
}
