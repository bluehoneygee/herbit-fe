"use client";

import { useState, useCallback } from "react";


export default function useFunFact() {
  const [factData, setFactData] = useState({ fact: "", source: "" });
  const [loading, setLoading] = useState(false);

  const fetchFunFact = useCallback(async () => {
    setLoading(true);
    let fact = "Mendaur ulang aluminium menghemat hingga ~95% energi.";
    let source = "US EPA – Recycling Basics";
    try {
      const res = await fetch("/api/fact", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        let raw = (data?.fact || fact).toString().trim();
        raw = raw.replace(/Sumber:\s*.+$/i, "").trim(); // strip “Sumber: …”
        fact = raw;
        source = data?.source?.title || source;
      }
    } catch {}
    setFactData({ fact, source });
    setLoading(false);
  }, []);

  return { factData, fetchFunFact, setFactData, loading };
}
