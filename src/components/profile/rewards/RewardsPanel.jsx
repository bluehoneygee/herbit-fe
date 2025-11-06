"use client";

import { useCallback, useEffect, useState } from "react";
import RewardsMilestone from "./RewardsMilestone";
import RewardVoucherCard from "./RewardVoucherCard";
import RewardHistoryList from "./RewardHistoryList";
import apiClient from "@/lib/apiClient";

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : item))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
};

const normalizeRedemptionPayload = (raw, fallback = {}) => {
  if (!raw) return fallback || null;

  const instructionsSource =
    raw.instructions ??
    raw.instructionsText ??
    raw.instructions_text ??
    raw.steps ??
    fallback.instructions ?? [];

  return {
    ...fallback,
    ...raw,
    name:
      raw.name ??
      raw.voucherName ??
      raw.rewardName ??
      raw.title ??
      fallback.name,
    description:
      raw.description ??
      raw.details ??
      raw.rewardDescription ??
      raw.reward_description ??
      raw.desc ??
      fallback.description,
    image:
      raw.image ??
      raw.imageUrl ??
      raw.rewardImageUrl ??
      raw.photoUrl ??
      fallback.image,
    code:
      raw.code ??
      raw.voucherCode ??
      raw.voucher_code ??
      raw.redeemCode ??
      raw.claimCode ??
      raw.claim_code ??
      fallback.code,
    expiresAt:
      raw.expiresAt ??
      raw.expiredAt ??
      raw.expired_at ??
      raw.expires_at ??
      raw.expiryDate ??
      raw.expiry_date ??
      fallback.expiresAt,
    landingUrl:
      raw.landingUrl ??
      raw.landingURL ??
      raw.landing_url ??
      raw.url ??
      raw.link ??
      fallback.landingUrl,
    instructions: normalizeList(instructionsSource),
  };
};

export default function RewardsPanel({
  rewards,
  vouchers,
  loading,
  onRefresh,
  username,
}) {
  const normalizeMilestones = useCallback((value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (value) {
      return [value];
    }
    return [];
  }, []);

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherDetailLoading, setVoucherDetailLoading] = useState(false);
  const [voucherDetailError, setVoucherDetailError] = useState(null);
  const [redeemResult, setRedeemResult] = useState(null);
  const [redeemError, setRedeemError] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [available, setAvailable] = useState(vouchers?.available ?? []);
  const [history, setHistory] = useState(
    Array.isArray(vouchers?.history)
      ? vouchers.history.slice(0, 10)
      : []
  );
  const [milestones, setMilestones] = useState(
    normalizeMilestones(rewards?.milestone)
  );
  const [historyPreviewLoading, setHistoryPreviewLoading] = useState(false);

  const normalizeRedemption = useCallback(
    (data, fallback = {}) => normalizeRedemptionPayload(data, fallback),
    []
  );

  useEffect(() => {
    if (rewards) {
      setMilestones(normalizeMilestones(rewards.milestone));
    }
  }, [rewards, normalizeMilestones]);

  useEffect(() => {
    if (vouchers) {
      setAvailable(vouchers.available ?? []);
      const incomingHistory = Array.isArray(vouchers.history)
        ? vouchers.history.slice(0, 10)
        : [];
      setHistory(incomingHistory);
    }
  }, [vouchers]);

  const handleClaimMilestone = useCallback(
    async (milestone) => {
      if (!milestone) return;
      const rewardCode = milestone.code ?? milestone.id;
      if (!rewardCode) return;
      try {
        const payload = { ...(username ? { username } : {}) };
        await apiClient.post(`/rewards/${rewardCode}/claim`, payload);
        onRefresh?.();
      } catch (error) {
        console.error("claim milestone failed:", error);
      }
    },
    [onRefresh, username]
  );

  const handleOpenVoucher = useCallback(async (voucher) => {
    if (!voucher?.id) return;
    setVoucherDetailError(null);
    setVoucherDetailLoading(true);
    try {
      const response = await apiClient.get(`/vouchers/${voucher.id}`);
      const detail = response.data.data;
      if (!detail) {
        throw new Error("Voucher detail tidak ditemukan");
      }
      setSelectedVoucher({
        ...detail,
        image: detail.imageUrl,
        terms: normalizeList(detail.terms),
      });
    } catch (error) {
      const message =
        error?.response?.data?.error ??
        error?.message ??
        "Gagal memuat detail voucher.";
      setVoucherDetailError(message);
      setSelectedVoucher(null);
    } finally {
      setVoucherDetailLoading(false);
    }
  }, []);

  const handleRedeem = useCallback(
    async (voucher) => {
      if (!voucher || redeeming) return;
      setRedeemError(null);
      setRedeeming(true);
      try {
        const response = await apiClient.post(
          `/vouchers/${voucher.id}/claim`,
          username ? { username } : {}
        );
        const redemption = response.data.data;
        const successPayload = normalizeRedemption(redemption, redeemResult ?? {});
        setRedeemResult(successPayload);
        setSelectedVoucher(null);
        setVoucherDetailError(null);
        onRefresh?.();
      } catch (error) {
        const message =
          error?.response?.data?.error?.details ??
          error?.response?.data?.error ??
          error?.message ??
          "Gagal menukar voucher. Coba lagi.";
        setRedeemError(message);
      } finally {
        setRedeeming(false);
      }
    },
    [redeeming, onRefresh, username, normalizeRedemption, redeemResult]
  );

  const handleOpenHistoryItem = useCallback(
    async (item) => {
      if (!item) return;
      const identifier =
        item.id ?? item.redemptionId ?? item.redemption_id ?? item.voucherId;

      const fallback = normalizeRedemption(item, redeemResult ?? {});
      setRedeemResult(fallback);

      if (!identifier) {
        console.warn("[RewardsPanel] history item tanpa id", item);
        return;
      }

      setHistoryPreviewLoading(true);
      try {
        const response = await apiClient.get(`/redemptions/${identifier}`);
        const detail = response.data?.data ?? response.data ?? null;
        if (!detail) {
          throw new Error("Detail riwayat tidak ditemukan");
        }
        const normalized = normalizeRedemption(detail, fallback);
        setRedeemResult(normalized);
        console.log("[RewardsPanel] history detail", normalized);
      } catch (error) {
        console.error("[RewardsPanel] gagal memuat detail riwayat", error);
      } finally {
        setHistoryPreviewLoading(false);
      }
    },
    [normalizeRedemption, redeemResult]
  );

  if (!rewards && !loading) {
    return (
      <div className="rounded-[28px] bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        Rewards belum tersedia.
      </div>
    );
  }

  if (loading) {
    return <RewardsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {milestones.length > 0 && (
        <RewardsMilestone
          milestones={milestones}
          onClaim={handleClaimMilestone}
        />
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Voucher tersedia
        </h3>
        {available.length > 0 ? (
          <div className="space-y-3">
            {available.map((voucher) => (
              <RewardVoucherCard
                key={voucher.id}
                voucher={voucher}
                onRedeem={handleOpenVoucher}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            Belum ada voucher tersedia untuk saat ini.
          </div>
        )}
      </section>

      <RewardHistoryList history={history.slice(0, 10)} onSelect={handleOpenHistoryItem} />

      <RedeemDialog
        voucher={selectedVoucher}
        loading={redeeming}
        error={redeemError}
        detailLoading={voucherDetailLoading}
        detailError={voucherDetailError}
        onClose={() => {
          setRedeemError(null);
          setVoucherDetailError(null);
          setVoucherDetailLoading(false);
          setSelectedVoucher(null);
        }}
        onConfirm={handleRedeem}
      />

      <RedeemSuccessDialog
        redemption={redeemResult}
        loading={historyPreviewLoading}
        onClose={() => {
          setHistoryPreviewLoading(false);
          setRedeemResult(null);
        }}
      />
    </div>
  );
}

function RedeemDialog({
  voucher,
  onClose,
  onConfirm,
  loading,
  error,
  detailLoading,
  detailError,
}) {
  if (!voucher) return null;

  const terms = normalizeList(voucher.terms);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-sm overflow-hidden rounded-4xl bg-white shadow-2xl">
        <div className="flex items-start gap-4 px-6 py-6">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden ">
            <img
              src={voucher.image}
              alt={voucher.name}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-[15px] font-semibold text-gray-900">
              {voucher.name}
            </h4>
            <p className="text-[11px] text-gray-500">{voucher.description}</p>
            <p className="text-[11px] font-semibold text-[#F97316]">
              Poin dibutuhkan: {voucher.pointsRequired} poin
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-lg text-gray-500 transition hover:text-gray-700"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-[#FACC15]/40 bg-[#FFF3DA] px-4 py-3">
            <p className="text-sm font-semibold text-[#FEA800]">
              Syarat & Ketentuan
            </p>
            {detailLoading ? (
              <ul className="mt-2 space-y-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <li
                    key={`voucher-detail-skeleton-${idx}`}
                    className="h-2.5 w-full rounded bg-[#FDE68A] animate-pulse"
                  />
                ))}
              </ul>
            ) : (
              <ul className="mt-2 list-decimal space-y-1 pl-5 text-xs text-gray-600">
                {terms.map((term, idx) => (
                  <li key={`term-${idx}`}>{term}</li>
                ))}
                {terms.length === 0 && (
                  <li>Detail voucher akan diinformasikan setelah klaim.</li>
                )}
              </ul>
            )}
            {detailError && (
              <p className="mt-2 text-xs font-semibold text-[#E24B4B]">
                {detailError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onConfirm?.(voucher)}
            disabled={loading}
            className={`mt-6 w-full rounded-full py-2 text-sm font-semibold text-white shadow-md transition ${
              loading
                ? "cursor-wait bg-[#4A2D8B]/60"
                : "bg-[#4A2D8B] hover:bg-[#3C2374]"
            }`}
          >
            {loading ? "Menukar..." : "Tukar"}
          </button>

          {error && (
            <p className="mt-3 text-center text-xs font-semibold text-[#E24B4B]">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RewardsSkeleton() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[20px] border border-[#FACC15] bg-white px-4 py-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="h-36 w-36 shrink-0 rounded-full border border-[#FACC15]/40 bg-gray-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
            <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-3 w-56 rounded bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                <span className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
                <span className="h-3 w-10 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#FFF7E0]">
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-[#FEA800] animate-pulse" />
                </div>
                <div className="h-7 w-7 rounded-full bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 h-8 w-40 rounded-full bg-gray-200 animate-pulse" />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Voucher tersedia
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={`voucher-skeleton-${idx}`}
              className="relative overflow-hidden rounded-[12px] border border-[#FACC15]/40 bg-white shadow-sm"
            >
              <div className="relative z-10 px-4 pt-5 pb-3">
                <div className="flex items-start justify-between gap-3 pl-4 pr-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-2xl bg-gray-100 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                      <div className="h-3 w-40 max-w-[180px] rounded bg-gray-200 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-7 w-24 rounded-full bg-gray-200 animate-pulse" />
                </div>
                <div className="mt-4 h-px w-full border-t border-dashed border-gray-200" />
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative flex-1">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#FFE6BF]">
                      <div className="h-full w-1/2 rounded-full bg-[#FEA800] animate-pulse" />
                    </div>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-gray-100 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Riwayat Redeem</h3>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={`history-skeleton-${idx}`}
            className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-sm"
          >
            <div className="h-10 w-10 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 rounded bg-gray-200 animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="h-4 w-12 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </section>
    </div>
  );
}

function RedeemSuccessDialog({ redemption, loading = false, onClose }) {
  if (!redemption) return null;

  const { name, image, code, expiresAt, landingUrl, instructions } = redemption;

  const normalizedInstructions = normalizeList(instructions);

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-sm overflow-hidden rounded-4xl bg-white shadow-2xl">
        <div className="flex items-start gap-4 px-6 py-6">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white overflow-hidden ">
            <img
              src={image}
              alt={name}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="text-lg font-semibold text-gray-900">
              Berhasil ditukar!
            </h4>
            <p className="text-sm text-gray-500">{name}</p>
            {expiresAt && (
              <p className="text-sm font-semibold text-[#FEA800]">
                Berlaku sampai: <br></br>
                {new Date(expiresAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-lg text-gray-500 transition hover:text-gray-700"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="rounded-2xl border border-[#FACC15]/40 bg-[#FFF8EB] px-4 py-3 text-center">
            <p className="text-xs font-semibold text-[#FEA800]">Kode voucher</p>
            <div className="mt-2 rounded-xl border border-dashed border-[#FACC15] bg-white px-3 py-2 text-center text-sm font-semibold text-[#4A2D8B]">
              {loading && !code ? "Memuat..." : code ?? "—"}
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <p className="font-semibold text-[#475467]">Cara pakai voucher:</p>
            {loading && normalizedInstructions.length === 0 ? (
              <p className="text-gray-400">Memuat detail...</p>
            ) : (
              <ol className="list-decimal space-y-1 pl-5">
                {normalizedInstructions.length > 0 ? (
                  normalizedInstructions.map((step, idx) => (
                    <li key={`instruction-${idx}`}>{step}</li>
                  ))
                ) : (
                  <li>Ikuti instruksi yang tertera pada detail voucher.</li>
                )}
              </ol>
            )}
          </div>

          {landingUrl && (
            <a
              href={landingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full bg-[#4A2D8B] py-2 text-center text-sm font-semibold text-white shadow-md transition hover:bg-[#3C2374]"
            >
              Gunakan voucher
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
