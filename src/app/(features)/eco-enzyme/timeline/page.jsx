// src/app/eco-enzyme/timeline/page.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import ChatButton from "@/components/floating-chat/ChatButton";
import { useToast, ToastContainer } from "@/components/ecoenzyme/timeline/TimelineToast";
import DayItem from "@/components/ecoenzyme/timeline/DayItem";
import MonthSection from "@/components/ecoenzyme/timeline/MonthSection";
import FinalClaimCard from "@/components/ecoenzyme/timeline/FinalClaimCard";
import TimelineHeader from "@/components/ecoenzyme/timeline/TimelineHeader";
import TimelineProgressCard from "@/components/ecoenzyme/timeline/TimelineProgressCard";

const CURRENT_USER_ID = "69030abde003c64806d5b2bb"; // Ganti sesuai auth
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const TOTAL_DAYS = 90;
const DAYS_PER_MONTH = 30;
const DAYS_PER_WEEK = 7;
const WEEKS = 13;
const TOTAL_POINTS = 150;

// Helper functions
function startFromHarvestIso(harvestIso) {
  if (!harvestIso) return null;
  const harvest = new Date(harvestIso);
  const start = new Date(harvest);
  start.setDate(harvest.getDate() - TOTAL_DAYS);
  start.setHours(0, 0, 0, 0);
  return start;
}

function dayDateFromStart(startDate, dayIndex) {
  const d = new Date(startDate);
  d.setDate(startDate.getDate() + (dayIndex - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayIndexToMonth(dayIndex) {
  return Math.min(3, Math.ceil(dayIndex / DAYS_PER_MONTH));
}

function monthRange(month) {
  const start = (month - 1) * DAYS_PER_MONTH + 1;
  const end = Math.min(month * DAYS_PER_MONTH, TOTAL_DAYS);
  return { start, end };
}

function getDominantMonth(startDay, endDay) {
  const monthRanges = [
    { month: 1, start: 1, end: DAYS_PER_MONTH },
    { month: 2, start: DAYS_PER_MONTH + 1, end: DAYS_PER_MONTH * 2 },
    { month: 3, start: DAYS_PER_MONTH * 2 + 1, end: TOTAL_DAYS },
  ];
  let maxDays = -1;
  let dominantMonth = 0;
  for (const range of monthRanges) {
    const overlapStart = Math.max(startDay, range.start);
    const overlapEnd = Math.min(endDay, range.end);
    const daysInMonth = Math.max(0, overlapEnd - overlapStart + 1);
    if (daysInMonth > maxDays) {
      maxDays = daysInMonth;
      dominantMonth = range.month;
    }
  }
  return dominantMonth;
}

// API calls
async function fetchProject(userId) {
  const res = await fetch(`${API_BASE}/ecoenzim/projects?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  const projects = await res.json();
  return projects.find(p => p.status === "ongoing" || p.status === "not_started") || null;
}

async function fetchUploads(projectId) {
  const res = await fetch(`${API_BASE}/ecoenzim/uploads/project/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch uploads");
  return await res.json();
}

async function createCheckin(projectId, userId) {
  const res = await fetch(`${API_BASE}/ecoenzim/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ecoenzimProjectId: projectId,
      userId,
      uploadedDate: new Date().toISOString(),
      prePointsEarned: 1,
      monthNumber: null,
      photoUrl: null
    })
  });
  if (!res.ok) throw new Error("Failed to create check-in");
  return await res.json();
}

async function uploadPhoto(projectId, userId, monthNumber, photoDataUrl) {
  const res = await fetch(`${API_BASE}/ecoenzim/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ecoenzimProjectId: projectId,
      userId,
      monthNumber,
      photoUrl: photoDataUrl,
      uploadedDate: new Date().toISOString(),
      prePointsEarned: 50
    })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload photo");
  }
  return await res.json();
}

async function claimFinalPoints(projectId) {
  const res = await fetch(`${API_BASE}/ecoenzim/projects/${projectId}/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to claim points");
  }
  return await res.json();
}

export default function TimelinePage() {
  const [project, setProject] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [openWeeks, setOpenWeeks] = useState(() => new Set([0]));
  const toast = useToast();

  // Load data from backend
  const loadData = async () => {
    try {
      setLoading(true);
      const proj = await fetchProject(CURRENT_USER_ID);
      if (proj) {
        setProject(proj);
        const ups = await fetchUploads(proj._id);
        setUploads(ups);
      } else {
        setProject(null);
        setUploads([]);
      }
    } catch (err) {
      console.error("Load data error:", err);
      toast.push("Gagal memuat data: " + err.message, { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Derived states
  const harvestIso = project?.endDate;
  const startDate = useMemo(() => startFromHarvestIso(harvestIso), [harvestIso]);
  
  const currentDayIndex = useMemo(() => {
    if (!startDate) return 0;
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const normalizedStart = new Date(startDate);
    normalizedStart.setHours(0, 0, 0, 0);
    const diffMs = today.getTime() - normalizedStart.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 0;
    if (diffDays >= TOTAL_DAYS) return TOTAL_DAYS;
    return diffDays + 1;
  }, [startDate, now]);

  const activeWeekIndex = useMemo(() => {
    if (!currentDayIndex || currentDayIndex === 0) return 0;
    return Math.floor((currentDayIndex - 1) / DAYS_PER_WEEK);
  }, [currentDayIndex]);

  // Build checkins map from uploads
  const checkins = useMemo(() => {
    const map = {};
    if (!startDate || !uploads.length) return map;
    
    uploads.forEach(upload => {
      // Daily check-in (monthNumber = null)
      if (!upload.monthNumber) {
        const uploadDate = new Date(upload.uploadedDate);
        uploadDate.setHours(0, 0, 0, 0);
        const diffMs = uploadDate.getTime() - startDate.getTime();
        const dayIndex = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
        if (dayIndex >= 1 && dayIndex <= TOTAL_DAYS) {
          map[dayIndex] = { checked: true, at: upload.uploadedDate };
        }
      }
    });
    return map;
  }, [uploads, startDate]);

  // Build photos map from uploads
  const photos = useMemo(() => {
    const map = {};
    uploads.forEach(upload => {
      if (upload.monthNumber && upload.photoUrl) {
        map[`month${upload.monthNumber}`] = upload.photoUrl;
      }
    });
    return map;
  }, [uploads]);

  const isDayUnlocked = (dayIndex) => {
    if (!currentDayIndex) return false;
    return dayIndex <= currentDayIndex;
  };

  const harvestDate = harvestIso ? new Date(harvestIso) : null;

  // Handlers
  const handleCheckin = async (dayIndex) => {
    if (!isDayUnlocked(dayIndex)) {
      toast.push("Belum waktunya check-in untuk hari ini.", { duration: 2000 });
      return;
    }
    
    if (checkins[dayIndex]?.checked) {
      toast.push("Sudah check-in untuk hari ini.", { duration: 2000 });
      return;
    }

    try {
      await createCheckin(project._id, CURRENT_USER_ID);
      toast.push("Check-in berhasil ✅", { duration: 2000 });
      await loadData(); // Refresh data
    } catch (err) {
      console.error("Check-in error:", err);
      toast.push("Gagal check-in: " + err.message, { duration: 3000 });
    }
  };

  const handlePhotoUpload = async (month, file) => {
    if (!file) return;
    
    // Check if it's the right day
    const dayIndex = month * 30; // Day 30, 60, 90
    if (!isDayUnlocked(dayIndex)) {
      toast.push(`Belum waktunya upload foto bulan ${month}`, { duration: 3000 });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      try {
        await uploadPhoto(project._id, CURRENT_USER_ID, month, dataUrl);
        toast.push(`Foto Bulanan (Bulan ${month}) berhasil di-upload`, { duration: 2500 });
        await loadData(); // Refresh data
      } catch (err) {
        console.error("Upload photo error:", err);
        toast.push("Gagal upload foto: " + err.message, { duration: 3000 });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFinalClaim = async () => {
    if (project.isClaimed) {
      toast.push("Poin akhir sudah diklaim sebelumnya.", { duration: 3000 });
      return;
    }

    try {
      await claimFinalPoints(project._id);
      toast.push(`🎉 Selamat! Anda mengklaim ${TOTAL_POINTS} Poin!`, { duration: 5000 });
      await loadData(); // Refresh data
    } catch (err) {
      console.error("Claim error:", err);
      toast.push(err.message, { duration: 4000 });
    }
  };

  // Check final claim conditions
  const totalDaysDone = Object.keys(checkins).filter(k => /^\d+$/.test(k) && checkins[k]?.checked).length;
  const allCheckinsDone = totalDaysDone >= TOTAL_DAYS;
  const allPhotosUploaded = !!photos['month1'] && !!photos['month2'] && !!photos['month3'];
  const isReadyForClaim = allCheckinsDone && allPhotosUploaded && !project?.isClaimed;
  const isFinalClaimed = project?.isClaimed || project?.status === "completed";

  // Data iteration for weeks
  const weeks = [];
  for (let w = 0; w < WEEKS; w++) {
    const startDay = w * DAYS_PER_WEEK + 1;
    const days = [];
    for (let i = 0; i < DAYS_PER_WEEK; i++) {
      const dayIndex = startDay + i;
      if (dayIndex > TOTAL_DAYS) break;
      const date = startDate ? dayDateFromStart(startDate, dayIndex) : null;
      
      let label = `Hari ${dayIndex}: Check-in Rutin`;
      if (dayIndex === 30 || dayIndex === 60 || dayIndex === 90) {
        label = `Hari ${dayIndex}: Upload Foto Bulanan`;
      }
      
      const unlocked = isDayUnlocked(dayIndex);
      const checked = !!(checkins[dayIndex]?.checked);
      days.push({ dayIndex, date, label, unlocked, checked });
    }
    weeks.push({ weekIndex: w, startDay, endDay: Math.min(startDay + DAYS_PER_WEEK - 1, TOTAL_DAYS), days });
  }

  // Month summary
  const monthSummary = (month) => {
    const { start, end } = monthRange(month);
    let total = end - start + 1;
    let done = 0;
    for (let d = start; d <= end; d++) {
      if (checkins[d]?.checked) done++;
    }
    return {
      start,
      end,
      total,
      done,
      pct: Math.round((done / total) * 100) || 0,
      photo: photos[`month${month}`] || null
    };
  };

  const overallPct = Math.round((totalDaysDone / TOTAL_DAYS) * 100) || 0;

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-white-50 p-4 sm:p-6 lg:p-12 pb-60">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </main>
    );
  }

  // No project state
  if (!project) {
    return (
      <main className="min-h-screen bg-white-50 p-4 sm:p-6 lg:p-12 pb-60">
        <div className="max-w-xl mx-auto">
          <Card className="rounded-2xl shadow-lg border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Link href="/eco-enzyme">
                    <Button variant="ghost" size="icon" className="rounded-lg bg-white shadow-md">
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </Button>
                  </Link>
                  <h1 className="font-extrabold text-xl text-purple-600">Timeline Fermentasi</h1>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700">Timeline belum aktif karena belum ada proses fermentasi yang dimulai.</p>
                  <p className="text-sm text-gray-500">Silakan mulai fermentasi Eco Enzyme Anda di halaman Eco Enzyme untuk mengaktifkan pelacakan 90 hari.</p>
                  <Link href="/eco-enzyme">
                    <Button className="bg-purple-600 text-white hover:bg-purple-700 w-full">
                      Mulai Fermentasi Sekarang
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <ChatButton />
        <ToastContainer toasts={toast.toasts} remove={toast.remove} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white-50 p-4 sm:p-6 lg:py-8 lg:px-8 pb-24">
      <style jsx global>{`
        @keyframes pulse-once { 0%, 100% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); } 50% { box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.3), 0 4px 6px -4px rgba(168, 85, 247, 0.2); } }
        .animate-pulse-once { animation: pulse-once 2s ease-in-out 1; }
        @keyframes bounce-once { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.1); } 50% { transform: scale(0.95); } 75% { transform: scale(1.05); } }
        .animate-bounce-once { animation: bounce-once 0.6s ease-out 1; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}</style>
      
      <div className="w-full mx-auto max-w-10xl">
        <TimelineHeader startDate={startDate} harvestDate={harvestDate} />
        
        <TimelineProgressCard
          totalDaysDone={totalDaysDone}
          progressPct={overallPct}
          isFermentationActive={!!harvestIso}
        />

        <div className="space-y-6 mt-6">
          {[1, 2, 3].map((month) => {
            const monthWeeks = weeks.filter(w => getDominantMonth(w.startDay, w.endDay) === month);
            const summary = monthSummary(month);
            
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
                openWeeks={openWeeks}
                setOpenWeeks={setOpenWeeks}
                activeWeekIndex={activeWeekIndex}
              />
            );
          })}
        </div>

        <div className="mt-12">
          <FinalClaimCard
            isReadyForClaim={isReadyForClaim}
            isFinalClaimed={isFinalClaimed}
            allCheckinsDone={allCheckinsDone}
            allPhotosUploaded={allPhotosUploaded}
            TOTAL_POINTS={TOTAL_POINTS}
            handleFinalClaim={handleFinalClaim}
          />
        </div>
      </div>
      
      <ChatButton />
      <ToastContainer toasts={toast.toasts} remove={toast.remove} />
    </main>
  );
}