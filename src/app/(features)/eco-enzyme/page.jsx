// src/app/eco-enzyme/page.js
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

const CURRENT_USER_ID = "69030abde003c64806d5b2bb";

export default function EcoEnzymePage() {
  const api = useEcoEnzymeAPI(CURRENT_USER_ID);
  const [newEntry, setNewEntry] = useState("");

  // ✅ Hanya input berat sampah — tidak upload foto di sini
  const handleAddEntry = (e) => {
    e.preventDefault();
    const weight = parseFloat(newEntry);
    if (isNaN(weight) || weight <= 0) {
      alert("Masukkan berat > 0");
      return;
    }

    api.addUpload(weight)
      .then(() => {
        setNewEntry("");
      })
      .catch((err) => {
        alert("Gagal simpan data: " + err.message);
      });
  };

  const handleStartFermentation = async () => {
    if (api.totalWeightKg <= 0) {
      alert("Tambahkan sampah dulu!");
      return;
    }
    try {
      await api.startFermentation(api.totalWeightKg);
    } catch (err) {
      alert("Gagal mulai fermentasi: " + err.message);
    }
  };

  const tracker = React.useMemo(() => ({
    journalEntries: api.uploads.map(u => ({
      id: u._id,
      date: new Date(u.uploadedDate).toLocaleDateString("id-ID"),
      weight: (u.prePointsEarned / 10) * 1000
    })),
    totalWeightKg: api.totalWeightKg,
    gula: api.gula,
    air: api.air,
    isFermentationActive: api.isFermentationActive,
    daysRemaining: api.daysRemaining,
    harvestDate: api.harvestDate,
    daysCompleted: api.daysCompleted,
    progressPct: api.progressPct,
    totalWeight: api.totalWeightKg * 1000,
    totalFermentationDays: 90,
    newEntry,
    setNewEntry,
    addEntry: handleAddEntry,
    startFermentation: handleStartFermentation,
    resetAll: api.resetAll
  }), [
    api.uploads,
    api.totalWeightKg,
    api.gula,
    api.air,
    api.isFermentationActive,
    api.daysRemaining,
    api.harvestDate,
    api.daysCompleted,
    api.progressPct,
    newEntry
  ]);

  // 🔍 Debug: Uncomment jika perlu
  // React.useEffect(() => {
  //   console.log("API state:", { 
  //     loading: api.loading, 
  //     error: api.error, 
  //     project: api.project,
  //     uploads: api.uploads 
  //   });
  // }, [api.loading, api.error, api.project, api.uploads]);

  if (api.loading) return <div className="p-8 text-center">Loading...</div>;
  
  if (api.error) {
    console.error("EcoEnzymePage error:", api.error);
    return (
      <div className="p-8 text-center text-red-500">
        Error: {typeof api.error === 'string' ? api.error : JSON.stringify(api.error)}
      </div>
    );
  }

  return (
    <main key={CURRENT_USER_ID} className="min-h-screen bg-white-50 p-4 sm:p-6 lg:py-8 lg:px-8 pb-24">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-2 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg w-10 h-10 bg-white shadow-md hover:bg-gray-50 p-0 transition-transform duration-150 active:scale-95"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Eco Enzyme</h1>
          </div>

          <Link
            href="/eco-enzyme/timeline"
            passHref
            className="ml-14 w-full sm:w-auto mt-1 flex-shrink-0"
          >
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold flex items-center shadow-md transition-transform duration-150 active:scale-95 w-full sm:w-auto">
              Lihat Timeline <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <p className="text-base text-amber-700 font-medium ml-14 mt-1">
            Yuk Ubah Sampah Dapur Jadi Cairan Ajaib 🌱
          </p>
        </div>

        {api.isFermentationActive && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            📅 Fermentasi sedang berjalan. Untuk upload foto progress (hari ke-30/60/90), 
            silakan kunjungi halaman <Link href="/eco-enzyme/timeline" className="font-bold underline">Timeline</Link>.
          </div>
        )}

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