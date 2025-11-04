"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

export default function ResetPasswordClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = useMemo(() => sp.get("token") || "", [sp]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!token) return setErr("Token tidak valid atau kadaluarsa.");
    if (password.length < 6) return setErr("Password minimal 6 karakter.");
    if (password !== confirm) return setErr("Konfirmasi tidak cocok.");

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal reset password.");
      setOkMsg("Password berhasil direset. Mengalihkan ke login...");
      setTimeout(() => router.replace("/login"), 900);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        <button
          onClick={() => router.replace("/login")}
          className="mb-4 flex items-center justify-center w-12 h-12 rounded-full
                     bg-[#FFD369] border-2 border-[#FDBE45]
                     shadow-[0_0_0_4px_rgba(253,190,69,0.6)]
                     hover:bg-[#ffc632] transition"
        >
          <ChevronLeft size={18} className="text-black" />
        </button>

        <h1 className="text-2xl font-semibold mb-2">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan password baru untuk akunmu.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-black">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-lg bg-[#FFF3DA] p-4 text-sm outline-none mt-1 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password baru"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-black">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full rounded-lg bg-[#FFF3DA] p-4 text-sm outline-none mt-1 pr-12"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Konfirmasi password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {okMsg && <p className="text-sm text-green-600">{okMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#FFD369] font-medium
                       hover:bg-[#ffc632] disabled:opacity-60 transition"
          >
            {loading ? "Menyimpan..." : "Simpan Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
