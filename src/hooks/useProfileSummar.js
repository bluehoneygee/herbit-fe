"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import apiClient from "@/lib/apiClient";

const DEFAULT_SUMMARY = {
  user: null,
  tabs: [],
  activity_filters: [],
  activities: [],
};

export default function useProfileSummary() {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await apiClient.get("/api/profile/summary", {
          headers: { "Cache-Control": "no-cache" },
        });

        if (active) {
          setSummary({ ...DEFAULT_SUMMARY, ...response.data });
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

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  return useMemo(
    () => ({ summary, loading, error }),
    [summary, loading, error]
  );
}
