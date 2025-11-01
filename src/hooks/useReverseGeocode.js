"use client";
import { useCallback } from "react";
import { reverseGeocode } from "@/lib/nominatim";

export function useReverseGeocode({ onLabeled }) {
  return useCallback(
    async (lat, lon) => {
      try {
        const { label } = await reverseGeocode(lat, lon);
        onLabeled?.(label);
        return label;
      } catch {
        const fallback = `Lat ${lat.toFixed(4)}, Lng ${lon.toFixed(4)}`;
        onLabeled?.(fallback);
        return fallback;
      }
    },
    [onLabeled]
  );
}
