import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    const now = new Date();

    const ads = await (prisma as any).advertisement.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      orderBy: { position: "asc" },
      take: 5, // Limit to maximum 5 advertisements
      select: {
        id: true,
        title: true,
        imageUrl: true,
        linkUrl: true,
        description: true,
        position: true,
      },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Error fetching active ads:", error);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}
