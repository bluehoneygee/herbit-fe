"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import getFallbackAvatar from "@/lib/avatarFallback";
import { normalizePhotos, toAbsoluteUrl } from "@/lib/absoluteUrl";

const rawBase = apiClient?.defaults?.baseURL || "";
const apiBase = rawBase.replace(/\/+$/, "");

export default function PhotoClient({ user }) {
  const router = useRouter();

  const [profileData, setProfileData] = useState(() => user ?? null);
  const [loadingProfile, setLoadingProfile] = useState(!user);
  const isInitializing = loadingProfile && !profileData;

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setLoadingProfile(false);
      return;
    }

    let active = true;
    setLoadingProfile(true);

    (async () => {
      try {
        const response = await apiClient.get("/auth/me", {
          headers: { "Cache-Control": "no-cache" },
        });
        const payload = response.data ?? {};
        const data = normalizePhotos(payload?.data ?? payload ?? {});
        if (!active) return;
        setProfileData(data);
      } catch (error) {
        if (!active) return;
        console.error("[settings/photo] failed to fetch profile:", error);
      } finally {
        if (active) setLoadingProfile(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const displayName = useMemo(() => {
    const source =
      profileData?.displayName ??
      profileData?.name ??
      profileData?.username ??
      profileData?.email?.split("@")[0] ??
      "Teman Herbit";
    return source;
  }, [
    profileData?.displayName,
    profileData?.email,
    profileData?.name,
    profileData?.username,
  ]);

  const fallbackPhoto = useMemo(
    () => getFallbackAvatar(displayName, { size: "256" }),
    [displayName]
  );
  const initialPhoto = useMemo(
    () => toAbsoluteUrl(profileData?.photoUrl || profileData?.photo_url || ""),
    [profileData?.photoUrl, profileData?.photo_url]
  );
  const initials = useMemo(() => {
    const cleaned = displayName.replace(/[^a-zA-Z\s]/g, " ").trim();
    return (
      cleaned
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "TH"
    );
  }, [displayName]);

  const [currentPhoto, setCurrentPhoto] = useState("");
  const [preview, setPreview] = useState("");
  const [objectUrl, setObjectUrl] = useState(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (loadingProfile && !profileData) return;

    const nextPhoto = initialPhoto || (profileData ? fallbackPhoto : "");
    setCurrentPhoto(nextPhoto);
    setPreview(nextPhoto || "");
    setSelectedFile(null);
  }, [fallbackPhoto, initialPhoto, loadingProfile, profileData]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const hasChanges = useMemo(() => {
    if (selectedFile) return true;
    return preview !== currentPhoto;
  }, [currentPhoto, preview, selectedFile]);

  const handleBack = useCallback(() => router.back(), [router]);

  const handleFileChange = useCallback(
    (event) => {
      const selected = event.target.files?.[0];
      if (!selected) return;

      // Optional size/type validations (e.g., max 5MB)
      const MAX_SIZE = 3 * 1024 * 1024;
      if (selected.size > MAX_SIZE) {
        setMessage("Ukuran file terlalu besar (maksimal 3MB).");
        event.target.value = "";
        return;
      }

      if (!selected.type.startsWith("image/")) {
        setMessage("Format file tidak didukung.");
        event.target.value = "";
        return;
      }

      const url = URL.createObjectURL(selected);
      setPreview(url);
      setSelectedFile(selected);
      setMessage("");
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      setObjectUrl(url);
      event.target.value = "";
    },
    [objectUrl]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (isSaving || !hasChanges) return;
      if (!selectedFile) {
        setMessage("Pilih foto terlebih dahulu.");
        return;
      }

      try {
        setIsSaving(true);
        setMessage("");

        const formData = new FormData();
        formData.append("photo", selectedFile);

        const uploadEndpoint = apiBase
          ? `${apiBase}/users/profile-photo`
          : "/api/users/profile-photo";

        const response = await fetch(uploadEndpoint, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const errorMessage =
            payload?.message ||
            payload?.error ||
            "Gagal memperbarui foto. Coba lagi.";
          throw new Error(errorMessage);
        }

        const newPhoto = toAbsoluteUrl(
          payload?.photoUrl ??
            payload?.data?.photoUrl ??
            payload?.data?.photo_url ??
            null
        );

        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          setObjectUrl(null);
        }

        setSelectedFile(null);

        const finalPhoto = newPhoto ? toAbsoluteUrl(newPhoto) : currentPhoto;
        setCurrentPhoto(finalPhoto);
        setPreview(finalPhoto);

        setMessage("Foto profil berhasil diperbarui.");
        router.refresh();
        router.push("/");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memperbarui foto."
        );
      } finally {
        setIsSaving(false);
      }
    },
    [currentPhoto, hasChanges, isSaving, objectUrl, router, selectedFile]
  );

  const showPreviewSkeleton = loadingProfile && !preview;

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
            <span className="text-base font-semibold">Perbarui foto</span>
            <button
              type="submit"
              disabled={isSaving || !hasChanges || isInitializing}
              className={`text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1DA1F2]/40 ${
                isSaving || !hasChanges
                  ? "cursor-not-allowed text-gray-400 opacity-70"
                  : "text-[#4A2D8B]"
              }`}
            >
              {isSaving ? "Menyimpan..." : "Selesai"}
            </button>
          </div>
        </header>

        <section className="flex-1 px-4 pb-10">
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-4">
                <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full border border-black/10 shadow-sm bg-[#FEA800]">
                  {showPreviewSkeleton ? (
                    <div className="h-full w-full bg-[#FEA800] animate-pulse" />
                  ) : preview && preview !== fallbackPhoto ? (
                    <img
                      src={preview}
                      alt="Pratinjau foto baru"
                      className="h-full w-full object-cover"
                    />
                  ) : currentPhoto && currentPhoto !== fallbackPhoto ? (
                    <img
                      src={currentPhoto}
                      alt="Foto profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {initials}
                    </span>
                  )}
                </div>
                <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#4A2D8B] shadow-sm transition hover:border-[#4A2D8B]/40 hover:bg-[#F4ECFF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A2D8B]/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  Unggah dari perangkat
                </label>
                <p className="text-xs text-gray-500 text-center">
                  Format yang didukung: JPG, PNG, atau WEBP. Gunakan foto dengan
                  latar bersih agar tampil maksimal.
                </p>
              </div>
            </div>

            {message && (
              <p
                className={`text-sm ${
                  message.includes("berhasil")
                    ? "text-[#16A34A]"
                    : "text-[#F87171]"
                }`}
              >
                {message}
              </p>
            )}
            {isInitializing && !message && (
              <p className="text-sm text-gray-500">Memuat informasi profil…</p>
            )}
          </div>
        </section>
      </form>
    </main>
  );
}
