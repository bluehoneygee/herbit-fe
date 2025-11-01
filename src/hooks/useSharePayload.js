"use client";

import { useCallback, useState } from "react";

const clamp = (text, max) => (text.length <= max ? text : text.slice(0, Math.max(0, max - 1)) + "…");

export default function useSharePayload({ streak, factData }) {
  const [openShare, setOpenShare] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [sharePayload, setSharePayload] = useState(null);

  const buildSharePayload = useCallback(async () => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const line1 = `Aku sudah konsisten memilah & membuang sampah ${streak} hari beruntun di GreenCycle.`;
    const line2 = `Fun fact: ${factData?.fact || ""}`;
    const line3 = `— ${factData?.source || ""}`;
    const combined = [line1, line2, line3, "", pageUrl].join("\n");

    const tweetMain = clamp([line1, line2].join("\n"), 200);
    const tweet = `${tweetMain}\n${line3}`;

    return { line1, line2, line3, combined, tweet, pageUrl };
  }, [streak, factData]);

  const openShareSheet = useCallback(async () => {
    setOpenShare(true);
    setSharing(true);
    const payload = await buildSharePayload();
    setSharePayload(payload);
    setSharing(false);
  }, [buildSharePayload]);

  const safeCopy = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch {}
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.top = "-1000px"; ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch { return false; }
  };

  const shareSystem = async () => {
    if (!sharePayload) return;
    const { combined } = sharePayload;
    if (navigator.share && navigator.canShare?.({ text: combined })) {
      await navigator.share({ title: "GreenCycle – Daily Streak", text: combined });
    } else {
      await navigator.clipboard.writeText(combined);
      alert("✅ Teks & link sudah disalin ke clipboard!");
    }
    setOpenShare(false);
  };

  const shareTwitter = () => {
    if (!sharePayload) return;
    const { tweet, pageUrl } = sharePayload;
    const params = new URLSearchParams({ text: tweet, url: pageUrl, hashtags: "GreenCycle,GoGreen,Recycle" });
    window.open(`https://x.com/intent/post?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  const shareWhatsApp = () => {
    if (!sharePayload) return;
    const { combined } = sharePayload;
    const url = `https://wa.me/?text=${encodeURIComponent(combined)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareTelegram = () => {
    if (!sharePayload) return;
    const { combined, pageUrl } = sharePayload;
    const url = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(combined)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyText = async () => {
    if (!sharePayload) return;
    const ok = await safeCopy(sharePayload.combined);
    alert(ok ? "✅ Teks & link sudah disalin!" : "⚠️ Gagal menyalin. Coba tahan lalu paste manual.");
  };

  return {
    openShare, setOpenShare,
    sharing,
    sharePayload, setSharePayload,
    openShareSheet,
    shareSystem, shareTwitter, shareWhatsApp, shareTelegram, copyText,
  };
}
