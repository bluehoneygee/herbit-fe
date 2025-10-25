"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const DEFAULT_SUMMARY = {
  user: null,
  progress: null,
  ecoenzym: null,
  rewardsBanners: [],
  habitsToday: [],
};

export function useHomeSummary() {
  const [data, setData] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchSummary() {
      try {
        const response = await axios.get("/api/summary/home", {
          headers: { "Cache-Control": "no-cache" },
        });

        if (active) {
          setData({ ...DEFAULT_SUMMARY, ...response.data });
        }
      } catch (err) {
        if (!active) return;
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error ?? err.message
          : err instanceof Error
          ? err.message
          : "Unknown error";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchSummary();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      summary: data,
      loading,
      error,
    }),
    [data, loading, error]
  );

  return value;
}

export default useHomeSummary;
