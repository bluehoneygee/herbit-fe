"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import apiClient from "@/lib/apiClient";

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

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/users/home-summary", {
        headers: { "Cache-Control": "no-cache" },
      });
      const payload = response.data ?? {};
      const content =
        payload && typeof payload === "object" && typeof payload.data === "object"
          ? payload.data
          : payload;
      setData({ ...DEFAULT_SUMMARY, ...content });
      setError(null);
    } catch (err) {
      let message = "Unknown error";
      if (axios.isAxiosError(err)) {
        const responsePayload = err.response?.data ?? {};
        const dataError =
          responsePayload?.error ??
          responsePayload?.message ??
          responsePayload?.details;
        if (typeof dataError === "string") {
          message = dataError;
        } else if (err.message) {
          message = err.message;
        }
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const value = useMemo(
    () => ({
      summary: data,
      loading,
      error,
      refetch: fetchSummary,
    }),
    [data, loading, error, fetchSummary]
  );

  return value;
}

export default useHomeSummary;
