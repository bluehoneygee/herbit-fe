import { NextResponse } from "next/server";
import { buildProfileSummary, loadMockData } from "@/lib/mockSummary";

export async function GET(request) {
  try {
    const username = request.nextUrl.searchParams.get("username") ?? undefined;
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
