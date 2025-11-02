// src/app/eco-enzyme/timeline/page.jsx
"use client";

import React, { useState } from "react";
import useEcoEnzymeAPI from "@/hooks/useEcoEnzymeAPI";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import ChatButton from "@/components/floating-chat/ChatButton";
import TimelineHeader from "@/components/ecoenzyme/timeline/TimelineHeader";
import TimelineProgressCard from "@/components/ecoenzyme/timeline/TimelineProgressCard";
import MonthSection from "@/components/ecoenzyme/timeline/MonthSection";
import FinalClaimCard from "@/components/ecoenzyme/timeline/FinalClaimCard";

// GANTI DENGAN USER ID YANG SEDANG LOGIN
const CURRENT_USER_ID = "69030abde003c64806d5b2bb";
// const api = useEcoEnzymeAPI(CURRENT_USER_ID);

export default function TimelinePage() {
  const api = useEcoEnzymeAPI(CURRENT_USER_ID);
  const [pendingUpload, setPendingUpload] = useState(null);

  // Handler upload foto
  const handlePhotoUpload = (month, file) => {
    if (!file || !api.project) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await api.addUploadWithPhoto(0, e.target.result, month); // Berat 0 karena sudah ada di project
        setPendingUpload(null);
      } catch (err) {
        alert("Gagal upload: " + err.message);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handler check-in (jika diperlukan)
  const handleCheckin = async (dayIndex) => {
    // Opsional: jika kamu ingin simpan check-in di backend
    // Saat ini check-in hanya untuk membuka upload
    console.log("Check-in hari", dayIndex);
  };

  if (api.loading) return <div className="p-8 text-center">Loading...</div>;
  if (api.error) return <div className="p-8 text-center text-red-500">Error: {api.error}</div>;

  // Jika belum ada project
  if (!api.project) {
    return (
      <main className="min-h-screen bg-white-50 p-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/eco-enzyme">
                <Button variant="ghost" size="icon" className="rounded-lg bg-white shadow-md">
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </Button>
              </Link>
              <h1 className="font-extrabold text-xl text-purple-600">Timeline Fermentasi</h1>
            </div>
            <p className="text-gray-700 mb-4">
              Timeline belum aktif karena belum ada proses fermentasi yang dimulai.
            </p>
            <Link href="/eco-enzyme">
              <Button className="bg-purple-600 text-white hover:bg-purple-700 w-full">
                Mulai Fermentasi Sekarang
              </Button>
            </Link>
          </div>
        </div>
        <ChatButton />
      </main>
    );
  }

  // Hitung data timeline
  const TOTAL_DAYS = 90;
  const startDate = new Date(api.project.startDate);
  const now = new Date();
  const currentDayIndex = Math.min(
    Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1,
    TOTAL_DAYS
  );

  // Buat struktur weeks (sama seperti sebelumnya)
  const weeks = [];
  for (let w = 0; w < 13; w++) {
    const startDay = w * 7 + 1;
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = startDay + i;
      if (dayIndex > TOTAL_DAYS) break;
      
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + dayIndex - 1);
      
      let label = `Hari ${dayIndex}: Check-in Rutin`;
      if (dayIndex === 30 || dayIndex === 60 || dayIndex === 90) {
        label = `Hari ${dayIndex}: Upload Foto Bulanan`;
      }
      
      const unlocked = dayIndex <= currentDayIndex;
      const checked = true; // Di backend, check-in otomatis saat upload
      
      days.push({ dayIndex, date, label, unlocked, checked });
    }
    weeks.push({ weekIndex: w, startDay, endDay: Math.min(startDay + 6, TOTAL_DAYS), days });
  }

  // Hitung progress
  const totalDaysDone = currentDayIndex;
  const overallPct = Math.round((totalDaysDone / TOTAL_DAYS) * 100);

  // Format foto untuk komponen
  const photos = {};
  api.uploads.forEach(upload => {
    if (upload.status === "verified") {
      photos[`month${upload.monthNumber}`] = upload.photoUrl;
    }
  });

  return (
    <main className="min-h-screen bg-white-50 p-4 sm:p-6 lg:py-8 lg:px-8 pb-24">
      <div className="w-full mx-auto max-w-10xl">
        <TimelineHeader 
          startDate={startDate} 
          harvestDate={api.harvestDate} 
        />
        
        <TimelineProgressCard
          totalDaysDone={totalDaysDone}
          progressPct={overallPct}
          isFermentationActive={api.isFermentationActive}
        />

        <div className="space-y-6 mt-6">
          {[1, 2, 3].map((month) => {
            const monthWeeks = weeks.filter(w => {
              const start = w.startDay;
              const end = w.endDay;
              return (start <= month * 30 && end >= (month - 1) * 30 + 1);
            });
            
            const start = (month - 1) * 30 + 1;
            const end = Math.min(month * 30, TOTAL_DAYS);
            const total = end - start + 1;
            const done = total; // Anggap semua hari selesai
            
            const summary = { start, end, total, done, pct: 100 };
            
            return (
              <MonthSection
                key={month}
                month={month}
                summary={summary}
                monthWeeks={monthWeeks}
                startDate={startDate}
                currentDayIndex={currentDayIndex}
                photos={photos}
                handleCheckin={handleCheckin}
                handlePhotoUpload={handlePhotoUpload}
                openWeeks={new Set([0])}
                setOpenWeeks={() => {}}
                activeWeekIndex={Math.floor((currentDayIndex - 1) / 7)}
                projectStatus={api.status} // ✅ Kirim status ke MonthSection
              />
            );
          })}
        </div>

        <div className="mt-12">
          <FinalClaimCard 
      canClaim={api.canClaim}           // ✅ Dari backend
      isFinalClaimed={api.isFinalClaimed} // ✅ Dari backend  
      handleFinalClaim={api.handleClaimPoints} // ✅ Fungsi klaim
    />
  );
        </div>
      </div>
      <ChatButton />
    </main>
  );
}