"use client";

import { useCallback, useEffect, useState } from "react";
import RewardsMilestone from "./RewardsMilestone";
import RewardVoucherCard from "./RewardVoucherCard";
import RewardHistoryList from "./RewardHistoryList";
import apiClient from "@/lib/apiClient";

export default function RewardsPanel({ rewards, loading, onRefresh }) {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [redeemSuccess, setRedeemSuccess] = useState(null);
  const [redeemError, setRedeemError] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [available, setAvailable] = useState(rewards?.available ?? []);
  const [history, setHistory] = useState(rewards?.history ?? []);
  const [milestone, setMilestone] = useState(rewards?.milestone ?? null);

  useEffect(() => {
    if (rewards) {
      setAvailable(rewards.available ?? []);
      setHistory(rewards.history ?? []);
      setMilestone(rewards.milestone ?? null);
    }
  }, [rewards]);

  const refreshRewards = useCallback(async () => {
    try {
      const response = await apiClient.get("/vouchers/summary", {
        headers: { "Cache-Control": "no-cache" },
      });
      const summary = response.data?.data ?? response.data ?? null;
      if (summary) {
        setAvailable(summary.available ?? []);
        setHistory(summary.history ?? []);
        setMilestone(summary.milestone ?? null);
      }
    } catch (error) {
      console.error("refreshRewards failed:", error);
    }
  }, []);

  const handleRedeem = useCallback(
    async (voucher) => {
      if (!voucher || redeeming) return;
      setRedeemError(null);
      setRedeeming(true);
      try {
        const response = await apiClient.post(
          `/vouchers/${voucher.id ?? voucher.slug}/redeem`
        );
        const redemption = response.data?.data ?? response.data ?? null;
        await refreshRewards();
        const successPayload = {
          ...(voucher ?? {}),
          ...(redemption ?? {}),
          name: redemption?.name ?? voucher?.name,
          image:
            voucher?.image ??
            redemption?.image ??
            redemption?.imageUrl ??
            voucher?.imageUrl,
        };
        setRedeemSuccess(successPayload);
        setSelectedVoucher(null);
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
    [redeeming, refreshRewards]
  );

  if (!rewards && !loading) {
    return (
      <div className="rounded-[28px] bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        Rewards belum tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RewardsMilestone
        milestone={milestone}
        onClaim={() => setRedeemSuccess(milestone)}
      />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Voucher tersedia
        </h3>
        <div className="space-y-3">
          {available.map((voucher) => (
            <RewardVoucherCard
              key={voucher.id}
              voucher={voucher}
              onRedeem={setSelectedVoucher}
            />
          ))}
        </div>
      </section>

      <RewardHistoryList history={history} />

      <RedeemDialog
        voucher={selectedVoucher}
        loading={redeeming}
        error={redeemError}
        onClose={() => {
          setRedeemError(null);
          setSelectedVoucher(null);
        }}
        onConfirm={handleRedeem}
      />

      <RedeemSuccessDialog
        voucher={redeemSuccess}
        onClose={() => setRedeemSuccess(null)}
      />
    </div>
  );
}

function RedeemDialog({ voucher, onClose, onConfirm, loading, error }) {
  if (!voucher) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-start gap-4 px-6 py-6">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden ">
            <img
              src={voucher.image ?? "/sample-voucher.jpg"}
              alt={voucher.name ?? "Voucher"}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-lg font-semibold text-gray-900">
              Voucher {voucher.name}
            </h4>
            <p className="text-sm text-gray-500">
              {voucher.description ?? "Voucher spesial untuk kamu"}
            </p>
            <p className="text-sm font-semibold text-[#F97316]">
              Poin dibutuhkan:{" "}
              {voucher.pointsRequired ?? voucher.points_required ?? 0} poin
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
            <ul className="mt-2 list-decimal space-y-1 pl-5 text-xs text-gray-600">
              <li>Voucher berlaku untuk semua produk {voucher.name}</li>
              <li>Minimal belanja Rp100.000</li>
              <li>Tidak dapat digabung promo lain</li>
              <li>Berlaku untuk 1x transaksi</li>
            </ul>
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

function RedeemSuccessDialog({ voucher, onClose }) {
  if (!voucher) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-start gap-4 px-6 py-6">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white overflow-hidden ">
            <img
              src={voucher.image ?? "/sample-voucher.jpg"}
              alt={voucher.name ?? "Voucher"}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="text-lg font-semibold text-gray-900">
              Voucher Berhasil ditukar!
            </h4>
            <p className="text-sm text-gray-500">Voucher {voucher.name}</p>
            {voucher.expiresAt && (
              <p className="text-xs font-semibold text-[#FEA800]">
                Berlaku sampai:{" "}
                {new Date(voucher.expiresAt).toLocaleDateString("id-ID", {
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
              {voucher.code ?? "Kode voucher disalurkan melalui email"}
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <p className="font-semibold text-[#475467]">Cara pakai voucher:</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Kunjungi toko resmi terkait</li>
              <li>Pilih produk yang kamu suka</li>
              <li>Masukkan kode voucher saat checkout</li>
              <li>Potongan langsung masuk!</li>
            </ol>
          </div>

          <button
            type="button"
            className="w-full rounded-full bg-[#4A2D8B] py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#3C2374]"
            onClick={onClose}
          >
            Belanja Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
