// features/eco-enzyme/timeline/page.jsx
// atau app/eco-enzyme/timeline/page.jsx (tergantung struktur Next.js Anda)

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

const APP_ID = "ecoenzyme-tracker-default";
const HARVEST_KEY = `ecoEnzymeHarvestDate_${APP_ID}`;
const POINTS_KEY = `ecoEnzymePoints_${APP_ID}`;
const PHOTOS_KEY = `ecoEnzymePhotos_ecoenzyme-tracker-default`;
const TIMELINE_KEY = "ecoEnzymeTimeline_ecoenzyme-tracker-default";
const FINAL_CLAIM_KEY = '__finalPointsClaimed';
const TOTAL_DAYS = 90;
const DAYS_PER_MONTH = 30;
const DAYS_PER_WEEK = 7;
const WEEKS = 13;
const POINTS_PER_MONTH = 50; 
const TOTAL_POINTS = 150; 
const TEST_SCENARIO = 'UPLOAD_TEST';

const checkFinalClaimConditions = (checkinsState, photosState) => {
    const isClaimed = checkinsState[FINAL_CLAIM_KEY] === true;
    let allCheckinsDone = true;
    for (let day = 1; day <= TOTAL_DAYS; day++) { 
        if (!checkinsState[day] || !checkinsState[day].checked) {
            allCheckinsDone = false;
            break; 
        }
    }
    const allPhotosUploaded = !!photosState['month1'] && !!photosState['month2'] && !!photosState['month3'];
    const isReady = allCheckinsDone && allPhotosUploaded;
    return { isReady, isClaimed, allCheckinsDone, allPhotosUploaded };
};

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
    return Math.min(3, Math.ceil(dayIndex / DAYS_PER_MONTH)); // 1..3
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
        } else if (daysInMonth === maxDays) { /* do nothing */ }
    }
    return dominantMonth;
}
// --- AKHIR KONSTANTA & FUNGSI PEMBANTU ---


export default function TimelinePage() {
    const [harvestIso, setHarvestIso] = useState(null);
    const [checkins, setCheckins] = useState({}); 
    const [photos, setPhotos] = useState({}); 
    const [points, setPoints] = useState(0);
    const [now, setNow] = useState(new Date());
    const [openWeeks, setOpenWeeks] = useState(() => new Set([0]));
    const toast = useToast();

    // --- LOGIKA UTAMA: KLAIM, USEEFFECT, USEMEMO ---

    const handleFinalClaim = () => {
        const { isReady, isClaimed } = checkFinalClaimConditions(checkins, photos);
        if (isClaimed) {
            toast.push("Poin akhir sudah diklaim sebelumnya.", { duration: 3000 });
            return;
        }
        if (isReady) {
            setPoints(p => p + TOTAL_POINTS); 
            setCheckins(prev => ({
                ...prev,
                [FINAL_CLAIM_KEY]: true 
            }));
            toast.push(`🎉 Selamat! Anda mengklaim ${TOTAL_POINTS} Poin!`, { duration: 5000 });
        } else {
            toast.push("Syarat klaim belum terpenuhi. Selesaikan 90 hari check-in dan 3 foto bulanan.", { duration: 4000 });
        }
    };

    // Load state dari localStorage
    useEffect(() => {
        const h = localStorage.getItem(HARVEST_KEY);
        if (h) setHarvestIso(h);
        const t = JSON.parse(localStorage.getItem(TIMELINE_KEY) || "{}");
        setCheckins(t);
        const p = JSON.parse(localStorage.getItem(PHOTOS_KEY) || "{}");
        setPhotos(p);
        const pts = parseInt(localStorage.getItem(POINTS_KEY) || "0", 10);
        setPoints(isNaN(pts) ? 0 : pts);
        const interval = setInterval(() => setNow(new Date()), 60 * 1000); // Update setiap 1 menit
        return () => clearInterval(interval);
    }, []);

    // Save state ke localStorage
    useEffect(() => { localStorage.setItem(TIMELINE_KEY, JSON.stringify(checkins)); }, [checkins]);
    useEffect(() => { localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos)); }, [photos]);
    useEffect(() => { localStorage.setItem(POINTS_KEY, String(points)); }, [points]);

    // Derived States (Memoized)
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

    const isDayUnlocked = (dayIndex) => {
        if (!currentDayIndex) return false;
        return dayIndex <= currentDayIndex;
    };
    const harvestDate = harvestIso ? new Date(harvestIso) : null;
    
    // Handlers
    const handleCheckin = (dayIndex) => {
        if (!isDayUnlocked(dayIndex)) {
            toast.push("Belum waktunya check-in untuk hari ini.", { duration: 2000 });
            return; 
        }
        const nowIso = new Date().toISOString();
        setCheckins((prev) => {
            if (prev[dayIndex] && prev[dayIndex].checked) return prev;
            const next = { ...prev, [dayIndex]: { checked: true, at: nowIso } };
            return next; 
        });
        toast.push("Check-in berhasil ✅", { duration: 2000 });
    };

    const handlePhotoUpload = (month, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            setPhotos((prev) => {
                const nextPhotos = ({ ...prev, [`month${month}`]: dataUrl });
                return nextPhotos;
            });
            toast.push(`Foto Bulanan (Bulan ${month}) tersimpan`, { duration: 2500 });
        };
        reader.readAsDataURL(file);
    };

    const resetAll = () => {
        if (!confirm("Reset semua data timeline, poin, dan foto?")) return;
        setHarvestIso(null);
        setCheckins({});
        setPhotos({});
        setPoints(0);
        localStorage.removeItem(HARVEST_KEY);
        localStorage.removeItem(TIMELINE_KEY);
        localStorage.removeItem(PHOTOS_KEY);
        localStorage.removeItem(POINTS_KEY);
        toast.push("Semua data direset", { duration: 1800 });
    };

    // Data Iteration for Weeks
    const weeks = [];
    for (let w = 0; w < WEEKS; w++) {
        const startDay = w * DAYS_PER_WEEK + 1;
        const days = [];
        for (let i = 0; i < DAYS_PER_WEEK; i++) {
            const dayIndex = startDay + i;
            if (dayIndex > TOTAL_DAYS) break;
            const date = startDate ? dayDateFromStart(startDate, dayIndex) : null; 
            
            let label = `Hari ${dayIndex}: Check-in Rutin`;
            if (dayIndex % 7 === 0) {
                label = `Hari ${dayIndex}: Check-in Rutin`; 
            }
            if (dayIndex === 30 || dayIndex === 60 || dayIndex === 90) {
                label = `Hari ${dayIndex}: Upload Foto Bulanan`; 
            }
            
            const unlocked = isDayUnlocked(dayIndex);
            const checked = !!(checkins && checkins[dayIndex] && checkins[dayIndex].checked);
            days.push({ dayIndex, date, label, unlocked, checked });
        }
        weeks.push({weekIndex: w, startDay, endDay: Math.min(startDay + DAYS_PER_WEEK - 1, TOTAL_DAYS), days});
    }

    // Data Iteration for Months Summary
    const monthSummary = (month) => {
        const { start, end } = monthRange(month);
        let total = end - start + 1;
        let done = 0;
        for (let d = start; d <= end; d++) if (checkins[d] && checkins[d].checked) done++;
        return { start, end, total, done, pct: Math.round((done / total) * 100) || 0, photo: photos[`month${month}`] || null };
    };

    const totalDaysDone = Object.keys(checkins).filter((k) => /^\d+$/.test(k) && checkins[k] && checkins[k].checked).length;
    const overallPct = Math.round((totalDaysDone / TOTAL_DAYS) * 100) || 0;
    const { isReady: isReadyForClaim, isClaimed: isFinalClaimed, allCheckinsDone, allPhotosUploaded } = checkFinalClaimConditions(checkins, photos);

    // --- TAMPILAN JIKA BELUM DIMULAI ---
    if (!harvestIso) {
        return (
            <main className="min-h-screen bg-white-50 p-4 sm:p-6 lg:p-12 pb-60">
                <div className="max-w-xl mx-auto">
                    <Card className="rounded-2xl shadow-lg border-2 border-purple-200">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-lg bg-white shadow-md">
                                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                                    </Button>
                                    <h1 className="font-extrabold text-xl text-purple-600">Timeline Fermentasi</h1>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-gray-700">Timeline belum aktif karena belum ada proses fermentasi yang dimulai.</p>
                                    <p className="text-sm text-gray-500">Silakan mulai fermentasi Eco Enzyme Anda di halaman Eco Enzyme untuk mengaktifkan pelacakan 90 hari.</p>
                                    <Link href="/eco-enzyme"><Button className="bg-purple-600 text-white hover:bg-purple-700 w-full">Mulai Fermentasi Sekarang</Button></Link>
                                    <Button variant="ghost" onClick={resetAll} className="text-red-500 w-full">Reset Semua Data Local</Button>
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
                /* Tambahkan CSS untuk Animasi Sederhana */
                @keyframes pulse-once { 0%, 100% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); }50% { box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.3), 0 4px 6px -4px rgba(168, 85, 247, 0.2); } } .animate-pulse-once {
                    animation: pulse-once 2s ease-in-out 1; }
                @keyframes bounce-once {0%, 100% { transform: scale(1); }25% { transform: scale(1.1); }50% { transform: scale(0.95); }75% { transform: scale(1.05); } }.animate-bounce-once { animation: bounce-once 0.6s ease-out 1;} 
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            `}</style>
            
            {/* Mengubah max-w-screen-xl menjadi max-w-4xl untuk tampilan yang lebih lebar dan terpusat */}
            <div className="w-full mx-auto max-w-10xl"> 
                
                {/* 1. Header dan Ringkasan Tanggal */}
                {/* Melewati Card dari sini ke TimelineHeader untuk tampilan yang lebih rapi */}
                <TimelineHeader 
                    startDate={startDate} 
                    harvestDate={harvestDate} 
                />
                
                {/* 2. Progress Bar Keseluruhan */}
              <TimelineProgressCard
  totalDaysDone={totalDaysDone}
  progressPct={overallPct}
  isFermentationActive={!!harvestIso}
/>


                {/* 3. Section Bulanan */}
                <div className="space-y-6 mt-6"> 
                    {[1, 2, 3].map((month) => {
                        const monthWeeks = weeks.filter((w) => getDominantMonth(w.startDay, w.endDay) === month);
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

                {/* 4. Final Claim Card */}
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