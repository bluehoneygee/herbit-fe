// src/app/eco-enzyme/page.jsx
"use client";

import React, { useState } from "react";
import useEcoEnzymeAPI from "@/hooks/useEcoEnzymeAPI";
import EcoEnzymeCalculator from "@/components/ecoenzyme/EcoEnzymeCalculator";
import EcoEnzymeProgress from "@/components/ecoenzyme/EcoEnzymeProgress";
import EcoEnzymeSteps from "@/components/ecoenzyme/EcoEnzymeSteps";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChatButton from "@/components/floating-chat/ChatButton";
import Link from "next/link";

const CURRENT_USER_ID = "69030abde003c64806d5b2bb"; // ganti sesuai auth

export default function EcoEnzymePage() {
  const api = useEcoEnzymeAPI(CURRENT_USER_ID);
  const [newEntry, setNewEntry] = useState("");

  const handleAddEntry = (e) => {
    e.preventDefault();
    const weight = parseFloat(newEntry);
    if (isNaN(weight) || weight <= 0) {
      alert("Masukkan berat > 0");
      return;
    }

    api.addUpload(weight)
      .then(() => setNewEntry(""))
      .catch(err => alert("Gagal simpan data: " + (err?.message || err)));
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

  const tracker = React.useMemo(() => ({
    journalEntries: (api.uploads || []).map(u => ({
      id: u._id,
      date: new Date(u.uploadedDate).toLocaleDateString("id-ID"),
      weight: (u.prePointsEarned || 0) / 10 * 1000 // grams? keep consistent with your UI
    })),
    totalWeightKg: Number(api.totalWeightKg || 0),
    gula: api.gula,
    air: api.air,
    isFermentationActive: api.isFermentationActive,
    daysRemaining: api.daysRemaining,
    harvestDate: api.harvestDate,
    daysCompleted: api.daysCompleted,
    progressPct: api.progressPct,
    totalWeight: (api.totalWeightKg || 0) * 1000,
    totalFermentationDays: 90,
    newEntry,
    setNewEntry,
    addEntry: handleAddEntry,
    startFermentation: handleStartFermentation,
    resetAll: api.resetAll
  }), [api, newEntry]);

  if (api.loading) return <div className="p-8 text-center">Loading...</div>;

  if (api.error) {
    console.error("EcoEnzymePage error:", api.error);
    return <div className="p-8 text-center text-red-500">Error: {(api.error && api.error.message) || String(api.error)}</div>;
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:py-8 lg:px-8 pb-24">
      <div className="w-full mx-auto">
        <div className="flex flex-col gap-2 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => window.history.back()}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Eco Enzyme</h1>
          </div>
{api.isFermentationActive && (
          <Link href="/eco-enzyme/timeline" className="ml-14 w-full sm:w-auto mt-1">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto">
              Lihat Timeline <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
)}
          <p className="text-base text-amber-700 font-medium ml-14 mt-1">Yuk Ubah Sampah Dapur Jadi Cairan Ajaib 🌱</p>
        </div>

        <EcoEnzymeProgress {...tracker} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <EcoEnzymeCalculator tracker={tracker} />
        </div>

        <EcoEnzymeSteps />
        <ChatButton />
      </div>
    </main>
  );
}
