import { NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";

export async function GET(request) {
  const url = new URL(request.url);
  const seed = url.searchParams.get("seed") ?? "";

  if (!seed) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const cookieHeader = request.headers.get("cookie") ?? undefined;
    const response = await apiClient.get("/users/username-suggestions", {
      params: { seed },
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        "Cache-Control": "no-cache",
      },
    });

    const payload = response.data?.data ?? response.data ?? null;
    const suggestions = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.suggestions)
      ? payload.suggestions
      : [];

    return NextResponse.json({ suggestions });
  } catch (error) {
    const status = error?.response?.status ?? 500;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Tidak dapat mengambil saran username.";

    return NextResponse.json(
      { suggestions: [], error: message },
      { status }
    );
  }
}
