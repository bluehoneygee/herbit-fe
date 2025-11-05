"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  function handleBack() {
    router.replace("/login");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    if (!email.trim()) {
      setErr("Email wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json().catch(() => ({}))
        : null;

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error?.details ||
          (res.status === 404
            ? "Email tidak terdaftar."
            : `Gagal mengirim permintaan (HTTP ${res.status})`);
        throw new Error(msg);
      }

      setOkMsg("Permintaan reset berhasil dikirim. Cek email kamu ya!");
    } catch (e) {
      setErr(e.message || "Gagal mengirim permintaan. Coba lagi ya.");
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

        <h1 className="text-2xl font-semibold mb-2">Lupa Password?</h1>
        <p className="text-sm text-gray-500 mb-6">
          Kami tidak akan pernah membagikan email Anda ke pihak lain.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="text-sm text-black">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Your email"
              className="w-full rounded-lg bg-[#FFF3DA] p-4 text-sm outline-none mt-1 mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {okMsg && <p className="text-sm text-green-600">{okMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#FFD369] font-medium
                       hover:bg-[#ffc632] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Mengirim..." : "Kirim Permintaan"}
          </button>
        </form>
      </div>
    </main>
  );
}
