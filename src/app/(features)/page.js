"use client";

import DailyHabitsList from "@/components/home/DailyHabitsList";
import EcoEnzymActive from "@/components/home/EcoEnzymActive";
import HeaderHero from "@/components/home/HeaderHero";
import ProgressCard from "@/components/home/ProgressCard";
import RewardsBanner from "@/components/home/RewardsBanner";
import useHomeSummary from "@/hooks/useHomeSummary";
import { clampNumber } from "@/lib/utils";
import Link from "next/link";
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
  console.log("Home summary data:", summary);

  const progressData = useMemo(() => {
    const total = progress?.total ?? 0;
    const completed = progress?.completed ?? 0;
    const percent = clampNumber(progress?.percent ?? 0);
    const { title, subtitle } = (() => {
      if (!total || percent === 0) {
        return {
          title: "Belum mulai hari ini?",
          subtitle: "Ayo mulai, voucher udah siap nungguin kamu",
        };
      }
      if (percent >= 100) {
        return {
          title: "Semua task selesai!",
          subtitle: `${completed} dari ${total} task selesai`,
        };
      }
      return {
        title: "Hampir selesai!",
        subtitle: `${completed} dari ${total} task selesai`,
      };
    })();
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

    const batchNumber = ecoenzym.batchNumber ?? null;
    const batch =
      typeof batchNumber === "number"
        ? `Eco Enzym Batch#${batchNumber}`
        : "Eco Enzym";

    const daysRemaining = Number.isFinite(ecoenzym.daysRemaining)
      ? ecoenzym.daysRemaining
      : null;
    const info =
      daysRemaining !== null
        ? `${daysRemaining} hari tersisa`
        : "Sedang berjalan";

    return {
      batch,
      info,
      progress: ecoenzym.progress ?? 0,
    };
  }, [ecoenzym]);

  return (
    <main className="relative min-h-screen bg-white">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] w-full rounded-b-[80px] bg-transparent" />

      <div
        className="sticky top-0 z-20 border-black/5 bg-white/95 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <HeaderHero user={user} loading={loading} />

        <div className="mt-6 space-y-6">
          {error && (
            <div className="mx-4 rounded-2xl border border-[#E24B4B]/20 bg-[#E24B4B]/10 p-4 text-sm text-[#8B1E1E]">
              Gagal memuat data: {error}. Silakan coba beberapa saat lagi.
            </div>
          )}

          <div className="mx-4">
            <RewardsBanner items={rewardsBanners} loading={loading} />
          </div>

          <div className="mx-4">
            <ProgressCard
              percent={progressData.percent}
              title={progressData.title}
              subtitle={progressData.subtitle}
              loading={loading}
            />
          </div>

        </div>
      </div>

      <section className="space-y-3 px-4 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Eco-enzym Aktif
          </h3>
          <Link
            href="/eco-enzyme"
            className="text-[11px] font-semibold text-gray-800 tracking-wide"
          >
            LIHAT SEMUA
          </Link>
        </div>
        <EcoEnzymActive
          batch={ecoData.batch}
          info={ecoData.info}
          progress={ecoData.progress}
          loading={loading}
        />
      </section>

      <section className="space-y-3 px-4 pb-28 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Daily Habits</h3>
          <Link
            href="/tracker"
            className="text-[11px] font-semibold text-gray-800 tracking-wide"
          >
            LIHAT SEMUA
          </Link>
        </div>
        <DailyHabitsList items={habitsToday} loading={loading} />
      </section>
    </main>
  );
}
