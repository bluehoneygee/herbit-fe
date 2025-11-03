"use client";
import { useEffect, useState } from "react";
import {
  getDailyTasks,
  completeTask,
  uncheckTask,
} from "@/lib/taskTracker";

export default function DailyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyTasks()
      .then((res) => {
        setTasks(res.data.tasks || []);
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

const toggleTask = async (taskId, isCompleted) => {
  try {
    if (isCompleted) {
      await uncheckTask(taskId);
    } else {
      await completeTask(taskId);
    }

    const updatedTasks = tasks.map((task) =>
      task._id === taskId ? { ...task, isCompleted: !isCompleted } : task
    );
    setTasks(updatedTasks);

    // Kirim event + data biar progress bar ikut update
    const done = updatedTasks.filter((t) => t.isCompleted).length;
    const total = updatedTasks.length;
    window.dispatchEvent(
      new CustomEvent("taskUpdated", {
        detail: { done, total },
      })
    );
  } catch (err) {
    console.error("❌ Gagal update checklist:", err);
  }
};


  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm flex items-center animate-pulse"
          >
            <div className="mr-3 grid h-10 w-10 place-items-center rounded-2xl bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-gray-200" />
              <div className="h-2.5 w-20 rounded bg-gray-200" />
            </div>
            <div className="ml-3 h-9 w-9 rounded-2xl border border-black/10 bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white p-4 text-center text-sm text-gray-500 shadow-sm m-4">
        Belum ada tugas hari ini.
      </div>
    );
  }

  return (
    <main className="p-4 space-y-3 mb-0.5">

      {tasks.map((task) => (
        <div
          key={task._id}
          className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm flex items-center"
        >
          <div className="mr-3 grid h-10 w-10 place-items-center rounded-2xl bg-gray-100 text-lg">
            <span>{task.symbol || "🌿"}</span>
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{task.title}</p>
            <p
              className={`text-xs ${
                task.isCompleted ? "text-[#FEA800]" : "text-gray-500"
              }`}
            >
              {task.isCompleted ? "Selesai" : "Belum dikerjakan"}
            </p>
          </div>

          <button
            onClick={() => toggleTask(task._id, task.isCompleted)}
            className={[
              "ml-3 h-9 w-9 rounded-2xl grid place-items-center border shadow-sm",
              task.isCompleted
                ? "bg-[#FEA800] border-[#FEA800] text-white"
                : "bg-white border-black/10 text-[#FEA800]",
            ].join(" ")}
          >
            {task.isCompleted ? "✓" : "+"}
          </button>
        </div>
      ))}
    </main>
  );
}
