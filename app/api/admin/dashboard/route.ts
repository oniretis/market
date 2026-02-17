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
      allProducts,
      pendingProducts,
      approvedProducts,
      rejectedProducts,
      totalReviews,
      pendingReviews
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.product.findMany(),
      prisma.product.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "APPROVED" } }),
      prisma.product.count({ where: { status: "REJECTED" } }),
      prisma.review.count(),
      prisma.review.count({ where: { isApproved: false } }),
    ]);

    // Calculate total revenue from all products (using price as placeholder)
    const totalRevenue = allProducts.reduce((sum, product) => sum + product.price, 0);
    const soldProducts = allProducts.filter(product => product.isSold).length;

    // Get monthly growth data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      monthlyUsers,
      monthlyProducts,
      monthlyRevenue
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.product.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.product.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: "APPROVED"
        },
        _sum: { price: true }
      })
    ]);

    // Get recent activity
    const recentActivity = await prisma.activity.findMany({
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const stats = {
      totalUsers,
      totalProducts,
      totalRevenue,
      pendingProducts,
      approvedProducts,
      rejectedProducts,
      soldProducts,
      totalReviews,
      pendingReviews,
      monthlyGrowth: {
        users: monthlyUsers,
        products: monthlyProducts,
        revenue: monthlyRevenue._sum.price || 0,
      },
    };

    return NextResponse.json({
      stats,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    // Handle specific authentication errors
    if (error instanceof Error) {
      if (error.message.includes("Build environment")) {
        console.log("Build environment detected, returning empty dashboard data");
        return NextResponse.json({
          stats: {
            totalUsers: 0,
            totalProducts: 0,
            totalRevenue: 0,
            pendingProducts: 0,
            approvedProducts: 0,
            rejectedProducts: 0,
            soldProducts: 0,
            totalReviews: 0,
            pendingReviews: 0,
            monthlyGrowth: {
              users: 0,
              products: 0,
              revenue: 0,
            },
          },
          recentActivity: [],
        });
      }

      if (error.message.includes("Authentication required") || error.message.includes("Admin access required")) {
        console.log("Dashboard authentication failed:", error.message);
        return NextResponse.json(
          { error: "Authentication required. Please log in as an admin." },
          { status: 401 }
        );
      }
    }

    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
