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
    const { role } = await request.json();

    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Log the activity
    await logActivity(
      admin.id,
      "ROLE_CHANGED",
      `User ${userId} role was changed to ${role}`,
      { userId, newRole: role }
    );

    return NextResponse.json({
      message: "User role changed successfully",
      userId,
      role
    });
  } catch (error) {
    console.error("User role change error:", error);
    return NextResponse.json(
      { error: "Failed to change user role" },
      { status: 500 }
    );
  }
}
