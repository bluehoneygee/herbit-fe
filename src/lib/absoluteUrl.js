import apiClient from "@/lib/apiClient";

const rawBase = apiClient?.defaults?.baseURL || "";
let baseOrigin = "";
try {
  baseOrigin = new URL(rawBase).origin;
} catch (error) {
  baseOrigin = rawBase.replace(/\/+$/, "");
}

export function toAbsoluteUrl(url) {
  if (!url || typeof url !== "string") return url ?? null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (!baseOrigin) return url.startsWith("/") ? url : `/${url}`;
  const suffix = url.startsWith("/") ? url : `/${url}`;
  return `${baseOrigin}${suffix}`;
}

export function normalizePhotos(data) {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((item) => normalizePhotos(item));
  }
  if (typeof data === "object") {
    if (data.photoUrl) data.photoUrl = toAbsoluteUrl(data.photoUrl);
    if (data.photo_url) data.photo_url = toAbsoluteUrl(data.photo_url);
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (value && typeof value === "object") {
        data[key] = normalizePhotos(value);
      }
    }
  }
  return data;
}

export default toAbsoluteUrl;
