import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "src", "mock", "db.json");

async function readMockDb() {
  const file = await fs.readFile(DB_FILE_PATH, "utf8");
  return JSON.parse(file);
}

export async function GET() {
  try {
    const db = await readMockDb();
    const summary = db.profile_summary;

    if (!summary) {
      return NextResponse.json(
        { error: "profile_summary not found" },
        { status: 404 }
      );
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
