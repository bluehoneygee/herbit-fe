"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clampNumber } from "@/lib/utils";

function LeafIcon({ color = "#FEA800" }) {
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
      <g transform="rotate(-145 12 12)">
        <path d="M12 2C7 4 4 8 4 13s3 9 8 9 8-4 8-9S17 4 12 2z" />
        <path d="M12 2v20" />
        <path d="M12 8c2 1 3 2 4 4M12 8c-2 1-3 2-4 4" />
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
          <LeafIcon />
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
                  ? "Semua daun sehat!"
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
