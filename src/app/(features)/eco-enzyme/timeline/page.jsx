// src/app/eco-enzyme/timeline/page.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import ChatButton from "@/components/floating-chat/ChatButton";
import {
  useToast,
  ToastContainer,
} from "@/components/ecoenzyme/timeline/TimelineToast";
import DayItem from "@/components/ecoenzyme/timeline/DayItem";
import MonthSection from "@/components/ecoenzyme/timeline/MonthSection";
import FinalClaimCard from "@/components/ecoenzyme/timeline/FinalClaimCard";
import TimelineHeader from "@/components/ecoenzyme/timeline/TimelineHeader";
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
  const toast = useToast();

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
      if (active) {
        setProject(active);
        const ups = await fetchUploadsByProject(active._id);
        const normalized = Array.isArray(ups)
          ? ups
          : Array.isArray(ups?.uploads)
          ? ups.uploads
          : [];
        setUploads(normalized);
      } else {
        setProject(null);
        setUploads([]);
      }
    } catch (err) {
      console.error("Timeline loadData error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setProject(null);
      setUploads([]);
      toast.push(
        "Gagal memuat data: " +
          (err instanceof Error ? err.message : String(err)),
        { duration: 3000 }
      );
    } finally {
      setLoading(false);
    }
  }, [fetchActiveProject, toast, userId]);

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

  const handleCheckin = async () => {
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

  const handleUploadPhoto = async (monthNumber, photoUrl) => {
    if (!userId) throw new Error("User belum diketahui.");
    if (!project?._id) throw new Error("Project belum tersedia.");

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
  const daysCompleted = TOTAL_DAYS - daysRemaining;
  const progressPct = Math.min(
    100,
    Math.round((daysCompleted / TOTAL_DAYS) * 100)
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

  return (
    <main className="min-h-screen bg-white">
      <ToastContainer />
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg"
          onClick={() => window.history.back()}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          Timeline Eco Enzyme
        </h1>
      </div>

      <section className="px-4 py-6 space-y-4">
        <TimelineHeader project={project} totalPoints={TOTAL_POINTS} />

        <TimelineProgressCard
          currentDayIndex={currentDayIndex}
          totalDays={TOTAL_DAYS}
          progressPct={progressPct}
          totalPrePoints={totalPrePoints}
          uploads={uploads}
          onCheckin={handleCheckin}
          checkins={checkins}
        />

        <div className="grid gap-4">
          {Array.from({ length: WEEKS }).map((_, idx) => {
            const rangeStart = idx * DAYS_PER_WEEK + 1;
            const rangeEnd = Math.min(
              (idx + 1) * DAYS_PER_WEEK,
              TOTAL_DAYS
            );
            const isOpen = openWeeks.has(idx) || idx === activeWeekIndex;

            return (
              <Card key={`week-${idx}`} className="border border-gray-200">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  onClick={() => toggleWeek(idx)}
                >
                  <span className="text-sm font-semibold text-gray-900">
                    Minggu {idx + 1} ({rangeStart}-{rangeEnd})
                  </span>
                  <span className="text-xs text-gray-500">
                    {isOpen ? "Sembunyikan" : "Lihat"}
                  </span>
                </button>
                {isOpen && (
                  <CardContent className="px-4 pb-4">
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from(
                        { length: rangeEnd - rangeStart + 1 },
                        (_, offset) => {
                          const dayIndex = rangeStart + offset;
                          const checked = checkins[dayIndex]?.checked;
                          const date = startDate
                            ? dayDateFromStart(startDate, dayIndex)
                            : null;
                          return (
                            <DayItem
                              key={`day-${dayIndex}`}
                              dayIndex={dayIndex}
                              date={date}
                              checked={checked}
                            />
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <MonthSection
          monthTitle="Bulan Pertama"
          monthNumber={1}
          monthRange={monthRange(1)}
          photoUrl={photos.month1}
          uploads={uploads}
          onUpload={(photoUrl) => handleUploadPhoto(1, photoUrl)}
        />

        <MonthSection
          monthTitle="Bulan Kedua"
          monthNumber={2}
          monthRange={monthRange(2)}
          photoUrl={photos.month2}
          uploads={uploads}
          onUpload={(photoUrl) => handleUploadPhoto(2, photoUrl)}
        />

        <MonthSection
          monthTitle="Bulan Ketiga"
          monthNumber={3}
          monthRange={monthRange(3)}
          photoUrl={photos.month3}
          uploads={uploads}
          onUpload={(photoUrl) => handleUploadPhoto(3, photoUrl)}
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
