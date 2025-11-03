"use client";

import Link from "next/link";
import ProgressCardTracker from "@/components/tracker/progressCardTracker";
import DailyTasks from "@/components/tracker/taskTracker";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WeeklyProgress from "@/components/tracker/weeklyProgress";

export default function Tracker() {
  return (
    <main className="min-h-screen bg-white mb-24">
      <header
        className="px-4"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        {/* Tombol kembali + judul utama */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="h-11 w-11 rounded-2xl border border-black/10 bg-white shadow-sm flex items-center justify-center transition-transform duration-150 active:scale-95"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>

          <span className="text-xl font-bold text-gray-900">
            Home
          </span>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#0A0A19]">
            Tantangan Hari Ini
          </h1>
        </div>  

        {/* Baris tanggal + tombol kanan */}
        <div className="mt-8 flex items-center justify-between flex-wrap gap-2">
          {/* Tanggal di kiri */}
          <p className="text-[#FEA800] font-semibold text-sm">
            {(() => {
              const d = new Date();
              const day = String(d.getDate()).padStart(2, "0");
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const year = d.getFullYear();
              return `${day}-${month}-${year}`;
            })()}
          </p>

          {/* Tombol di kanan */}
          <Link href="/tracker/tree">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center shadow-md transition-transform duration-150 active:scale-95 w-full sm:w-auto">
              Lihat Pohonmu
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Subjudul motivasi */}
        <p className="text-base text-amber-700 text-center font-medium mt-4">
          Yuk Ikuti Tantangan dan Hijaukan Pohonmu!
        </p>
      </header>

      {/* Konten utama */}
      <div className="mt-4 space-y-4">
        <ProgressCardTracker />
        <DailyTasks />
        <WeeklyProgress />
      </div>
    </main>
  );
}
