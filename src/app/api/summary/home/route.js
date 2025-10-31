import { NextResponse } from "next/server";
import apiClient from "@/lib/apiClient";

export async function GET(request) {
  try {
    const endpoint = "/users/home-summary";
    const cookieHeader = request.headers.get("cookie") ?? undefined;
    const response = await apiClient.get(endpoint, {
      headers: {
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        "Cache-Control": "no-cache",
      },
    });

    const summary = response.data?.data ?? response.data ?? null;
    if (!summary) {
      return NextResponse.json(
        { error: "Home summary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to load summary home data", error);
    const status = error?.response?.status ?? 500;
    const message =
      error?.response?.data?.error ?? "Unable to load summary data";
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
