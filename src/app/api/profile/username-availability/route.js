import { NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";

export async function GET(request) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { available: false, message: "Parameter username wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const cookieHeader = request.headers.get("cookie") ?? undefined;
    const response = await apiClient.get("/profile/username-availability", {
      params: { username },
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        "Cache-Control": "no-cache",
      },
    });

    const data = response.data?.data ?? response.data ?? null;

    if (data && typeof data === "object") {
      return NextResponse.json(data);
    }

    return NextResponse.json({ available: false, message: "Data kosong." });
  } catch (error) {
    const status = error?.response?.status ?? 500;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Tidak dapat memeriksa ketersediaan username.";

    return NextResponse.json(
      {
        available: false,
        message,
      },
      { status }
    );
  }
}
