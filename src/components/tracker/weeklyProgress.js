"use client";
import { useEffect, useState } from "react";
import { getWeeklyProgress } from "@/lib/taskTracker";

export default function WeeklyProgress() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data awal dari backend
  const fetchProgress = async () => {
    try {
      const res = await getWeeklyProgress();
      const progressData = res.data.progress || [];

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const mapped = progressData.map((day) => {
        const isFuture = day.date > todayStr;
        const isToday = day.date === todayStr;

        let status = "missed";
        if (isFuture || isToday) status = "pending";
        if (day.completed > 0) status = "done";

        return {
          day: day.dayName,
          date: day.date,
          status,
          completed: day.completed,
        };
      });

      setWeeklyData(mapped);
    } catch (err) {
      console.error("Gagal ambil data progress mingguan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();

    // 🔁 Dengarkan event dari DailyTasks
    const handleTaskUpdate = (e) => {
      const { done } = e.detail;
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      setWeeklyData((prev) =>
        prev.map((day) => {
          if (day.date === todayStr) {
            // minimal 1 task selesai → done
            // semua uncheck → pending
            return { ...day, status: done > 0 ? "done" : "pending" };
          }
          return day;
        })
      );
    };

    window.addEventListener("taskUpdated", handleTaskUpdate);
    return () => window.removeEventListener("taskUpdated", handleTaskUpdate);
  }, []);

  // === UI ===
  if (loading) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-4 text-center text-sm text-gray-500 shadow-sm m-4">
        Loading progress minggu ini...
      </div>
    );
  }

  if (!weeklyData.length) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-4 text-center text-sm text-gray-500 shadow-sm m-4">
        Belum ada data minggu ini.
      </div>
    );
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "done":
        return "bg-[#FEA800] text-white border-[#FEA800]"; // kuning
      case "pending":
        return "bg-white text-[#FEA800] border-[#FEA800]/30"; // oranye muda
      case "missed":
        return "bg-gray-100 text-gray-400 border-gray-200"; // abu
      default:
        return "bg-white text-gray-400 border-gray-200";
    }
  };

  const getIcon = (status) => {
    switch (status) {
      case "done":
        return "✓";
      case "pending":
        return "•";
      case "missed":
        return "×";
      default:
        return "?";
    }
  };

  return (
    <main className="p-4 space-y-3">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Progress Minggu Ini
        </h2>

        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((day, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center text-center"
            >
              <p className="text-xs text-gray-500 mb-2">{day.day}</p>
              <div
                className={`h-9 w-9 rounded-2xl grid place-items-center border shadow-sm font-semibold ${getStatusStyle(
                  day.status
                )}`}
              >
                {getIcon(day.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
