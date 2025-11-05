"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import apiClient from "@/lib/apiClient";
import { normalizePhotos } from "@/lib/absoluteUrl";

const CHECK_DELAY = 700;

function StatusIcon({ status }) {
  if (status === "checking") {
    return (
      <svg
        className="h-4 w-4 animate-spin text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          d="M4 12a8 8 0 0 1 8-8"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const success = status === "available";
  const showError =
    status === "taken" || status === "error" || status === "invalid";
  if (!success && !showError) {
    return null;
  }

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

function normalize(input) {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
}

export default function UsernameClient({
  currentUsername: initialUsername = "",
}) {
  const router = useRouter();
  const initialNormalized = normalize(initialUsername);
  const [currentUsername, setCurrentUsername] = useState(initialNormalized);
  const [username, setUsername] = useState(initialNormalized);
  const trimmed = username.trim();
  const isValid =
    trimmed.length > 1 && !trimmed.includes(" ") && !trimmed.includes("@");
  const [availabilityStatus, setAvailabilityStatus] = useState("idle");
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingUsername, setLoadingUsername] = useState(!initialUsername);

  useEffect(() => {
    const normalized = normalize(initialUsername);
    setCurrentUsername(normalized);
    setUsername(normalized);
    if (initialUsername) setLoadingUsername(false);
  }, [initialUsername]);

  useEffect(() => {
    if (initialUsername) return;

    let active = true;
    setLoadingUsername(true);

    (async () => {
      try {
        const response = await apiClient.get("/auth/me", {
          headers: { "Cache-Control": "no-cache" },
        });
        const payload = response.data ?? {};
        const data = normalizePhotos(payload?.data ?? payload ?? {});
        if (!active) return;
        const normalized = normalize(data?.username ?? "");
        console.log("[settings/username] fetched username:", normalized);
        setCurrentUsername(normalized);
        setUsername(normalized);
      } catch (error) {
        if (!active) return;
        console.error("[settings/username] failed to load username:", error);
      } finally {
        if (active) setLoadingUsername(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [initialUsername]);

  const isUnchanged = useMemo(() => {
    if (!currentUsername) return false;
    return normalize(trimmed) === currentUsername;
  }, [currentUsername, trimmed]);

  useEffect(() => {
    if (!trimmed) {
      setAvailabilityStatus("idle");
      setAvailabilityMessage("");
      setDebouncedUsername("");
      return;
    }

    if (!isValid) {
      setAvailabilityStatus("invalid");
      setAvailabilityMessage(
        "Username tidak valid. Gunakan huruf, angka, atau underscore tanpa spasi."
      );
      setDebouncedUsername("");
      return;
    }

    setAvailabilityStatus("typing");
    setAvailabilityMessage("");

    const handler = setTimeout(() => {
      setDebouncedUsername(trimmed);
    }, CHECK_DELAY);

    return () => clearTimeout(handler);
  }, [isValid, trimmed]);

  const handleBack = useCallback(() => router.back(), [router]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (isSaving || isUnchanged) return;
      if (!isValid || availabilityStatus === "invalid") {
        setAvailabilityStatus("invalid");
        setAvailabilityMessage("Periksa kembali username kamu.");
        return;
      }
      if (availabilityStatus === "taken") {
        setAvailabilityMessage("Username sudah digunakan. Pilih yang lain.");
        return;
      }

      const nextUsernameClean = normalize(trimmed);
      const nextUsername = `@${nextUsernameClean}`;

      try {
        setIsSaving(true);
        await apiClient.patch(
          "/users/username",
          { username: nextUsername },
          { headers: { "Content-Type": "application/json" } }
        );

        setCurrentUsername(nextUsernameClean);
        setUsername(nextUsernameClean);
        setAvailabilityStatus("available");
        setAvailabilityMessage("Username berhasil diperbarui.");
        router.refresh();
        router.push("/");
      } catch (error) {
        let message =
          "Terjadi kesalahan saat memperbarui username.";
        if (axios.isAxiosError(error)) {
          const payload = error.response?.data ?? {};
          message =
            payload?.message ||
            payload?.error ||
            payload?.details ||
            error.message ||
            message;
        } else if (error instanceof Error && error.message) {
          message = error.message;
        }
        setAvailabilityStatus("error");
        setAvailabilityMessage(message);
      } finally {
        setIsSaving(false);
      }
    },
    [availabilityStatus, isSaving, isUnchanged, isValid, router, trimmed]
  );

  useEffect(() => {
    if (!debouncedUsername) {
      return;
    }

    const nextUsername = `@${debouncedUsername}`;
    if (
      currentUsername &&
      nextUsername.toLowerCase() === `@${currentUsername}`.toLowerCase()
    ) {
      setAvailabilityStatus("unchanged");
      setAvailabilityMessage("Username sama seperti yang sekarang.");
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    setAvailabilityStatus("checking");
    setAvailabilityMessage("");

    (async () => {
      try {
        const response = await apiClient.get(
          "/profile/username-availability",
          {
            params: { username: nextUsername },
            signal: controller.signal,
          }
        );

        if (!isActive) return;

        const result = response.data ?? {};
        const available = Boolean(result?.available);
        setAvailabilityStatus(available ? "available" : "taken");
        setAvailabilityMessage(
          available
            ? "Username tersedia."
            : result?.message ?? "Username sudah digunakan."
        );
      } catch (error) {
        if (
          !isActive ||
          controller.signal.aborted ||
          axios.isCancel?.(error)
        ) {
          return;
        }
        setAvailabilityStatus("error");
        setAvailabilityMessage(
          "Tidak dapat memeriksa ketersediaan. Coba lagi."
        );
      }
    })();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [currentUsername, debouncedUsername]);

  const requestSuggestions = useCallback(async (seed) => {
    const normalizedSeed = normalize(seed);
    if (!normalizedSeed) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await apiClient.get(
        "/profile/username-suggestions",
        {
          params: { seed: normalizedSeed },
        }
      );
      const payload = response.data ?? {};
      const incoming = Array.isArray(payload?.suggestions)
        ? payload.suggestions
        : [];
      setSuggestions(incoming.map((item) => item.replace(/^@+/, "")));
    } catch (error) {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    requestSuggestions(currentUsername);
  }, [currentUsername, requestSuggestions]);

  const currentUsernameWithAt = currentUsername ? `@${currentUsername}` : "";

  return (
    <main className="min-h-screen bg-white text-[#0A0A19]">
      <form className="flex min-h-screen flex-col" onSubmit={handleSubmit}>
        <header
          className="px-4 border-gray-200"
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
            <span className="text-base font-semibold">Perbarui username</span>
            <button
              type="submit"
              disabled={isSaving || isUnchanged}
              className={`text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA1F2]/40 ${
                isSaving || isUnchanged
                  ? "cursor-not-allowed text-gray-400 opacity-70"
                  : "text-[#4A2D8B]"
              }`}
            >
              {isSaving ? "Menyimpan..." : "Selesai"}
            </button>
          </div>
        </header>

        <section className="flex-1 px-4 pb-10">
          <div className="py-6">
            <p className="text-sm font-semibold text-gray-900">Saat ini</p>
            <div className="mt-2 min-h-[24px]">
              {loadingUsername ? (
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
              ) : (
                <p className="text-base font-medium text-gray-600">
                  {currentUsernameWithAt || "Belum diatur"}
                </p>
              )}
            </div>
          </div>

          <div className="py-6">
            <p className="text-sm font-semibold text-gray-900">Baru</p>
            <label
              className={`mt-4 flex items-center gap-2 border-b pb-2 text-base transition focus-within:border-[#34A853] ${
                trimmed.length > 1 ? "border-[#34A853]" : "border-gray-200"
              }`}
            >
              <span className="text-base font-medium text-gray-400">@</span>
              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value.replace(/^@+/, ""))
                }
                className="flex-1 bg-transparent text-[#0A0A19] placeholder:text-gray-400 focus:outline-none"
                placeholder="username"
              />
              {trimmed.length > 1 && <StatusIcon status={availabilityStatus} />}
            </label>
            {!isValid && trimmed.length > 1 && (
              <p className="mt-3 text-sm text-[#F87171]">
                Username tidak valid. Gunakan huruf, angka, atau underscore
                tanpa spasi.
              </p>
            )}
            {availabilityMessage &&
              (availabilityStatus === "available" ? (
                <p className="mt-2 text-sm text-[#16A34A]">
                  {availabilityMessage}
                </p>
              ) : availabilityStatus === "taken" ||
                availabilityStatus === "error" ? (
                <p className="mt-2 text-sm text-[#F87171]">
                  {availabilityMessage}
                </p>
              ) : (
                availabilityStatus === "unchanged" && (
                  <p className="mt-2 text-sm text-gray-500">
                    {availabilityMessage}
                  </p>
                )
              ))}
          </div>

          <div className="py-6">
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="text-gray-500">Saran:</span>
              {loadingUsername ? (
                [1, 2, 3].map((id) => (
                  <span
                    key={`username-skeleton-${id}`}
                    className="h-5 w-20 rounded-full bg-gray-200 animate-pulse"
                  />
                ))
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setUsername(suggestion.replace(/^@+/, ""))}
                    className="text-[#4A2D8B] transition hover:underline"
                  >
                    @{suggestion}
                    {index < suggestions.length - 1 ? "," : ""}
                  </button>
                ))
              ) : (
                <span className="text-gray-400">
                  Saran belum tersedia. Coba ketik username yang kamu inginkan.
                </span>
              )}
            </div>
          </div>
        </section>
      </form>
    </main>
  );
}
