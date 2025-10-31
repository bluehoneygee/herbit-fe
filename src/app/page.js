"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Onboarding from "@/components/splash/Onboarding";
import HomePage from "./(features)/page";
import FeaturesLayout from "./(features)/layout";
import apiClient from "@/lib/apiClient";

const SEEN_KEY = "herbit_onboarding_v1";

export default function Root() {
  const router = useRouter();
  const [stage, setStage] = useState("decide"); // decide | onboarding | home

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        await apiClient.get("/auth/me");
        if (!cancelled) {
          setStage("home");
        }
      } catch (error) {
        if (cancelled) return;
        const seen = typeof window !== "undefined" && localStorage.getItem(SEEN_KEY) === "1";
        if (!seen) {
          setStage("onboarding");
        } else {
          router.replace("/login");
        }
      }
    }

    checkAuth();

    return () => { cancelled = true; };
  }, [router]);

  if (stage === "decide") return null;

  if (stage === "onboarding") {
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

  return (
    <FeaturesLayout>
      <HomePage />
    </FeaturesLayout>
  );
}
