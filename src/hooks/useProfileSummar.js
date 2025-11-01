"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const DEFAULT_SUMMARY = {
  user: null,
  activities: [],
  rewards: { milestone: [] },
  vouchers: { available: [], history: [] },
};

export default function useProfileSummary() {
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/profile/summary", {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = response.data ?? {};
      console.log("Profile summary API data: ", data);
      const rawMilestone = data?.rewards?.milestone;
      const milestones = Array.isArray(rawMilestone)
        ? rawMilestone
        : rawMilestone
        ? [rawMilestone]
        : [];
      const voucherAvailable =
        data?.vouchers?.available ??
        (Array.isArray(data?.vouchers) ? data.vouchers : []);
      const voucherHistory = data?.vouchers?.history ?? [];

      setSummary({
        ...DEFAULT_SUMMARY,
        ...data,
        rewards: {
          milestone: milestones,
        },
        vouchers: {
          available: voucherAvailable,
          history: voucherHistory,
        },
      });
      setError(null);
    } catch (err) {
      let message = "Unknown error";
      if (axios.isAxiosError(err)) {
        const payload = err.response?.data?.error;
        if (typeof payload === "string") {
          message = payload;
        } else if (payload && typeof payload === "object") {
          message =
            payload.details ??
            payload.message ??
            payload.code ??
            JSON.stringify(payload);
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
    loadProfile();
  }, [loadProfile]);

  return useMemo(
    () => ({ summary, loading, error, refetch: loadProfile }),
    [summary, loading, error, loadProfile]
  );
}
