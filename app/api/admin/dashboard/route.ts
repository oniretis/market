import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET() {
  // Skip authentication during build/static generation but still fetch real data
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  try {
    if (!isBuildTime) {
      await requireAdmin();
    }

    console.log('Dashboard API: Fetching data from database...');

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Dashboard API: Database connection verified');
    } catch (dbError) {
      console.error('Dashboard API: Database connection failed:', dbError);
      return NextResponse.json(
        { error: "Database connection failed. Please check your database configuration." },
        { status: 503 }
      );
    }

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

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      currentMonthUsers,
      previousMonthUsers,
      currentMonthProducts,
      previousMonthProducts,
      currentMonthRevenue
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.product.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.product.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.product.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: "APPROVED"
        },
        _sum: { price: true }
      })
    ]);

    // Calculate growth percentages
    const userGrowth = previousMonthUsers > 0
      ? Math.round(((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100)
      : currentMonthUsers > 0 ? 100 : 0;

    const productGrowth = previousMonthProducts > 0
      ? Math.round(((currentMonthProducts - previousMonthProducts) / previousMonthProducts) * 100)
      : currentMonthProducts > 0 ? 100 : 0;

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
        users: userGrowth,
        products: productGrowth,
        revenue: currentMonthRevenue._sum.price || 0,
      },
    };

    return NextResponse.json({
      stats,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    // Handle specific authentication errors (only for runtime, not build time)
    if (!isBuildTime && error instanceof Error) {
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
