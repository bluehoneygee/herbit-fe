"use client";

import ActivityFilters from "@/components/profile/ActivityFilters";
import ActivityList from "@/components/profile/ActivityList";
import useProfileSummary from "@/hooks/useProfileSummar";
import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "week", label: "Minggu ini" },
  { id: "month", label: "Bulan ini" },
];

export default function AktivitasView({ username }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filterParam = searchParams.get("filter") ?? "all";
  const { summary, loading } = useProfileSummary(username);
  const filters = summary?.activityFilters ?? FILTERS;

  const [activeFilter, setActiveFilter] = useState(filterParam);

  useEffect(() => {
    setActiveFilter(filterParam);
  }, [filterParam]);

  useEffect(() => {
    if (!filters.some((filter) => filter.id === activeFilter)) {
      const defaultFilter = filters.find((f) => f.active) ?? filters[0] ?? FILTERS[0];
      setActiveFilter(defaultFilter.id);
    }
  }, [filters, activeFilter]);

  const activities = useMemo(() => {
    const list = summary?.activities ?? [];
    if (activeFilter === "all") {
      return list;
    }
    return list.filter((item) =>
      Array.isArray(item.periods) ? item.periods.includes(activeFilter) : true
    );
  }, [summary?.activities, activeFilter]);

  const handleFilterChange = (nextFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", nextFilter);
    router.replace(`${pathname}?${params.toString()}`);
    setActiveFilter(nextFilter);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Aktivitas</h2>
        </div>

        <div className="flex gap-2">
          {filters.map((filter) => (
            <div
              key={`filter-skeleton-${filter.id}`}
              className="h-8 w-20 rounded-full bg-gray-100 animate-pulse"
            />
          ))}
        </div>

        <ActivityList loading />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Aktivitas</h2>
      </div>

      <ActivityFilters
        filters={filters}
        activeId={activeFilter}
        onChange={handleFilterChange}
      />

      <ActivityList items={activities} loading={loading} />
    </div>
  );
}
