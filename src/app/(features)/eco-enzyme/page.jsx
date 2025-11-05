// src/app/eco-enzyme/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import useEcoEnzymeAPI from "@/hooks/useEcoEnzymeAPI";
import EcoEnzymeCalculator from "@/components/ecoenzyme/EcoEnzymeCalculator";
import EcoEnzymeProgress from "@/components/ecoenzyme/EcoEnzymeProgress";
import EcoEnzymeSteps from "@/components/ecoenzyme/EcoEnzymeSteps";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import ChatButton from "@/components/floating-chat/ChatButton";
import Link from "next/link";
import apiClient from "@/lib/apiClient";

export default function EcoEnzymePage() {
  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        setUserLoading(true);
        const response = await apiClient.get("/auth/me", {
          headers: { "Cache-Control": "no-cache" },
        });
        const data = response.data ?? {};
        if (!active) return;
        const payload = data?.data ?? data;
        const resolvedId =
          payload?._id || payload?.id || payload?.user?._id || null;
        setUserId(resolvedId);
        setUserError(null);
      } catch (error) {
        if (!active) return;
        console.error("[EcoEnzymePage] gagal mengambil user:", error);
        setUserError(error instanceof Error ? error.message : String(error));
        setUserId(null);
      } finally {
        if (active) setUserLoading(false);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  const api = useEcoEnzymeAPI(userId);
  const [newEntry, setNewEntry] = useState("");

  console.log("[EcoEnzymePage] state", {
    userId,
    userLoading,
    userError,
    loading: api.loading,
    error: api.error ? api.error?.message || api.error : null,
    project: api.project,
    uploadsCount: api.uploads?.length,
  });

  const handleAddEntry = (e) => {
    e.preventDefault();
    const weight = parseFloat(newEntry);
    if (isNaN(weight) || weight <= 0) {
      alert("Masukkan berat > 0");
      return;
    }

    api
      .addUpload(weight)
      .then(() => setNewEntry(""))
      .catch((err) => alert("Gagal simpan data: " + (err?.message || err)));
  };

  const handleStartFermentation = async () => {
    if (api.totalWeightKg <= 0) {
      alert("Tambahkan sampah dulu!");
      return;
    }
    try {
      await api.startFermentation(api.totalWeightKg);
      // refetch to sync UI
      await api.refetch();
    } catch (err) {
      alert("Gagal mulai fermentasi: " + (err?.message || err));
    }
  };

  const tracker = React.useMemo(() => {
    const journalEntries = (api.uploads || []).map((u) => {
      const uploadDate = u?.uploadedDate ? new Date(u.uploadedDate) : null;
      const weightCandidate =
        typeof u?.weight === "number"
          ? u.weight
        : typeof u?.weightKg === "number"
          ? u.weightKg
          : typeof u?.organicWasteWeight === "number"
          ? u.organicWasteWeight
          : Number(u?.prePointsEarned || 0) / 10;

      const weightKg = Number.isFinite(weightCandidate)
        ? Number(weightCandidate)
        : 0;

      return {
        id: u?._id || u?.id,
        date: uploadDate
          ? uploadDate.toLocaleDateString("id-ID")
          : "Tanggal tidak diketahui",
        weightKg,
        weight: Number.isFinite(weightKg) ? weightKg * 1000 : 0, // keep legacy grams field
        prePointsEarned: Number(u?.prePointsEarned ?? 0),
      };
    });

    const totalWeightKg = Number(api.totalWeightKg || 0);
    const organicWeightKg = Number(api.organicWeightKg || 0);

    if (journalEntries.length === 0 && organicWeightKg > 0) {
      const projectDate = api.project?.startDate || api.project?.createdAt;
      const displayDate = projectDate
        ? new Date(projectDate).toLocaleDateString("id-ID")
        : "Fermentasi dimulai";

      journalEntries.push({
        id: api.project?._id ? `${api.project._id}-initial` : "ecoenzyme-initial",
        date: displayDate,
        weightKg: organicWeightKg,
        weight: organicWeightKg * 1000,
        prePointsEarned: organicWeightKg * 10,
      });
    }

    return {
      journalEntries,
      totalWeightKg,
      gula: api.gula,
      air: api.air,
      isFermentationActive: api.isFermentationActive,
      daysRemaining: api.daysRemaining,
      harvestDate: api.harvestDate,
      daysCompleted: api.daysCompleted,
      progressPct: api.progressPct,
      organicWeightKg,
      totalWeight: totalWeightKg * 1000,
      totalFermentationDays: 90,
      newEntry,
      setNewEntry,
      addEntry: handleAddEntry,
      startFermentation: handleStartFermentation,
      resetAll: api.resetAll,
    };
  }, [api, newEntry]);

  if (userLoading || api.loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (userError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {userError}. Silakan login ulang.
      </div>
    );
  }

  if (api.error) {
    console.error("EcoEnzymePage error:", api.error);
    return (
      <div className="p-8 text-center text-red-500">
        Error: {(api.error && api.error.message) || String(api.error)}
      </div>
    );
  }

  const fermentationStart = api.project?.startDate
    ? new Date(api.project.startDate)
    : null;
  const fermentationEnd = api.project?.endDate
    ? new Date(api.project.endDate)
    : null;

  return (
    <main className="min-h-screen bg-white pb-24">
      <header
        className="sticky top-0 z-20 bg-white px-4 pb-4 backdrop-blur"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-gray-900">
            Fermentasi Eco Enzyme
          </span>
        </div>

        <div className="mt-8 flex items-center justify-between flex-wrap gap-3 text-sm text-gray-600">
          <div className="flex flex-col">
            <span>
              Mulai:
              <span className="font-semibold text-amber-500 ml-1">
                {fermentationStart
                  ? fermentationStart.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </span>
            <span>
              Panen:
              <span className="font-semibold text-amber-500 ml-1">
                {fermentationEnd
                  ? fermentationEnd.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </span>
          </div>
          {api.isFermentationActive ? (
            <Link href="/eco-enzyme/timeline" className="w-auto">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition-transform duration-150 active:scale-95">
                Lihat Timeline
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleStartFermentation}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md transition-transform duration-150 active:scale-95"
            >
              Mulai Fermentasi 90 Hari
            </Button>
          )}
        </div>

        <p className="text-base text-amber-700 text-center font-medium mt-4">
          Yuk ubah sampah dapur jadi cairan ajaib, satu check-in setiap hari!
        </p>
      </header>

      <div className="mt-4 space-y-6 px-4">
        <EcoEnzymeProgress {...tracker} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <EcoEnzymeCalculator tracker={tracker} />
        </div>

        <EcoEnzymeSteps />
      </div>

      <ChatButton />
    </main>
  );
}
