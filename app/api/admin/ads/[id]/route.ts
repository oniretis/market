import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin();
    const { id } = params;

    const body = await request.json();
    const { title, imageUrl, linkUrl, description, isActive, position, startDate, endDate } = body;

    const ad = await (prisma as any).advertisement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(linkUrl !== undefined && { linkUrl }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(position !== undefined && { position }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    // Log activity
    await (prisma as any).activity.create({
      data: {
        action: "AD_UPDATED",
        description: `Advertisement "${title || ad.title}" updated`,
        userId: user.id,
        metadata: { adId: ad.id },
      },
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin();
    const { id } = params;

    const ad = await (prisma as any).advertisement.findUnique({
      where: { id },
    });

    if (!ad) {
      return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
    }

    await (prisma as any).advertisement.delete({
      where: { id },
    });

    // Log activity
    await (prisma as any).activity.create({
      data: {
        action: "AD_DELETED",
        description: `Advertisement "${ad.title}" deleted`,
        userId: user.id,
        metadata: { adId: ad.id },
      },
    });

    return NextResponse.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 });
  }
}
