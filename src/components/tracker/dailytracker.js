"use client";
import { useEffect, useState } from "react";
import {
  getDailyTasks,
  completeTask,
  uncheckTask,
} from "@/lib/dailyTracker";

export default function DailyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil daftar tugas harian dari backend
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

  // Fungsi toggle checklist (centang / batal)
  const toggleTask = async (taskId, isCompleted) => {
    try {
      if (isCompleted) {
        await uncheckTask(taskId);
      } else {
        await completeTask(taskId);
      }

      // Update status di state supaya UI langsung berubah
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, isCompleted: !isCompleted } : task
        )
      );
    } catch (err) {
      console.error("❌ Gagal update checklist:", err);
    }
  };

  if (loading)
    return <p style={{ textAlign: "center" }}>Loading daily tasks...</p>;

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1 style={{ textAlign: "center" }}>🌱 Daily Tasks</h1>

      <ul style={{ listStyle: "none", padding: 0, maxWidth: "500px", margin: "0 auto" }}>
        {tasks.map((task) => (
          <li
            key={task._id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              margin: "1rem 0",
              padding: "1rem",
              border: "1px solid #ccc",
              borderRadius: "10px",
              backgroundColor: task.isCompleted ? "#e6ffe6" : "#fff",
              transition: "0.3s",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                {task.symbol} {task.title}
              </h3>
             
            </div>

            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => toggleTask(task._id, task.isCompleted)}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
