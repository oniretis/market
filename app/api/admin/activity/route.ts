import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";

export async function GET() {
  try {
    await requireAdmin();

    // For now, return empty array since Activity model isn't in the schema yet
    // In the future, this will fetch from the Activity model
    const activities: any[] = [];

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
