"use client";

import DailyHabitsList from "@/components/home/DailyHabitsList";
import DaysScroller from "@/components/home/DaysScroller";
import EcoEnzymActive from "@/components/home/EcoEnzymActive";
import HeaderHero from "@/components/home/HeaderHero";
import ProgressCard from "@/components/home/ProgressCard";
import RewardsBanner from "@/components/home/RewardsBanner";
import useHomeSummary from "@/hooks/useHomeSummary";
import { clampNumber } from "@/lib/utils";
import { useMemo } from "react";

export default function HomePage() {
  const { summary, loading, error } = useHomeSummary();

  const {
    user,
    progress,
    ecoenzym,
    rewardsBanners = [],
    habitsToday = [],
  } = summary ?? {};

  const progressData = useMemo(() => {
    const total = progress?.total ?? 0;
    const completed = progress?.completed ?? 0;
    const percent = clampNumber(progress?.percent ?? 0);
    const title =
      percent >= 100 ? "Semua task selesai! 🎉" : "Hampir selesai! 🔥";
    const subtitle = `${completed} dari ${total} task selesai`;
    return { total, completed, percent, title, subtitle };
  }, [progress]);

  const ecoData = useMemo(() => {
    if (!ecoenzym) {
      return {
        batch: "Eco Enzym",
        info: "Belum ada proyek eco-enzym aktif",
        progress: 0,
      };
    }

    const info = `${ecoenzym.daysRemaining ?? 0} hari lagi • Bulan ke-${
      ecoenzym.monthNumber ?? "-"
    }`;

    return {
      batch: ecoenzym.batch ?? "Eco Enzym",
      info,
      progress: ecoenzym.progressPercent ?? 0,
    };
  }, [ecoenzym]);

  return (
    <main className="relative min-h-screen">
      <div className="absolute inset-x-0 top-0 -z-10">
        <div className="h-[420px] w-full rounded-b-[80px] bg-transparent" />
      </div>

      <HeaderHero user={loading ? null : user} />

      <section className="mt-[12px] space-y-3 pb-6">
        {error && (
          <div className="mx-4 rounded-2xl border border-[#E24B4B]/20 bg-[#E24B4B]/10 p-4 text-sm text-[#8B1E1E]">
            Gagal memuat data: {error}. Silakan coba beberapa saat lagi.
          </div>
        )}

        <div className="mx-4">
          <DaysScroller />
        </div>

        <div className="mx-4">
          <RewardsBanner items={rewardsBanners} />
        </div>

        <div className="mx-4">
          <ProgressCard
            percent={progressData.percent}
            title={progressData.title}
            subtitle={progressData.subtitle}
          />
        </div>

        <div className="space-y-1 px-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Eco-enzym Aktif
            </h3>
            <button className="text-[11px] font-semibold text-gray-800 tracking-wide">
              LIHAT SEMUA
            </button>
          </div>
          <EcoEnzymActive
            batch={ecoData.batch}
            info={ecoData.info}
            progress={ecoData.progress}
          />
        </div>

        <div className="space-y-1 px-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Daily Habits
            </h3>
            <button className="text-[11px] font-semibold text-gray-800 tracking-wide">
              LIHAT SEMUA
            </button>
          </div>
          <DailyHabitsList items={habitsToday} loading={loading} />
        </div>
      </section>
    </main>
  );
}
