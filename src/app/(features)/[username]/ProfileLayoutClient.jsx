"use client";

import { useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import useProfileSummary from "@/hooks/useProfileSummar";
import { ProfileSummaryProvider } from "@/context/ProfileSummaryContext";

const DEFAULT_TABS = [
  { id: "activities", label: "Aktivitas" },
  { id: "rewards", label: "Rewards & Vouchers" },
];

export default function ProfileLayoutClient({ params, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { summary, loading, error, refetch } = useProfileSummary();

  console.log("PROFILEEE:", summary);

  const tabs = summary?.tabs?.length ? summary.tabs : DEFAULT_TABS;
  const activeTab = useMemo(() => {
    if (pathname?.endsWith("/aktivitas")) return "activities";
    if (pathname?.endsWith("/rewards")) return "rewards";
    return tabs[0]?.id ?? "activities";
  }, [pathname, tabs]);

  const headerUser = summary?.user;

  const handleTabChange = useCallback(
    (tabId) => {
      const targetSegment = tabId === "rewards" ? "rewards" : "aktivitas";
      router.replace(`/${params.username}/${targetSegment}`);
    },
    [params.username, router]
  );

  const handleSettings = useCallback(() => {
    router.push("/settings");
  }, [router]);

  const contextValue = useMemo(
    () => ({ summary, loading, error, refetch }),
    [summary, loading, error, refetch]
  );

  return (
    <ProfileSummaryProvider value={contextValue}>
      <div className="flex min-h-screen flex-col">
        <div className="sticky top-0 z-20 bg-white px-4 pb-4 backdrop-blur">
          <ProfileHeader
            user={headerUser}
            loading={loading}
            onSettings={handleSettings}
          />

          {tabs.length > 0 && (
            <ProfileTabs
              tabs={tabs}
              activeId={activeTab}
              onChange={handleTabChange}
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28">
          {error && (
            <div className="mt-6 rounded-2xl border border-[#E24B4B]/20 bg-[#E24B4B]/10 p-4 text-sm text-[#8B1E1E]">
              Gagal memuat data: {error}. Silakan coba beberapa saat lagi.
            </div>
          )}

          <section className="mt-6 space-y-4">{children}</section>
        </div>
      </div>
    </ProfileSummaryProvider>
  );
}
