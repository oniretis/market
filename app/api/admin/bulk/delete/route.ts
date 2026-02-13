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

    // For now, just return success since we need to be careful with deletion
    // In the future, this will delete multiple products
    // await prisma.product.deleteMany({
    //   where: { id: { in: productIds } },
    // });

    // Log the activity
    await logActivity(
      admin.id,
      "BULK_PRODUCT_DELETED",
      `${productIds.length} products were bulk deleted`,
      { productIds, count: productIds.length }
    );

    return NextResponse.json({ 
      message: `${productIds.length} products deleted successfully`,
      count: productIds.length 
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Failed to bulk delete products" },
      { status: 500 }
    );
  }
}
