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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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

export default function FruitProgress({ leaves = [] }) {
  const leavesPerFruit = 5;
  const greenLeaves = leaves.filter((l) => l.status === "green").length;

  const remainder = greenLeaves % leavesPerFruit;
  const nextFruitIn = remainder === 0 ? 0 : leavesPerFruit - remainder;
  const progressPercent = (remainder / leavesPerFruit) * 100;

  // ✨ Animasi reset (buah tumbuh → bar kosong lagi)
  const [showFruitReady, setShowFruitReady] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(progressPercent);

  useEffect(() => {
    if (nextFruitIn === 0 && progressPercent === 100) {
      setShowFruitReady(true);

      // setelah 2.5 detik, reset progress (simulasi buah dipetik)
      const timer = setTimeout(() => {
        setShowFruitReady(false);
        setAnimatedProgress(0);
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      setAnimatedProgress(progressPercent);
    }
  }, [progressPercent, nextFruitIn]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-[#FEA800]/15">
          <TimerIcon />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            Tumbuhkan Buah Selanjutnya
          </p>

          <AnimatePresence mode="wait">
            {showFruitReady ? (
              <motion.p
                key="ready"
                className="text-xs text-green-600 font-medium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                Buah siap tumbuh 🍏
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
                {nextFruitIn === 0
                  ? "Buah siap tumbuh 🍏"
                  : `${nextFruitIn} daun lagi untuk 1 buah`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ProgressBar value={animatedProgress} />
    </div>
  );
}
