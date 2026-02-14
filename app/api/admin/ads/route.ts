import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    await requireAdmin();

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

    return NextResponse.json({ ads });
  } catch (error) {
    // Handle build environment gracefully
    if (error instanceof Error && error.message.includes("Build environment")) {
      return NextResponse.json({ ads: [] });
    }

    console.error("Error fetching ads:", error);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const { title, imageUrl, linkUrl, description, isActive, position, startDate, endDate } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and image URL are required" }, { status: 400 });
    }

    const ad = await (prisma as any).advertisement.create({
      data: {
        title,
        imageUrl,
        linkUrl,
        description,
        isActive: isActive !== undefined ? isActive : true,
        position: position || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: user.id,
      },
    });

    // Log activity
    await (prisma as any).activity.create({
      data: {
        action: "AD_CREATED",
        description: `Advertisement "${title}" created`,
        userId: user.id,
        metadata: { adId: ad.id },
      },
    });

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error) {
    // Handle build environment gracefully
    if (error instanceof Error && error.message.includes("Build environment")) {
      return NextResponse.json({ error: "Cannot create ads during build" }, { status: 400 });
    }

    console.error("Error creating ad:", error);
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
  }
}
