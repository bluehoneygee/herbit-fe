"use client";
import { useEffect, useState } from "react";
import { getMe } from "@/lib/user";

export default function useDailyStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        // coba log dulu
        console.log("[useDailyStreak] me:", me);

        // cek dua kemungkinan bentuk data
        const user = me.user || me;
        setStreak(user?.sortingStreak || 0);
      } catch (err) {
        console.error("Failed to load streak:", err);
      }
    })();
  }, []);

  return { streak, setStreak };
}
