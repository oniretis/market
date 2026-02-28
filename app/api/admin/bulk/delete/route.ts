import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import { logActivity } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function POST(request: Request) {
  // Skip authentication during build/static generation
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  // During build time, return empty response to avoid database connection issues
  if (isBuildTime) {
    console.log("Build environment detected, skipping bulk delete");
    return NextResponse.json({ message: "Build time - operation skipped" });
  }
  try {
    const admin = await requireAdmin();
    const { productIds } = await request.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid product IDs" },
        { status: 400 }
      );
    }

    // First verify all products exist and get their details for logging
    const productsToDelete = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, userId: true }
    });

    if (productsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No valid products found to delete" },
        { status: 404 }
      );
    }

    // Perform the bulk deletion
    const result = await prisma.product.deleteMany({
      where: { id: { in: productIds } },
    });

    // Log the activity with detailed information
    await logActivity(
      admin.id,
      "BULK_PRODUCT_DELETED",
      `${result.count} products were bulk deleted`,
      {
        productIds: productsToDelete.map(p => p.id),
        productNames: productsToDelete.map(p => p.name),
        count: result.count,
        deletedBy: admin.id
      }
    );

    return NextResponse.json({
      message: `${result.count} products deleted successfully`,
      count: result.count,
      totalRequested: productIds.length,
      deletedProducts: productsToDelete.map(p => ({ id: p.id, name: p.name }))
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Failed to bulk delete products" },
      { status: 500 }
    );
  }
}
