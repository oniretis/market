import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";
import { logActivity } from "@/app/lib/admin";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const userId = params.id;
    const { isActive } = await request.json();

    // Update user active status
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    // Log the activity
    await logActivity(
      admin.id,
      isActive ? "USER_UNBANNED" : "USER_BANNED",
      `User ${userId} was ${isActive ? "unbanned" : "banned"}`,
      { userId, isActive }
    );

    return NextResponse.json({
      message: `User ${isActive ? "unbanned" : "banned"} successfully`,
      userId,
      isActive
    });
  } catch (error) {
    console.error("User status toggle error:", error);
    return NextResponse.json(
      { error: "Failed to toggle user status" },
      { status: 500 }
    );
  }
}
