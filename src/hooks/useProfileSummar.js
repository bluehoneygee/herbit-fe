"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const DEFAULT_SUMMARY = {
  user: null,
  tabs: [],
  activityFilters: [],
  activities: [],
};

export default function useProfileSummary() {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const response = await axios.get("/api/profile/summary", {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = response.data ?? {};
      setSummary({
        ...DEFAULT_SUMMARY,
        ...data,
        activityFilters:
          data.activityFilters ??
          data.activity_filters ??
          DEFAULT_SUMMARY.activityFilters,
      });
      setError(null);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error ?? err.message
        : err instanceof Error
        ? err.message
        : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return useMemo(
    () => ({ summary, loading, error, refetch: loadProfile }),
    [summary, loading, error, loadProfile]
  );
}
