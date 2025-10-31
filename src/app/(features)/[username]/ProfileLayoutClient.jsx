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

  const contextValue = useMemo(
    () => ({ summary, loading, error, refetch }),
    [summary, loading, error, refetch]
  );

  return (
    <ProfileSummaryProvider value={contextValue}>
      <div className="px-4 pb-10">
        <ProfileHeader user={headerUser} loading={loading} />

        {tabs.length > 0 && (
          <ProfileTabs
            tabs={tabs}
            activeId={activeTab}
            onChange={handleTabChange}
          />
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-[#E24B4B]/20 bg-[#E24B4B]/10 p-4 text-sm text-[#8B1E1E]">
            Gagal memuat data: {error}. Silakan coba beberapa saat lagi.
          </div>
        )}

        <section className="mt-6 space-y-4">{children}</section>
      </div>
    </ProfileSummaryProvider>
  );
}
