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
        className="sticky top-0 z-20 bg-white px-4 pb-4 backdrop-blur"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        {/* Tombol kembali + judul utama */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-gray-900">
            Tantangan Hari Ini
          </span>
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
