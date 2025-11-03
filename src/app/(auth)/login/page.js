"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const SEEN_KEY = "herbit_onboarding_v1";
const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleBack = () => {
    localStorage.removeItem(SEEN_KEY);
    router.replace("/");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        let msg = "Login gagal";
        if (ct.includes("application/json")) {
          const data = await res.json().catch(() => ({}));
          msg =
            data?.message ||
            data?.error?.details ||
            (res.status === 401
              ? "Email atau password salah"
              : res.status === 422
              ? "Input tidak valid."
              : `Login gagal (HTTP ${res.status})`);
        }
        console.log("[LOGIN] failed:", res.status, msg);
        throw new Error(msg);
      }

      console.log("[LOGIN] success");
      localStorage.setItem("herbit_onboarding_v1", "1");

      router.replace("/");
    } catch (e) {
      console.log("[LOGIN] error:", e?.message);
      setErr(e.message || "Login gagal. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm">
        {/* Back to splash */}
        <button
          onClick={handleBack}
          className="relative flex items-center justify-center w-12 h-12 rounded-full
                     bg-[#FFD369] border-2 border-[#FDBE45]
                     shadow-[0_0_0_4px_rgba(253,190,69,0.6)]
                     hover:bg-[#ffc632] transition mb-3"
        >
          <ChevronLeft size={18} className="text-black" />
        </button>

        <h1 className="text-2xl font-semibold mb-2">Log in</h1>
        <p className="text-sm text-gray-500 mb-6">
          Dengan login kamu setuju pada{" "}
          <span className="font-medium">Terms of Use</span> dan{" "}
          <span className="font-medium">Privacy Policy</span> kami.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="text-sm text-black" htmlFor="email">
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

          <label className="text-sm text-black" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              className="w-full rounded-lg bg-[#FFF3DA] p-4 text-sm outline-none mt-1 pr-12"
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
          {/* Error feedback */}
          {err && (
            <p className="text-sm text-red-600 mt-1" aria-live="polite">
              {err}
            </p>
          )}

          <div className="text-right text-sm text-gray-500">
            <a href="/forgot-password" className="hover:underline">
              Lupa password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#FFD369] font-medium hover:bg-[#ffc632]
                       disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-center mt-2">
          Belum punya akun?{" "}
          <a
            href="/register"
            className="font-medium text-[#FDBE45] hover:underline"
          >
            Register
          </a>
        </p>
      </div>
    </main>
  );
}
