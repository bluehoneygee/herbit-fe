"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

function ArrowLeftIcon({ size = 16, color = "#0A0A19" }) {
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
        d="M15.5 19L8.5 12L15.5 5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NotificationPage = () => {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleClearAll = useCallback(() => {
    // TODO: integrate with notifications API when available
  }, []);

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
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium text-[#0A0A19]/70"
          >
            Clear all
          </button>
        </div>
      </header>

      <section className="px-4 py-8">
        <div className="rounded-3xl border border-black/5 bg-white p-6 text-center text-sm text-gray-500">
          Belum ada notifikasi terbaru.
        </div>
      </section>
    </main>
  );
};

export default NotificationPage;
