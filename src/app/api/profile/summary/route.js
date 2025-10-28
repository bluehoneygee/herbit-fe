import { NextResponse } from "next/server";
import { buildProfileSummary, loadMockData } from "@/lib/mockSummary";
import apiClient from "@/lib/apiClient";

const API_BASE_URL = apiClient?.defaults?.baseURL ?? "";

export async function GET(request) {
  try {
    const username = request.nextUrl.searchParams.get("username") ?? undefined;

    if (API_BASE_URL) {
      try {
        const endpoint = username
          ? `/users/${encodeURIComponent(username)}/profile-summary`
          : "/users/profile-summary";
        const response = await apiClient.get(endpoint, {
          headers: { "Cache-Control": "no-cache" },
        });
        const summary = response.data?.data ?? response.data ?? null;
        if (summary) {
          return NextResponse.json(summary);
        }
      } catch (remoteError) {
        console.error("Remote profile summary fetch failed:", remoteError);
      }
    }

    const db = await loadMockData();
    const summary = await buildProfileSummary(db, username);

    if (!summary) {
      return NextResponse.json({ error: "profile_summary not found" }, { status: 404 });
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to load profile summary", error);
    return NextResponse.json(
      { error: "Unable to load profile summary" },
      { status: 500 }
    );
  }
}
