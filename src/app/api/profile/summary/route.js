import { NextResponse } from "next/server";
import { buildProfileSummary, loadMockData } from "@/lib/mockSummary";

export async function GET() {
  try {
    const db = await loadMockData();
    const summary = await buildProfileSummary(db);

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
