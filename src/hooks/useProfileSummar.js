"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const DEFAULT_SUMMARY = {
  user: null,
  tabs: [],
  activityFilters: [],
  activities: [],
};

export default function useProfileSummary(username) {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (username) {
        params.set("username", username);
      }
      const response = await axios.get(
        `/api/profile/summary${params.toString() ? `?${params.toString()}` : ""}`,
        {
          headers: { "Cache-Control": "no-cache" },
        }
      );
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
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return useMemo(
    () => ({ summary, loading, error, refetch: loadProfile }),
    [summary, loading, error, loadProfile]
  );
}
