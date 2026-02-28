import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET() {
  // Skip authentication during build/static generation but still fetch real data
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  try {
    if (!isBuildTime) {
      await requireAdmin();
    }

    console.log('Ads API: Fetching advertisements from database...');

    try {
      // First test if we can access the Advertisement model
      console.log('Testing Advertisement model access...');
      const modelExists = await (prisma as any).advertisement;
      if (!modelExists) {
        console.error('Advertisement model not found');
        return NextResponse.json({ ads: [] });
      }

      const ads = await (prisma as any).advertisement.findMany({
        orderBy: { position: "asc" },
        include: {
          User: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      console.log(`Found ${ads.length} advertisements`);
      return NextResponse.json({ ads });
    } catch (dbError: any) {
      console.error('Database error fetching ads:', dbError);
      console.error('Error details:', dbError?.message || 'Unknown error');
      console.error('Error code:', dbError?.code || 'Unknown code');
      // Return empty array if table doesn't exist or other DB error
      return NextResponse.json({ ads: [] });
    }
  } catch (error) {
    console.error("Error fetching ads:", error);

    // Handle specific authentication errors (only for runtime, not build time)
    if (!isBuildTime && error instanceof Error) {
      if (error.message.includes("Authentication required") || error.message.includes("Admin access required")) {
        console.log("Ads authentication failed:", error.message);
        return NextResponse.json(
          { error: "Authentication required. Please log in as an admin." },
          { status: 401 }
        );
      }
    }

    console.error("Error fetching ads:", error);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Skip authentication during build/static generation but still fetch real data
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  try {
    let user;
    if (!isBuildTime) {
      user = await requireAdmin();
    }

    const body = await request.json();
    const { title, imageUrl, videoUrl, linkUrl, description, isActive, position, startDate, endDate } = body;

    if (!title || (!imageUrl && !videoUrl)) {
      return NextResponse.json({ error: "Title and either image URL or video URL are required" }, { status: 400 });
    }

    const ad = await (prisma as any).advertisement.create({
      data: {
        title,
        imageUrl: imageUrl || "", // Provide empty string if no image
        videoUrl,
        linkUrl,
        description,
        isActive: isActive !== undefined ? isActive : true,
        position: position || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: user?.id,
      },
    });

    // Log activity
    if (user?.id) {
      await (prisma as any).activity.create({
        data: {
          action: "AD_CREATED",
          description: `Advertisement "${title}" created`,
          userId: user.id,
          metadata: { adId: ad.id },
        },
      });
    }

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error) {
    // Handle specific authentication errors (only for runtime, not build time)
    if (!isBuildTime && error instanceof Error) {
      if (error.message.includes("Authentication required") || error.message.includes("Admin access required")) {
        console.log("Ads creation authentication failed:", error.message);
        return NextResponse.json(
          { error: "Authentication required. Please log in as an admin." },
          { status: 401 }
        );
      }
    }

    console.error("Error creating ad:", error);
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
  }
}
