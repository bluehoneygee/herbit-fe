// src/hooks/useEcoEnzymeAPI.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchProjects,
  fetchUploadsByProject,
  createProject,
  createUpload,
  claimPoints
} from "@/lib/ecoEnzyme";

const TOTAL_FERMENTATION_DAYS = 90;

/**
 * userId: string (required)
 */
export default function useEcoEnzymeAPI(userId) {
  const [project, setProject] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setProject(null);
      setUploads([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await fetchProjects(
        `?userId=${encodeURIComponent(userId)}`
      );
      const arr = Array.isArray(payload?.projects)
        ? payload.projects
        : Array.isArray(payload)
        ? payload
        : [];

      // Choose latest project (newest createdAt)
      const latest = arr
        .slice()
        .sort((a, b) => new Date(b.createdAt || b.startDate || 0) - new Date(a.createdAt || a.startDate || 0))[0];

      // If latest exists and status ongoing (or started flag), use it.
      const active = latest && (latest.status === "ongoing" || latest.started || latest.status === "not_started") ? latest : null;

      if (active) {
        setProject(active);
        const ups = await fetchUploadsByProject(active._id);
        setUploads(Array.isArray(ups) ? ups : []);
      } else {
        setProject(null);
        setUploads([]);
      }
    } catch (err) {
      console.error("useEcoEnzymeAPI.loadData error:", err);
      setError(err);
      setProject(null);
      setUploads([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {

    loadData();
  }, [loadData]);

  const startFermentation = async (totalWeightKg) => {
    if (!userId) throw new Error("userId required");

    const now = new Date();
    const endDate = new Date(now.getTime() + TOTAL_FERMENTATION_DAYS * 24 * 60 * 60 * 1000);

    try {
      const res = await createProject({
        userId,
        organicWasteWeight: totalWeightKg,
        started: true,
        startedAt: now.toISOString(),
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        status: "ongoing",
        canClaim: false,
        prePointsEarned: 0,
        points: 0,
        isClaimed: false
      });

      // backend responds { project: { ... } } in createProject above
      const proj = res?.project || res;
      setProject(proj);
      setUploads([]);
      return proj._id;
    } catch (err) {
      console.error("startFermentation error:", err);
      throw err;
    }
  };

  const addUpload = async (weightKg) => {
    try {
      let projId = project?._id;
      if (!projId) {
        projId = await startFermentation(weightKg);
      }

      const res = await createUpload({
        ecoenzimProjectId: projId,
        userId,
        uploadedDate: new Date().toISOString(),
        prePointsEarned: Math.max(1, Math.round(weightKg * 10))
      });

      const upload = res?.upload || res;
      setUploads(prev => [upload, ...prev]);
      return upload;
    } catch (err) {
      console.error("addUpload error:", err);
      throw err;
    }
  };

  const addUploadWithPhoto = async (weightKg, photoUrl, monthNumber) => {
    try {
      let projId = project?._id;
      if (!projId) {
        projId = await startFermentation(weightKg);
      }

      const res = await createUpload({
        ecoenzimProjectId: projId,
        userId,
        monthNumber,
        photoUrl,
        uploadedDate: new Date().toISOString(),
        prePointsEarned: 50
      });

      const upload = res?.upload || res;
      setUploads(prev => [upload, ...prev]);
      return upload;
    } catch (err) {
      console.error("addUploadWithPhoto error:", err);
      throw err;
    }
  };

const handleCheckin = async () => {
  try {
    let projId = project?._id;
    if (!projId) {
      // kalau belum ada project → create baru dari check-in pertama
      projId = await startFermentation(0);
    }

    // ✅ Cek apakah hari ini sudah pernah check-in
    const today = new Date().toDateString();
    const already = uploads.some(u => new Date(u.uploadedDate).toDateString() === today && !u.monthNumber);
    if (already) {
      console.log("Hari ini sudah check-in ✅");
      return { success: false, message: "Sudah check-in hari ini" };
    }

    const res = await createUpload({
      ecoenzimProjectId: projId,
      userId,
      uploadedDate: new Date().toISOString(),
      prePointsEarned: 1 // default harian
    });

    const upload = res?.upload || res;

    // ✅ Direct update to UI
    setUploads(prev => [upload, ...prev]);

    console.log("Check-in berhasil! ✅");
    return { success: true };
  } catch (err) {
    console.error("Checkin error:", err);
    throw err;
  }
};

// ✅ State untuk final claim UI behavior
const [canClaimFinal, setCanClaimFinal] = useState(false);
const [isFinalClaimedState, setIsFinalClaimedState] = useState(false);

useEffect(() => {
  if (!project) {
    setCanClaimFinal(false);
    setIsFinalClaimedState(false);
    return;
  }

  const start = new Date(project.startDate);
  const now = new Date();
  const currentDay = Math.floor((now - start) / 86400000) + 1;

  // Hitung hari yang sudah check-in
  const checkedDays = uploads
    .filter(u => !u.monthNumber)
    .length;

  // Cek upload foto bulanan (hari 30, 60, 90)
  const uploaded30 = uploads.some(u => u.monthNumber === 1);
  const uploaded60 = uploads.some(u => u.monthNumber === 2);
  const uploaded90 = uploads.some(u => u.monthNumber === 3);

  const eligible =
    checkedDays >= TOTAL_FERMENTATION_DAYS &&
    uploaded30 && uploaded60 && uploaded90;

  setCanClaimFinal(eligible);
  setIsFinalClaimedState(project.status === "completed" || Boolean(project.isClaimed));
}, [project, uploads]);


  const handleClaimPoints = async () => {
    if (!project?._id) throw new Error("Project not found");
    try {
      const res = await claimPoints(project._id);
      // optimistic update
      setProject(prev => prev ? ({ ...prev, status: "completed", isClaimed: true, points: res.points || prev.points }) : prev);
      return res;
    } catch (err) {
      console.error("handleClaimPoints error:", err);
      throw err;
    }
  };

  const refetch = loadData;

  const status = project?.status || (project?.started ? "ongoing" : "not_started");
  const isFermentationActive = status === "ongoing";
  const isFinalClaimed = status === "completed" || Boolean(project?.isClaimed);
  const canClaim = Boolean(project?.canClaim);

  // progress calculation safe-guarded
  const harvestDate = project?.endDate ? new Date(project.endDate) : null;
  const safeHarvestDate = harvestDate && !Number.isNaN(harvestDate.getTime()) ? harvestDate : null;
  const daysRemaining = safeHarvestDate ? Math.max(0, Math.floor((safeHarvestDate - new Date()) / (1000 * 60 * 60 * 24))) : TOTAL_FERMENTATION_DAYS;
  const daysCompleted = TOTAL_FERMENTATION_DAYS - daysRemaining;
  const progressPct = Math.min(100, Math.round((daysCompleted / TOTAL_FERMENTATION_DAYS) * 100));

  const totalPrePoints = (uploads || []).reduce((s, u) => s + (Number(u.prePointsEarned) || 0), 0);
  const totalWeightKg = (uploads || []).reduce((s, u) => s + ((Number(u.prePointsEarned) || 0) / 10), 0);

  const gula = Number(totalWeightKg > 0 ? (totalWeightKg / 3).toFixed(2) : "0.00");
  const air = Number(totalWeightKg > 0 ? (((totalWeightKg / 3) * 10).toFixed(2)) : "0.00");

  return {
  project,
  uploads,
  loading,
  error,
  status,
  isFermentationActive: status === "ongoing",
  isFinalClaimed: isFinalClaimedState,
  canClaim: canClaimFinal,
  totalWeightKg,
  gula,
  air,
  daysRemaining,
  daysCompleted,
  progressPct,
  harvestDate,
  totalPrePoints,
  startFermentation,
  addUpload,
  addUploadWithPhoto,
  handleClaimPoints,
  handleCheckin,
  resetAll: async () => {
    if (!project?._id) return;
    setProject(null);
    setUploads([]);
  },
    refetch
  };
}
