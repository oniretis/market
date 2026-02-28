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
    console.log("Build environment detected, skipping bulk approve");
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

    // First verify which products actually exist
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, status: true }
    });

    if (existingProducts.length === 0) {
      return NextResponse.json(
        { error: "No valid products found to approve" },
        { status: 404 }
      );
    }

    const existingProductIds = existingProducts.map(p => p.id);
    const notFoundIds = productIds.filter(id => !existingProductIds.includes(id));

    // Filter to only pending products
    const pendingProducts = existingProducts.filter(p => p.status === "PENDING");
    const pendingIds = pendingProducts.map(p => p.id);

    let result = { count: 0 };
    if (pendingIds.length > 0) {
      result = await prisma.product.updateMany({
        where: {
          id: { in: pendingIds },
          status: "PENDING"
        },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedBy: admin.id,
        },
      });
    }

    // Log the activity with detailed information
    await logActivity(
      admin.id,
      "BULK_PRODUCT_APPROVED",
      `${result.count} products approved out of ${productIds.length} requested`,
      {
        productIds: pendingIds,
        count: result.count,
        totalRequested: productIds.length,
        notFoundIds,
        alreadyProcessed: existingProducts.filter(p => p.status !== "PENDING").map(p => ({ id: p.id, status: p.status }))
      }
    );

    return NextResponse.json({
      message: `${result.count} products approved successfully${notFoundIds.length > 0 ? ` (${notFoundIds.length} not found)` : ''}`,
      count: result.count,
      totalRequested: productIds.length,
      notFoundIds,
      alreadyProcessed: existingProducts.filter(p => p.status !== "PENDING").map(p => ({ id: p.id, name: p.name, status: p.status }))
    });
  } catch (error) {
    console.error("Bulk approve error:", error);
    return NextResponse.json(
      { error: "Failed to bulk approve products" },
      { status: 500 }
    );
  }
}
