"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const TOTAL_DAYS = 90;

export default function TimelineProgressCard({ totalDaysDone = 0, progressPct = 0, isFermentationActive = false }) {
  const safePct = Math.min(100, Math.max(0, progressPct));

  return (
    <Card className="rounded-2xl shadow-xl border border-gray-200 bg-white mt-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-extrabold text-gray-900">
            Progres Keseluruhan
          </span>
          <span className="text-lg font-extrabold text-amber-500 transition-colors duration-500">
            {safePct}%
          </span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-gray-700">
            {totalDaysDone}/{TOTAL_DAYS} Hari Selesai
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mt-2">
          <div
            className={`h-3 transition-all duration-1000 ease-out ${
              safePct > 0 ? "bg-purple-600" : "bg-gray-400"
            }`}
            style={{ width: `${safePct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
