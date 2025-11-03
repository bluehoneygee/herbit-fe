"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clampNumber } from "@/lib/utils";

function TimerIcon({ color = "#FEA800" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5"
      aria-hidden="true"
    >
      <g transform="rotate(15 12 12)">
        <path d="M12 2c-4 4-6 8-6 12s2 8 6 10 6-6 6-10-2-8-6-12z" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="12" y1="6" x2="16" y2="10" />
        <line x1="12" y1="6" x2="8" y2="10" />
      </g>
    </svg>
  );
}



function ProgressBar({ value = 0 }) {
  const width = `${clampNumber(value)}%`;
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
      <motion.div
        className="h-full bg-[#FEA800]"
        animate={{ width }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

/**
 * Komponen "Selamatkan Daun Kuning"
 * @param {Object[]} leaves - daftar daun dari API
 */
export default function SaveYellowLeaves({ leaves = [] }) {
  const totalLeaves = leaves.length || 1;
  const yellowLeaves = leaves.filter((l) => l.status === "yellow").length;
  const savedLeaves = totalLeaves - yellowLeaves;

  const progressPercent = (savedLeaves / totalLeaves) * 100;
  const leavesToSave = yellowLeaves;

  const [showAllHealthy, setShowAllHealthy] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(progressPercent);

  useEffect(() => {
    if (leavesToSave === 0 && progressPercent === 100) {
      setShowAllHealthy(true);

      const timer = setTimeout(() => {
        setShowAllHealthy(false);
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progressPercent);
    }
  }, [progressPercent, leavesToSave]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-[#FEA800]/15">
          <TimerIcon />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            Selamatkan Daun Kuning
          </p>

          <AnimatePresence mode="wait">
            {showAllHealthy ? (
              <motion.p
                key="healthy"
                className="text-xs text-[#FEA800] font-medium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                Semua daun sehat!
              </motion.p>
            ) : (
              <motion.p
                key="progress"
                className="text-xs text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {leavesToSave === 0
                  ? "Semua daun sehat! "
                  : `${leavesToSave} daun lagi perlu diselamatkan`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ProgressBar value={animatedProgress} />
    </div>
  );
}
