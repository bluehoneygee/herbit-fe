"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const SEEN_KEY = "herbit_onboarding_v1";
const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const handleBack = () => {
    localStorage.removeItem(SEEN_KEY);
    router.replace("/login");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setOkMsg("");

    if (!email.trim() || !username.trim() || !password) {
      setErr("Semua field wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setErr("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setErr("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          password,
          confirm_password: confirm,
        }),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json().catch(() => ({}))
        : null;

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error?.details ||
          (res.status === 409
            ? "Email atau username sudah dipakai."
            : `Gagal register (HTTP ${res.status})`);
        throw new Error(msg);
      }

      setOkMsg("Registrasi berhasil! Mengalihkan ke halaman login…");
      setTimeout(() => router.replace("/login"), 700);
    } catch (e) {
      setErr(e.message || "Gagal register. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        {/* Tombol Back */}
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

        <h1 className="text-2xl font-semibold mb-2">Register</h1>
        <p className="text-sm text-gray-500 mb-6">
          Dengan mendaftar, kamu setuju pada{" "}
          <span className="font-medium">Terms of Use</span> dan{" "}
          <span className="font-medium">Privacy Policy</span> kami.
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
              className="w-full rounded-lg bg-[#FFF3DA] p-4 text-sm outline-none mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="text-sm text-black">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Your username"
              className="w-full rounded-lg bg-[#FFF3DA] p-4 text-sm outline-none mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm text-black">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              className="w-full rounded-lg bg-[#FFF3DA] p-4 text-sm outline-none mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div>
            <label htmlFor="confirm" className="text-sm text-black">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              placeholder="Confirm your password"
              className="w-full rounded-lg bg-[#FFF3DA] p-4 text-sm outline-none mt-1"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {okMsg && <p className="text-sm text-green-600">{okMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#FFD369] border-2 border-[#FDBE45] font-medium
                       hover:bg-[#ffc632] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Mendaftar…" : "Register"}
          </button>
        </form>
      </div>
    </main>
  );
}
