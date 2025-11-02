// src/hooks/useEcoEnzymeAPI.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchProjects,
  createProject,
  fetchUploadsByProject,
  createUpload,
  deleteProject,
  claimPoints // Pastikan ini ada di ecoEnzyme.js
} from "@/lib/ecoEnzyme";

const TOTAL_FERMENTATION_DAYS = 90;

export default function useEcoEnzymeAPI(userId) {
  const [project, setProject] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === Load data dari backend ===
  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Ambil project user
      const projects = await fetchProjects();
      const userProject = projects.find(p => p.userId === userId);

      if (userProject) {
        setProject(userProject);
        const projectUploads = await fetchUploadsByProject(userProject._id);
        setUploads(projectUploads);
      } else {
        setProject(null);
        setUploads([]);
      }
    } catch (err) {
      console.error("Gagal load data:", err);
      setError(err.message || "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // === Buat project baru ===
  const startFermentation = async (totalWeightKg) => {
    if (!userId) throw new Error("User tidak ditemukan");
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + TOTAL_FERMENTATION_DAYS);

    try {
      const newProject = await createProject({
        userId,
        organicWasteWeight: totalWeightKg,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      setProject(newProject.project);
      return newProject.project._id;
    } catch (err) {
      throw new Error(
        err.message.includes("fetch")
          ? "Tidak dapat terhubung ke server. Pastikan backend berjalan dan CORS diizinkan."
          : err.message || "Gagal membuat project"
      );
    }
  };

  // === Upload dengan foto ===
  const addUploadWithPhoto = async (weightKg, photoUrl, monthNumber) => {
    let projectId = project?._id;
    if (!projectId) {
      projectId = await startFermentation(weightKg);
    }

    try {
      const newUpload = await createUpload({
        ecoenzimProjectId: projectId,
        userId,
        monthNumber,
        photoUrl,
        uploadedDate: new Date().toISOString(),
        prePointsEarned: 50 // Sesuai aturan bisnis
      });
      setUploads(prev => [newUpload.upload, ...prev]);
      return newUpload;
    } catch (err) {
      throw new Error(err.message || "Gagal menyimpan upload");
    }
  };

// src/hooks/useEcoEnzymeAPI.js

const addUpload = async (weightKg) => {
  let projectId = project?._id;
  if (!projectId) {
    projectId = await startFermentation(weightKg);
  }

  try {
    // ✅ HAPUS monthNumber untuk upload harian
    const newUpload = await createUpload({
      ecoenzimProjectId: projectId,
      userId,
      // monthNumber: 1, // ❌ HAPUS BARIS INI
      photoUrl: "https://picsum.photos/400/300?random=" + Date.now(),
      uploadedDate: new Date().toISOString(),
      prePointsEarned: Math.round(weightKg * 10)
    });
    setUploads(prev => [newUpload.upload, ...prev]);
    return newUpload;
  } catch (err) {
    throw new Error(err.message || "Gagal menyimpan upload");
  }
};

  // === Klaim poin ===
  const handleClaimPoints = async () => {
    if (!project?._id) throw new Error("Project tidak ditemukan");
    
    try {
      const result = await claimPoints(project._id);
      
      // Update state setelah klaim
      setProject(prev => ({
        ...prev,
        status: "completed",
        points: result.points,
        prePointsEarned: null,
        isClaimed: true,
        claimedAt: new Date().toISOString(),
        canClaim: false
      }));
      
      return result;
    } catch (err) {
      throw new Error("Gagal klaim poin: " + err.message);
    }
  };

  // === Reset ===
  const resetAll = async () => {
    if (!project) return;
    if (!confirm("Reset semua data?")) return;

    try {
      if (!project._id) throw new Error("Project ID tidak valid");
      await deleteProject(project._id);
      setProject(null);
      setUploads([]);
      setError(null);
    } catch (err) {
      console.error("Reset failed:", err);
      throw new Error("Gagal reset: " + err.message);
    }
  };

  // === AMBIL STATUS LANGSUNG DARI BACKEND ===
  const status = project?.status || "not_started";
  const isFermentationActive = status === "ongoing";
  const isFinalClaimed = status === "completed";
  const canClaim = project?.canClaim || false;

  // Hitung progress berdasarkan tanggal
  const harvestDate = project?.endDate ? new Date(project.endDate) : null;
  const safeHarvestDate = harvestDate && !isNaN(harvestDate.getTime()) 
    ? harvestDate 
    : null;

  const daysRemaining = safeHarvestDate 
    ? Math.max(0, Math.floor((safeHarvestDate - new Date()) / (1000 * 60 * 60 * 24)))
    : TOTAL_FERMENTATION_DAYS;

  const daysCompleted = TOTAL_FERMENTATION_DAYS - daysRemaining;
  const progressPct = Math.min(100, Math.round((daysCompleted / TOTAL_FERMENTATION_DAYS) * 100));

  // Hitung total pre-point dari uploads
  const totalPrePoints = uploads.reduce(
    (sum, upload) => sum + (upload.prePointsEarned || 0),
    0
  );

  // Hitung berat total dari prePoints (10 pre-point = 1 kg)
  const totalWeightKg = uploads.reduce(
    (sum, u) => sum + (u.prePointsEarned / 10 || 0),
    0
  );
  const gula = totalWeightKg > 0 ? (totalWeightKg / 3).toFixed(2) : "0.00";
  const air = totalWeightKg > 0 ? ((totalWeightKg / 3) * 10).toFixed(2) : "0.00";

  return {
    // Data dari backend
    project,
    uploads,
    status, 
    isFermentationActive,
    isFinalClaimed,
    canClaim,
    totalWeightKg,
    gula,
    air,
    daysRemaining,
    daysCompleted,
    progressPct,
    harvestDate,
    totalPrePoints,
    loading,
    error,
    startFermentation,
    addUploadWithPhoto,
    handleClaimPoints,
    resetAll,
    addUpload, 
    refetch: loadData
  };
}