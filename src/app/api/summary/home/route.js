import { NextResponse } from "next/server";
import { buildHomeSummaryResponse, loadMockData } from "@/lib/mockSummary";

export async function GET() {
  try {
    const db = await loadMockData();
    const summary = buildHomeSummaryResponse(db);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to load summary home data", error);
    return NextResponse.json(
      { error: "Unable to load summary data" },
      { status: 500 }
    );
  }
}
