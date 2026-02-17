import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  // Skip authentication during build/static generation
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  // During build time, return empty data to avoid database connection issues
  if (isBuildTime) {
    console.log("Build environment detected, returning empty activities");
    return NextResponse.json({ activities: [] });
  }

  try {
    await requireAdmin();

    const activities = await prisma.activity.findMany({
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to last 100 activities
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Activity API error:", error);

    // Handle specific authentication errors
    if (error instanceof Error) {
      if (error.message.includes("Build environment")) {
        console.log("Build environment detected, returning empty activities");
        return NextResponse.json({ activities: [] });
      }

      if (error.message.includes("Authentication required") || error.message.includes("Admin access required")) {
        console.log("Activity authentication failed:", error.message);
        return NextResponse.json(
          { error: "Authentication required. Please log in as an admin." },
          { status: 401 }
        );
      }
    }

    console.error("Activity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
