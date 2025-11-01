"use client";
import { useEffect, useRef, useState } from "react";
import { reverseGeocode } from "@/lib/nominatim";


const geocodeCache = new Map();

export function useGeocodeFacilities(
  facilities,
  { updateFacilityAddress, delayMs = 1200 } = {}
) {
  const [geocoding, setGeocoding] = useState(new Set());
  const timerIds = useRef([]);

  useEffect(() => {
    const toDo = facilities.filter((f) => !f.address);
    if (!toDo.length) return;

    let delay = 0;
    toDo.forEach((f) => {
      const key = `${f.lat.toFixed(6)},${f.lon.toFixed(6)}`;
      if (geocodeCache.has(key)) {
        updateFacilityAddress?.(f.id, geocodeCache.get(key));
        return;
      }

      setGeocoding((prev) => new Set(prev).add(f.id));
      const id = setTimeout(async () => {
        try {
          const { label } = await reverseGeocode(f.lat, f.lon);
          geocodeCache.set(key, label);
          updateFacilityAddress?.(f.id, label);
        } finally {
          setGeocoding((prev) => {
            const next = new Set(prev);
            next.delete(f.id);
            return next;
          });
        }
      }, delay);
      timerIds.current.push(id);
      delay += delayMs;
    });

    return () => {
      timerIds.current.forEach(clearTimeout);
      timerIds.current = [];
    };
  }, [facilities, updateFacilityAddress, delayMs]);

  return geocoding;
}
