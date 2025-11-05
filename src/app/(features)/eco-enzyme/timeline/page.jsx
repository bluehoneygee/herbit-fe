// src/app/eco-enzyme/timeline/page.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChatButton from "@/components/floating-chat/ChatButton";
import {
  useToast,
  ToastContainer,
} from "@/components/ecoenzyme/timeline/TimelineToast";
import DayItem from "@/components/ecoenzyme/timeline/DayItem";
import MonthSection from "@/components/ecoenzyme/timeline/MonthSection";
import FinalClaimCard from "@/components/ecoenzyme/timeline/FinalClaimCard";
import TimelineProgressCard from "@/components/ecoenzyme/timeline/TimelineProgressCard";
import apiClient from "@/lib/apiClient";
import {
  fetchProjects,
  fetchUploadsByProject,
  createUpload,
  claimPoints as claimPointsApi,
} from "@/lib/ecoEnzyme";

const TOTAL_DAYS = 90;
const DAYS_PER_MONTH = 30;
const DAYS_PER_WEEK = 7;
const TOTAL_POINTS = 150;

const formatFullDate = (input) => {
  if (!input) return "-";
  const value = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(value.getTime())) return "-";
  return value.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

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

export default function TimelinePage() {
  const [userId, setUserId] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  const [project, setProject] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [now, setNow] = useState(new Date());
  const [openWeeks, setOpenWeeks] = useState(() => new Set([0]));
  const { toasts, push: pushToast, remove: removeToast } = useToast();

  useEffect(() => {
    let active = true;
    async function loadUser() {
      try {
        setUserLoading(true);
        const response = await apiClient.get("/auth/me", {
          headers: { "Cache-Control": "no-cache" },
        });
        const data = response.data ?? {};
        const payload = data.data ?? data;
        const resolvedId =
          payload?._id || payload?.id || payload?.user?._id || null;
        if (!active) return;
        setUserId(resolvedId);
        setUserError(null);
        console.log("[Timeline] loadUser", { resolvedId, payload });
      } catch (err) {
        if (!active) return;
        console.error("[TimelinePage] loadUser error:", err);
        setUserError(
          err instanceof Error ? err.message : "Gagal memuat pengguna"
        );
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

  const fetchActiveProject = useCallback(async () => {
    if (!userId) return null;
    const payload = await fetchProjects(`?userId=${encodeURIComponent(userId)}`);
    const arr = Array.isArray(payload?.projects)
      ? payload.projects
      : Array.isArray(payload)
      ? payload
      : [];
    return (
      arr.find(
        (p) =>
          p.status === "ongoing" ||
          p.status === "not_started" ||
          p.started === true
      ) || null
    );
  }, [userId]);

  const loadData = useCallback(async () => {
    if (!userId) {
      setProject(null);
      setUploads([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const active = await fetchActiveProject();
      console.log("[Timeline] fetchActiveProject", active);
      if (active) {
        setProject(active);
        const ups = await fetchUploadsByProject(active._id);
        const normalized = Array.isArray(ups)
          ? ups
          : Array.isArray(ups?.uploads)
          ? ups.uploads
          : [];
        console.log("[Timeline] uploads", normalized);
        setUploads(normalized);
      } else {
        console.log("[Timeline] no active project");
        setProject(null);
        setUploads([]);
      }
    } catch (err) {
      console.error("Timeline loadData error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setProject(null);
      setUploads([]);
      pushToast(
        "Gagal memuat data: " +
          (err instanceof Error ? err.message : String(err)),
        { duration: 3000 }
      );
    } finally {
      setLoading(false);
    }
  }, [fetchActiveProject, pushToast, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const startDate = useMemo(
    () => startFromHarvestIso(project?.endDate),
    [project?.endDate]
  );

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

  const checkins = useMemo(() => {
    const map = {};
    if (!startDate || !uploads.length) return map;

    uploads.forEach((upload) => {
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

  const photos = useMemo(() => {
    const map = {};
    uploads.forEach((upload) => {
      if (upload.monthNumber && upload.photoUrl) {
        map[`month${upload.monthNumber}`] = upload.photoUrl;
      }
    });
    return map;
  }, [uploads]);

  const handleCreateUpload = useCallback(async (payload) => {
    const res = await createUpload(payload);
    return res?.upload || res;
  }, []);

  const handleCheckin = async (/* dayIndex */) => {
    if (!userId) throw new Error("User belum diketahui.");
    if (!project?._id) throw new Error("Project belum tersedia.");

    const today = new Date().toDateString();
    const already = uploads.some(
      (u) =>
        new Date(u.uploadedDate).toDateString() === today && !u.monthNumber
    );
    if (already) {
      return { success: false, message: "Sudah check-in hari ini" };
    }

    const upload = await handleCreateUpload({
      ecoenzimProjectId: project._id,
      userId,
      uploadedDate: new Date().toISOString(),
      prePointsEarned: 1,
    });

    setUploads((prev) => [upload, ...prev]);
    return { success: true };
  };

  const handleUploadPhoto = async (monthNumber, file) => {
    if (!userId) throw new Error("User belum diketahui.");
    if (!project?._id) throw new Error("Project belum tersedia.");
    if (!file) throw new Error("File foto tidak valid.");

    const photoUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("Gagal membaca file"));
      reader.readAsDataURL(file);
    });

    const upload = await handleCreateUpload({
      ecoenzimProjectId: project._id,
      userId,
      monthNumber,
      photoUrl,
      uploadedDate: new Date().toISOString(),
      prePointsEarned: 50,
    });

    setUploads((prev) => [upload, ...prev]);
    return upload;
  };

  const [canClaimFinal, setCanClaimFinal] = useState(false);
  const [isFinalClaimedState, setIsFinalClaimedState] = useState(false);

  useEffect(() => {
    if (!project) {
      setCanClaimFinal(false);
      setIsFinalClaimedState(false);
      return;
    }

    const start = new Date(project.startDate);
    const nowDate = new Date();
    const currentDay = Math.floor((nowDate - start) / 86400000) + 1;

    const checkedDays = uploads.filter((u) => !u.monthNumber).length;

    const uploaded30 = uploads.some((u) => u.monthNumber === 1);
    const uploaded60 = uploads.some((u) => u.monthNumber === 2);
    const uploaded90 = uploads.some((u) => u.monthNumber === 3);

    const eligible =
      currentDay >= TOTAL_DAYS &&
      checkedDays >= TOTAL_DAYS &&
      uploaded30 &&
      uploaded60 &&
      uploaded90;

    setCanClaimFinal(eligible);
    setIsFinalClaimedState(
      project.status === "completed" || Boolean(project.isClaimed)
    );
  }, [project, uploads]);

  const handleClaimPoints = async () => {
    if (!project?._id) throw new Error("Project tidak ditemukan");
    const res = await claimPointsApi(project._id);
    setProject((prev) =>
      prev
        ? {
            ...prev,
            status: "completed",
            isClaimed: true,
            points: res?.points ?? prev.points,
          }
        : prev
    );
    return res;
  };

  const harvestDate = project?.endDate ? new Date(project.endDate) : null;
  const safeHarvestDate =
    harvestDate && !Number.isNaN(harvestDate.getTime()) ? harvestDate : null;
  const daysRemaining = safeHarvestDate
    ? Math.max(
        0,
        Math.floor((safeHarvestDate - new Date()) / (1000 * 60 * 60 * 24))
      )
    : TOTAL_DAYS;
  const daysCompleted = Math.max(0, TOTAL_DAYS - daysRemaining);

  const totalCheckins = Object.keys(checkins).length;
  const progressPct = Math.min(
    100,
    Math.round((totalCheckins / TOTAL_DAYS) * 100)
  );

  const totalPrePoints = (uploads || []).reduce(
    (sum, upload) => sum + (Number(upload.prePointsEarned) || 0),
    0
  );

  const toggleWeek = (index) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const buildMonthData = useCallback(
    (monthNumber) => {
      const startDay = (monthNumber - 1) * DAYS_PER_MONTH + 1;
      const endDay = Math.min(monthNumber * DAYS_PER_MONTH, TOTAL_DAYS);
      const totalDays = endDay - startDay + 1;
      let doneDays = 0;
      const weeksMap = new Map();

      for (let dayIndex = startDay; dayIndex <= endDay; dayIndex += 1) {
        const checked = Boolean(checkins[dayIndex]?.checked);
        if (checked) doneDays += 1;

        const globalWeekIndex = Math.floor((dayIndex - 1) / DAYS_PER_WEEK);
        if (!weeksMap.has(globalWeekIndex)) {
          weeksMap.set(globalWeekIndex, {
            weekIndex: globalWeekIndex,
            days: [],
          });
        }

        weeksMap.get(globalWeekIndex).days.push({
          dayIndex,
          label: `Hari ${dayIndex}`,
          date: startDate ? dayDateFromStart(startDate, dayIndex) : null,
          unlocked: dayIndex <= currentDayIndex,
          checked,
        });
      }

      return {
        summary: {
          start: startDay,
          end: endDay,
          total: totalDays,
          done: doneDays,
          pct: totalDays > 0 ? Math.round((doneDays / totalDays) * 100) : 0,
        },
        weeks: Array.from(weeksMap.values()),
      };
    },
    [checkins, currentDayIndex, startDate]
  );

  const month1Data = useMemo(() => buildMonthData(1), [buildMonthData]);
  const month2Data = useMemo(() => buildMonthData(2), [buildMonthData]);
  const month3Data = useMemo(() => buildMonthData(3), [buildMonthData]);

  console.log("[Timeline] month data", {
    userId,
    loading,
    error,
    project,
    month1Data,
    month2Data,
    month3Data,
  });

  if (userLoading || loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (userError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {userError}. Silakan login ulang.
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: {error.message || String(error)}.
      </div>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <ToastContainer />
        <h1 className="text-2xl font-semibold text-gray-900">
          Belum ada proyek Eco Enzyme aktif
        </h1>
        <p className="text-sm text-gray-500">
          Mulai fermentasi dari halaman Eco Enzyme terlebih dahulu untuk melihat timeline.
        </p>
        <Link href="/eco-enzyme">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Kembali ke Eco Enzyme
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      <ToastContainer toasts={toasts} remove={removeToast} />
      <header
        className="sticky top-0 z-20 bg-white px-4 pb-4 backdrop-blur"
        style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg bg-white shadow-md hover:bg-gray-200 transition-transform hover:scale-[1.05]"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Button>
          <span className="text-xl font-bold text-gray-900">
            Timeline Eco Enzyme
          </span>
        </div>

        <div className="mt-6 space-y-1 text-sm text-gray-600">
          <p>
            Mulai:{" "}
            <span className="font-semibold text-amber-500">
              {formatFullDate(project?.startDate)}
            </span>
          </p>
          <p>
            Panen:{" "}
            <span className="font-semibold text-amber-500">
              {formatFullDate(project?.endDate)}
            </span>
          </p>
        </div>

        <p className="text-base text-amber-700 text-center font-medium mt-4">
          Pantau progres fermentasi mu setiap hari selama 90 hari penuh!
        </p>
      </header>

      <section className="px-4 py-6 space-y-4">
        <TimelineProgressCard
          currentDayIndex={currentDayIndex}
          totalDays={TOTAL_DAYS}
          progressPct={progressPct}
          totalPrePoints={totalPrePoints}
          uploads={uploads}
          onCheckin={handleCheckin}
          checkins={checkins}
        />

        {!uploads.length && (
          <Card className="border border-dashed border-purple-300 bg-purple-50/40">
            <CardContent className="px-4 py-6 text-center space-y-2">
              <h2 className="text-base font-semibold text-purple-700">
                Belum ada catatan harian
              </h2>
              <p className="text-sm text-purple-600">
                Mulai check-in harian atau unggah aktivitas bulanan di bawah. Timeline akan terisi otomatis begitu kamu menambahkan data.
              </p>
            </CardContent>
          </Card>
        )}

        <MonthSection
          month={1}
          summary={month1Data.summary}
          monthWeeks={month1Data.weeks}
          startDate={startDate}
          currentDayIndex={currentDayIndex}
          photos={photos}
          handleCheckin={handleCheckin}
          handlePhotoUpload={handleUploadPhoto}
          openWeeks={openWeeks}
          setOpenWeeks={setOpenWeeks}
          activeWeekIndex={activeWeekIndex}
        />

        <MonthSection
          month={2}
          summary={month2Data.summary}
          monthWeeks={month2Data.weeks}
          startDate={startDate}
          currentDayIndex={currentDayIndex}
          photos={photos}
          handleCheckin={handleCheckin}
          handlePhotoUpload={handleUploadPhoto}
          openWeeks={openWeeks}
          setOpenWeeks={setOpenWeeks}
          activeWeekIndex={activeWeekIndex}
        />

        <MonthSection
          month={3}
          summary={month3Data.summary}
          monthWeeks={month3Data.weeks}
          startDate={startDate}
          currentDayIndex={currentDayIndex}
          photos={photos}
          handleCheckin={handleCheckin}
          handlePhotoUpload={handleUploadPhoto}
          openWeeks={openWeeks}
          setOpenWeeks={setOpenWeeks}
          activeWeekIndex={activeWeekIndex}
        />

        <FinalClaimCard
          canClaim={canClaimFinal}
          isClaimed={isFinalClaimedState}
          onClaim={handleClaimPoints}
          totalPoints={TOTAL_POINTS}
        />
      </section>

      <ChatButton />
    </main>
  );
}
