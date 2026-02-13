import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    // Get basic stats
    const [
      totalUsers,
      totalProducts,
      allProducts
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.product.findMany(),
    ]);

    // Calculate total revenue from all products (using price as placeholder)
    const totalRevenue = allProducts.reduce((sum, product) => sum + product.price, 0);
    const soldProducts = allProducts.length; // Placeholder count

    // Simplified stats for now (will be expanded after schema update)
    const stats = {
      totalUsers,
      totalProducts,
      totalRevenue,
      pendingProducts: 0, // Will be implemented after schema update
      approvedProducts: totalProducts, // Assuming all are approved for now
      rejectedProducts: 0, // Will be implemented after schema update
      soldProducts,
      totalReviews: 0, // Will be implemented after schema update
      pendingReviews: 0, // Will be implemented after schema update
      monthlyGrowth: {
        users: 12, // Placeholder
        products: 8, // Placeholder
        revenue: 15, // Placeholder
      },
    };

    const recentActivity: any[] = []; // Will be implemented after schema update

    return NextResponse.json({
      stats,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
