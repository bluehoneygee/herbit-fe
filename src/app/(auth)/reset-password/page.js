"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export default function ResetPasswordPage() {
  const router = useRouter();
  const q = useSearchParams();
  const token = useMemo(() => q.get("token") || "", [q]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) {
      setErr(
        "Token reset tidak ditemukan. Silakan ulangi proses lupa password."
      );
    }
  }, [token]);

  function handleBack() {
    router.replace("/login");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    if (!token) {
      setErr("Token reset tidak valid atau hilang.");
      return;
    }
    if (!password || password.length < 6) {
      setErr("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setErr("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json().catch(() => ({}))
        : null;

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error?.details ||
          (res.status === 400
            ? "Token tidak valid atau sudah kadaluarsa."
            : `Gagal reset (HTTP ${res.status})`);
        throw new Error(msg);
      }

      setOkMsg("Password berhasil direset. Mengalihkan ke halaman login…");
      setTimeout(() => router.replace("/login"), 900);
    } catch (e) {
      setErr(e.message || "Gagal reset password. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        {/* Back */}
        <button
          onClick={handleBack}
          className="relative flex items-center justify-center w-12 h-12 rounded-full
                     bg-[#FFD369] border-2 border-[#FDBE45]
                     shadow-[0_0_0_4px_rgba(253,190,69,0.6)]
                     hover:bg-[#ffc632] transition mb-3"
          aria-label="Kembali"
        >
          <ChevronLeft size={18} className="text-black" />
        </button>

        <h1 className="text-2xl font-semibold mb-2">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan password baru untuk akun Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="password" className="text-sm text-black">
              Password Baru
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                className="w-full rounded-lg bg-[#FFF3DA] p-4 text-sm outline-none mt-1"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="text-sm text-black">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                className="w-full rounded-lg bg-[#FFF3DA] p-4 text-sm outline-none mt-1"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {okMsg && <p className="text-sm text-green-600">{okMsg}</p>}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 rounded-lg bg-[#FFD369] font-medium
                       hover:bg-[#ffc632] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Menyimpan..." : "Simpan Password"}
          </button>
        </form>

        {!token && (
          <p className="text-xs text-gray-500 mt-3">
            Token tidak ditemukan. Silakan minta tautan baru dari halaman{" "}
            <a className="underline" href="/forgot-password">
              Lupa Password
            </a>
            .
          </p>
        )}
      </div>
    </main>
  );
}
