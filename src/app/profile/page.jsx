"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const response = await axios.get("/api/profile/summary", {
          headers: { "Cache-Control": "no-cache" },
        });
        const username =
          response.data?.user?.username ||
          response.data?.user?.name ||
          null;
        if (!cancelled && username) {
          router.replace(`/${username}/aktivitas`);
        }
      } catch (err) {
        if (!cancelled) {
          router.replace("/");
        }
      }
    }
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
