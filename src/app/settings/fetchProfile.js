import { cookies } from "next/headers";
import apiClient from "@/lib/apiClient";
import { normalizePhotos } from "@/lib/absoluteUrl";

export async function fetchProfile() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");

    console.log("[settings] Cookie header:", cookieHeader);

    const response = await apiClient.get("/auth/me", {
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        "Cache-Control": "no-cache",
      },
    });

    const payload = response.data ?? {};
    console.log("[settings] /auth/me raw payload:", payload);
    const data = payload?.data ?? payload ?? null;

    return normalizePhotos(data);
  } catch (error) {
    console.error("Failed to load profile data", error);
    return null;
  }
}
