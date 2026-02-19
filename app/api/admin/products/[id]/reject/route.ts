import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";
import { logActivity } from "@/app/lib/admin";
import { redirect } from "next/navigation";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const productId = params.id;

    // Update the product status to REJECTED
    await prisma.product.update({
      where: { id: productId },
      data: {
        status: "REJECTED",
        approvedBy: admin.id,
      },
    });

    // Log the activity
    await logActivity(
      admin.id,
      "PRODUCT_REJECTED",
      `Product ${productId} was rejected`,
      { productId }
    );

    // Redirect back to the admin product page
    redirect(`/admin/products/${productId}`);
  } catch (error) {
    console.error("Product rejection error:", error);
    return NextResponse.json(
      { error: "Failed to reject product" },
      { status: 500 }
    );
  }
}
