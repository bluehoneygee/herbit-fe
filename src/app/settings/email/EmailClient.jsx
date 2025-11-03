"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEBOUNCE_DELAY = 500;

function StatusIcon({ success }) {
  if (typeof success !== "boolean") return null;

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {success ? (
        <path
          d="M20 6 9 17l-5-5"
          stroke="#16A34A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="m15 9-6 6m0-6 6 6"
          stroke="#F87171"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default function EmailClient({ currentEmail: initialEmail = "" }) {
  const router = useRouter();
  const [savedEmail, setSavedEmail] = useState(initialEmail);
  const [email, setEmail] = useState("");
  const trimmed = email.trim();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");

  const isValidEmail = useMemo(() => {
    if (!trimmed) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }, [trimmed]);

  const isUnchanged = useMemo(() => {
    if (!savedEmail) return false;
    return debouncedEmail.toLowerCase() === savedEmail.toLowerCase();
  }, [debouncedEmail, savedEmail]);

  useEffect(() => {
    if (!trimmed) {
      setDebouncedEmail("");
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedEmail(trimmed);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [trimmed]);

  const handleBack = useCallback(() => router.back(), [router]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (isSaving || !isValidEmail || isUnchanged) return;

      const nextEmail = trimmed.toLowerCase();

      try {
        setIsSaving(true);
        setMessage("");
        const response = await fetch("/api/users/email", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: nextEmail }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const errorMessage =
            data?.message ||
            data?.error ||
            "Gagal memperbarui email. Coba lagi.";
          throw new Error(errorMessage);
        }

        setSavedEmail(nextEmail);
        setEmail("");
        setMessage("Email berhasil diperbarui.");
        router.refresh();
        router.push("/");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memperbarui email.";
        setMessage(errorMessage);
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, isUnchanged, isValidEmail, trimmed, router]
  );

  const currentEmailLabel = savedEmail || "Belum diatur";
  const showStatusIcon = trimmed.length > 0 && !isUnchanged;
  const statusIconSuccess = showStatusIcon ? isValidEmail : undefined;

  return (
    <main className="min-h-screen bg-white text-[#0A0A19]">
      <form className="flex min-h-screen flex-col" onSubmit={handleSubmit}>
        <header
          className="px-4  border-gray-200"
          style={{ paddingTop: "calc(24px + env(safe-area-inset-top))" }}
        >
          <div className="flex min-h-12 items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm font-semibold text-gray-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]/40"
            >
              Batal
            </button>
            <span className="text-base font-semibold">Perbarui email</span>
            <button
              type="submit"
              disabled={isSaving || !isValidEmail || isUnchanged}
              className={`text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA1F2]/40 ${
                isSaving || !isValidEmail || isUnchanged
                  ? "cursor-not-allowed text-gray-400 opacity-70"
                  : "text-[#FEA800]"
              }`}
            >
              {isSaving ? "Menyimpan..." : "Selesai"}
            </button>
          </div>
        </header>

        <section className="flex-1 px-4 pb-10">
          <div className="border-b border-gray-200 py-6">
            <p className="text-sm font-semibold text-gray-900">Saat ini</p>
            <p className="mt-2 text-base font-medium text-gray-600">
              {currentEmailLabel}
            </p>
          </div>

          <div className="py-6">
            <p className="text-sm font-semibold text-gray-900">Baru</p>
            <label
              className={`mt-4 flex items-center gap-2 border-b pb-2 text-base transition focus-within:border-[#34A853] ${
                trimmed.length > 0 ? "border-[#34A853]" : "border-gray-200"
              }`}
            >
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="flex-1 bg-transparent text-[#0A0A19] placeholder:text-gray-400 focus:outline-none"
                placeholder="emailkamu@email.com"
              />
              {showStatusIcon && <StatusIcon success={statusIconSuccess} />}
            </label>
            {debouncedEmail.length > 0 ? (
              !isValidEmail ? (
                <p className="mt-3 text-sm text-[#F87171]">
                  Email tidak valid. Pastikan formatnya benar, contohnya
                  nama@domain.com.
                </p>
              ) : isUnchanged ? (
                <p className="mt-3 text-sm text-gray-500">
                  Email sama seperti yang sekarang.
                </p>
              ) : message ? (
                <p
                  className={`mt-3 text-sm ${
                    message.includes("berhasil")
                      ? "text-[#16A34A]"
                      : "text-[#F87171]"
                  }`}
                >
                  {message}
                </p>
              ) : null
            ) : message ? (
              <p
                className={`mt-3 text-sm ${
                  message.includes("berhasil")
                    ? "text-[#16A34A]"
                    : "text-[#F87171]"
                }`}
              >
                {message}
              </p>
            ) : null}
          </div>
        </section>
      </form>
    </main>
  );
}
