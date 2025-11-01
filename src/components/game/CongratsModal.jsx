"use client";

import { BeatLoader } from "react-spinners";
import { useState, useEffect } from "react";

export default function CongratsModal({
  onClaim,
  onClose,
  factData,
  onShare,
  loading,
  alreadyClaimed = false,
  claimPoints = 10,
  currentPoints = 0,
}) {
  const [userPoints, setUserPoints] = useState(currentPoints);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(alreadyClaimed);

  const API =
    (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "") ||
    "http://localhost:5000/api";
  useEffect(() => {
    setIsClaimed(alreadyClaimed);
    if (alreadyClaimed) {
      fetchUserPoints();
    }
  }, [alreadyClaimed]);

  useEffect(() => {
    if (currentPoints === 0) {
      console.log("⚠️ currentPoints is 0, fetching fresh user data...");
      fetchUserPoints();
    } else {
      setUserPoints(currentPoints);
      console.log("Set userPoints from prop:", currentPoints);
    }
  }, [currentPoints]);

  // Debug log
  useEffect(() => {
    console.log("🎨 CongratsModal State:", {
      alreadyClaimed,
      claimPoints,
      currentPoints,
      userPoints,
      isClaimed,
    });
  }, [alreadyClaimed, claimPoints, currentPoints, userPoints, isClaimed]);

  const fetchUserPoints = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const payload = await res.json();
        const data = payload?.data ?? payload;
        const user = data?.user ?? data;
        setUserPoints(user?.totalPoints ?? 0);
      }
    } catch (error) {
      console.error("Error fetching user points:", error);
    }
  };
  function animateNumber(from, to, ms, cb) {
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      const val = Math.round(from + (to - from) * p);
      cb(val);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const handleClaim = async () => {
    if (isClaimed || isClaiming) return;

    setIsClaiming(true);
    try {
      if (onClaim) {
        console.log("Calling onClaim...");
        const result = await onClaim();

        console.log("Claim result:", result);

        if (result?.ok && result?.user) {
          const newPoints = result.user.totalPoints || 0;
          setUserPoints(newPoints);
          animateNumber(userPoints, newPoints, 600, setUserPoints);
          console.log(`Points updated: ${userPoints} → ${newPoints}`);
        } else {
          console.warn("⚠️ No user data in response, fetching fresh...");
          await fetchUserPoints();
        }

        setIsClaimed(true);
      }
    } catch (error) {
      console.error("Error claiming points:", error);
      alert("Gagal claim poin. Silakan coba lagi.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pixel pixel-background sky
                   w-[92vw] max-w-md rounded-2xl bg-white shadow-2xl border p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-black">Good job!</h3>
          <div className="flex items-center gap-2 bg-yellow-400 px-3 py-1.5 rounded-lg border-2 border-yellow-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="#F59E0B"
                stroke="#92400E"
                strokeWidth="1.5"
              />
            </svg>
            <span className="text-sm font-bold text-yellow-900">
              {userPoints.toLocaleString()}
            </span>
          </div>
        </div>

        <p className="mt-1 text-sm text-black">
          Kamu berhasil memilah sampah hari ini.
        </p>

        <button
          onClick={handleClaim}
          disabled={isClaimed || isClaiming}
          className={`pixel-btn ${isClaimed ? "black" : "yellow"} ${
            isClaimed || isClaiming ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isClaiming ? (
            <span className="flex items-center justify-center gap-2">
              <BeatLoader size={6} color="#000" />
              Claiming...
            </span>
          ) : isClaimed ? (
            `✓ Claimed +${claimPoints}`
          ) : (
            `Claim Point +${claimPoints}`
          )}
        </button>

        <div className="mt-3 min-h-[84px]">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <BeatLoader size={10} className="text-white" />
            </div>
          ) : (
            <blockquote className="text-sm italic text-black border-l-4 border-green-900 pl-3">
              "{factData.fact}"
              <div className="mt-1 not-italic text-xs text-black">
                — {factData.source}
              </div>
            </blockquote>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1">
          <button
            onClick={onShare}
            disabled={loading}
            className="rounded-lg border px-3 py-2 pixel-btn blue cursor-pointer text-white disabled:opacity-60"
          >
            {loading ? "Menyiapkan..." : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
