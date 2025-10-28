"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Onboarding from "@/components/splash/Onboarding";

const SEEN_KEY = "herbit_onboarding_v1";

export default function Root() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(SEEN_KEY) === "1";
    if (seen) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        credentials: "include",
      }).then((r) => router.replace(r.ok ? "/features" : "/login"));
      return;
    }

    setShowOnboarding(true);
  }, [router]);

  if (!showOnboarding) return null;

  return (
    <Onboarding
      onStart={() => {
        localStorage.setItem(SEEN_KEY, "1");
        router.replace("/login");
      }}
      onSkip={() => {
        localStorage.setItem(SEEN_KEY, "1");
        router.replace("/login");
      }}
    />
  );
}
