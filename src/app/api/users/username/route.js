import { NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";

export async function PATCH(request) {
  try {
    const body = await request.json();
    const username = body?.username;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { message: "Username wajib diisi." },
        { status: 400 }
      );
    }

    const cookieHeader = request.headers.get("cookie") ?? undefined;
    const response = await apiClient.patch(
      "/users/username",
      { username },
      {
        headers: {
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
          "Cache-Control": "no-cache",
        },
      }
    );

    const payload = response.data?.data ?? response.data ?? null;
    return NextResponse.json(payload ?? { success: true });
  } catch (error) {
    const status = error?.response?.status ?? 500;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Gagal memperbarui username.";

    return NextResponse.json({ message }, { status });
  }
}
