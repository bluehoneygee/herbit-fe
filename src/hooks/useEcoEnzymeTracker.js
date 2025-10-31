"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

const APP_ID = "ecoenzyme-shadcn";
const JOURNAL_KEY = `ecoEnzymeJournal_${APP_ID}`;
const HARVEST_KEY = `ecoEnzymeHarvestDate_${APP_ID}`;
const totalFermentationDays = 90;
const TIMELINE_KEY = "ecoEnzymeTimeline_ecoenzyme-tracker-default";

export default function useEcoEnzymeTracker() {
    const [journalEntries, setJournalEntries] = useState([]);
    const [newEntry, setNewEntry] = useState("");
    const [harvestDate, setHarvestDate] = useState(null);
    const [now, setNow] = useState(Date.now());

    // ✅ NEW STATES (biar bisa diupdate manual juga)
    const [daysCompleted, setDaysCompleted] = useState(0);
    const [daysRemaining, setDaysRemaining] = useState(totalFermentationDays);
    const [progressPct, setProgressPct] = useState(0);

    // === Load awal dari localStorage ===
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "[]");
        setJournalEntries(saved);
        const h = localStorage.getItem(HARVEST_KEY);
        if (h) setHarvestDate(new Date(h));
    }, []);

    // Simpan perubahan ke localStorage
    useEffect(() => {
        localStorage.setItem(JOURNAL_KEY, JSON.stringify(journalEntries));
    }, [journalEntries]);

    useEffect(() => {
        if (harvestDate) localStorage.setItem(HARVEST_KEY, harvestDate.toISOString());
        else localStorage.removeItem(HARVEST_KEY);
    }, [harvestDate]);

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(t);
    }, []);

    // === Kalkulasi berat ===
    const totalWeight = useMemo(() => {
        return journalEntries.reduce((s, e) => s + (e.weight || 0), 0);
    }, [journalEntries]);

    const totalWeightKg = totalWeight / 1000;
    const gula = totalWeight > 0 ? (totalWeightKg / 3).toFixed(2) : "0.00";
    const air = totalWeight > 0 ? ((totalWeightKg / 3) * 10).toFixed(2) : "0.00";
    const isFermentationActive = !!harvestDate;

    // === Hitung progress dari waktu fermentasi ===
    const timeBasedProgress = useMemo(() => {
        if (!harvestDate) return { daysCompleted: 0, daysRemaining: totalFermentationDays, pct: 0 };

        const diff = harvestDate.getTime() - now;
        const remaining = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
        const completed = Math.min(totalFermentationDays, totalFermentationDays - remaining);
        const pct = Math.min(100, Math.round((completed / totalFermentationDays) * 100));

        return { daysCompleted: completed, daysRemaining: remaining, pct };
    }, [harvestDate, now]);

    // === Hitung progress dari check-in timeline ===
    const timelineProgress = useMemo(() => {
        const timelineData = JSON.parse(localStorage.getItem(TIMELINE_KEY) || "{}");
        const checkedDays = Object.keys(timelineData).filter(
            k => /^\d+$/.test(k) && timelineData[k]?.checked
        ).length;
        const pct = Math.min(100, Math.round((checkedDays / totalFermentationDays) * 100));

        return { daysCompleted: checkedDays, daysRemaining: totalFermentationDays - checkedDays, pct };
    }, []);

    // === Gabungkan keduanya ===
    useEffect(() => {
        const combinedDays = Math.max(timeBasedProgress.daysCompleted, timelineProgress.daysCompleted);
        const combinedPct = Math.max(timeBasedProgress.pct, timelineProgress.pct);
        const combinedRemaining = totalFermentationDays - combinedDays;

        setDaysCompleted(combinedDays);
        setDaysRemaining(combinedRemaining);
        setProgressPct(combinedPct);
    }, [timeBasedProgress, timelineProgress]);

    // === Fungsi utama ===
    const addEntry = useCallback((e) => {
        e.preventDefault();
        const val_kg = parseFloat(newEntry);
        if (isNaN(val_kg) || val_kg <= 0) return alert("Masukkan angka > 0");

        const entry = {
            id: Date.now(),
            date: new Date().toLocaleDateString("id-ID", {
                day: "2-digit", month: "short", year: "numeric",
            }),
            weight: Number((val_kg * 1000).toFixed(0)),
        };

        setJournalEntries((s) => [entry, ...s]);
        setNewEntry("");
    }, [newEntry]);

    const removeEntry = useCallback((id) => {
        if (!confirm("Hapus entri ini?")) return;
        setJournalEntries((s) => s.filter((x) => x.id !== id));
    }, []);

    const startFermentation = useCallback(() => {
        if (totalWeight <= 0) return alert("Tambahkan sampah dulu sebelum memulai fermentasi.");
        const h = new Date();
        h.setDate(h.getDate() + totalFermentationDays);
        setHarvestDate(h);
    }, [totalWeight]);

    const resetAll = useCallback(() => {
        if (!confirm("Reset semua data?")) return;
        setHarvestDate(null);
        setJournalEntries([]);
        localStorage.removeItem(JOURNAL_KEY);
        localStorage.removeItem(HARVEST_KEY);
        localStorage.removeItem(TIMELINE_KEY);
        setDaysCompleted(0);
        setDaysRemaining(totalFermentationDays);
        setProgressPct(0);
    }, []);

    // === Return ke komponen ===
    return {
        journalEntries,
        newEntry,
        totalWeight,
        totalWeightKg,
        gula, air,
        harvestDate,
        isFermentationActive,
        daysRemaining,
        daysCompleted,
        progressPct,
        totalFermentationDays,
        setNewEntry,
        addEntry,
        removeEntry,
        startFermentation,
        resetAll,
    };
}
