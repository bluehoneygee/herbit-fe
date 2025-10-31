"use client";
import { Card, CardContent } from "@/components/ui/card";

const TOTAL_DAYS = 90;

export default function EcoEnzymeProgress({ 
  isFermentationActive = false, 
  totalWeightKg = 0, 
  daysCompleted = 0, 
  progressPct = 0 
}) {
  const safePct = Math.min(100, Math.max(0, progressPct));

  return (
    <Card className="bg-amber-100 shadow-lg border border-amber-200 mt-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
      <CardContent className="pt-5 pb-6 px-4">
        <div className="flex items-center gap-5">
          {/* Progress Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {/* Background Circle */}
              <path
                className="text-amber-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.8"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Progress Circle */}
              <path
                className={`${safePct > 0 ? "text-gray-800" : "text-gray-400"} transition-all duration-1000 ease-out`}
                fill="none"
                stroke="currentColor"
                strokeWidth="3.8"
                strokeDasharray={`${safePct}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xl font-bold text-gray-800">
              {safePct}%
            </span>
          </div>

          {/* Status */}
          <div>
            <h2 className="font-bold text-gray-900 text-2xl flex items-center gap-1">
              {isFermentationActive ? "Fermentasi Berjalan" : "Siap Fermentasi"} 
              {isFermentationActive && <span className="animate-bounce inline-block" role="img" aria-label="fire">🔥</span>}
            </h2>
            <p className="text-base text-gray-700 mt-1">
              {isFermentationActive
                ? `Telah berjalan ${daysCompleted} hari dari ${TOTAL_DAYS} hari`
                : `Terkumpul: ${totalWeightKg.toFixed(2)} Kg sampah organik`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
