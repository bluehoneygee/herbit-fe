"use client";

import Tree from "@/components/tracker/tree";
import { ChevronLeft } from "lucide-react";

export default function YourTree() {
  return (
    <main  className="min-h-screen bg-white mb-30">
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
            Habit
          </span>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#0A0A19]">
            Progress Pohonmu
          </h1>
        </div>  
      </header>

        {/* Konten utama */}
        <div className="mt-6 space-y-4">
          <Tree />
        </div>
    </main>
  );
}
