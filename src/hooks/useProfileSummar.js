"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import apiClient from "@/lib/apiClient";
import { normalizePhotos } from "@/lib/absoluteUrl";

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
      const response = await apiClient.get("/users/profile-summary", {
        headers: { "Cache-Control": "no-cache" },
      });
      const payload = response.data ?? {};
      const data =
        payload && typeof payload === "object" && typeof payload.data === "object"
          ? payload.data
          : payload;
      const normalizedData = normalizePhotos({ ...DEFAULT_SUMMARY, ...data });
      const rawMilestone = normalizedData?.rewards?.milestone;
      const milestones = Array.isArray(rawMilestone)
        ? rawMilestone
        : rawMilestone
        ? [rawMilestone]
        : [];
      const voucherAvailable =
        normalizedData?.vouchers?.available ??
        (Array.isArray(normalizedData?.vouchers) ? normalizedData.vouchers : []);
      const voucherHistory = normalizedData?.vouchers?.history ?? [];

      setSummary({
        ...normalizedData,
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
        const responsePayload = err.response?.data ?? {};
        const errorPayload =
          responsePayload?.error ??
          responsePayload?.message ??
          responsePayload?.details;
        if (typeof errorPayload === "string") {
          message = errorPayload;
        } else if (
          errorPayload &&
          typeof errorPayload === "object" &&
          !Array.isArray(errorPayload)
        ) {
          message =
            errorPayload.details ??
            errorPayload.message ??
            errorPayload.code ??
            JSON.stringify(errorPayload);
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
