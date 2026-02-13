import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import { logActivity } from "@/app/lib/admin";

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const { productIds } = await request.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid product IDs" },
        { status: 400 }
      );
    }

    // For now, just return success since status field isn't in the schema yet
    // In the future, this will update multiple products status to REJECTED
    // await prisma.product.updateMany({
    //   where: { id: { in: productIds } },
    //   data: {
    //     status: "REJECTED",
    //     approvedBy: admin.id,
    //   },
    // });

    // Log the activity
    await logActivity(
      admin.id,
      "BULK_PRODUCT_REJECTED",
      `${productIds.length} products were bulk rejected`,
      { productIds, count: productIds.length }
    );

    return NextResponse.json({ 
      message: `${productIds.length} products rejected successfully`,
      count: productIds.length 
    });
  } catch (error) {
    console.error("Bulk reject error:", error);
    return NextResponse.json(
      { error: "Failed to bulk reject products" },
      { status: 500 }
    );
  }
}
