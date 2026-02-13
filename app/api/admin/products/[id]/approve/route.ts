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
    const productId = params.id;

    // Update the product status to APPROVED
    await prisma.product.update({
      where: { id: productId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: admin.id,
      },
    });

    // Log the activity
    await logActivity(
      admin.id,
      "PRODUCT_APPROVED",
      `Product ${productId} was approved`,
      { productId }
    );

    return NextResponse.json({
      message: "Product approved successfully",
      productId
    });
  } catch (error) {
    console.error("Product approval error:", error);
    return NextResponse.json(
      { error: "Failed to approve product" },
      { status: 500 }
    );
  }
}
