"use client";

import RewardsPanel from "@/components/profile/rewards/RewardsPanel";
import useProfileSummary from "@/hooks/useProfileSummar";

export default function RewardsView({ username }) {
  const { summary, loading, error, refetch } = useProfileSummary(username);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-[#E24B4B]/20 bg-[#E24B4B]/10 p-4 text-sm text-[#8B1E1E]">
          Gagal memuat data: {error}. Silakan coba beberapa saat lagi.
        </div>
      )}

      <RewardsPanel
        rewards={summary?.rewards}
        loading={loading}
        onRefresh={refetch}
        username={username}
      />
    </div>
  );
}
