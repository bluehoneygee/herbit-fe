"use client";

import ActivityFilters from "@/components/profile/ActivityFilters";
import ActivityList from "@/components/profile/ActivityList";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import useProfileSummary from "@/hooks/useProfileSummar";

import { useEffect, useMemo, useState } from "react";

export default function ProfilePage() {
  const { summary, loading, error } = useProfileSummary();

  const tabs = summary?.tabs ?? [];
  const filters = summary?.activity_filters ?? [];
  const defaultTab = tabs[0]?.id ?? "activities";
  const defaultFilter =
    filters.find((f) => f.active)?.id ?? filters[0]?.id ?? "all";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [activeFilter, setActiveFilter] = useState(defaultFilter);

  useEffect(() => {
    setActiveTab((prev) =>
      tabs.some((tab) => tab.id === prev) ? prev : defaultTab
    );
  }, [tabs, defaultTab]);

  useEffect(() => {
    setActiveFilter((prev) =>
      filters.some((filter) => filter.id === prev) ? prev : defaultFilter
    );
  }, [filters, defaultFilter]);

  const activities = useMemo(() => {
    if (activeTab !== "activities") {
      return [];
    }
    const list = summary?.activities ?? [];
    if (activeFilter === "all") {
      return list;
    }
    return list.filter((item) =>
      Array.isArray(item.periods) ? item.periods.includes(activeFilter) : true
    );
  }, [activeTab, summary?.activities, activeFilter]);

  return (
    <main className="relative min-h-screen pb-24">
      <div className="px-4 pb-10">
        <ProfileHeader user={loading ? null : summary?.user} />

        {tabs.length > 0 && (
          <div className="mt-6">
            <ProfileTabs
              tabs={tabs}
              activeId={activeTab}
              onChange={setActiveTab}
            />
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-[#E24B4B]/20 bg-[#E24B4B]/10 p-4 text-sm text-[#8B1E1E]">
            Gagal memuat data: {error}. Silakan coba beberapa saat lagi.
          </div>
        )}

        <section className="mt-6 space-y-4">
          {activeTab === "activities" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">
                  Aktivitas
                </h2>
              </div>

              <ActivityFilters
                filters={filters}
                activeId={activeFilter}
                onChange={setActiveFilter}
              />

              <ActivityList items={activities} loading={loading} />
            </div>
          ) : (
            <div className="rounded-[28px] bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
              Rewards akan segera hadir.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
