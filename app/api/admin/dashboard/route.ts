import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET() {
  // Skip authentication during build/static generation but still fetch real data
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  // During build time, return mock data to avoid database connection issues
  if (isBuildTime) {
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

  try {
    await requireAdmin();

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

    // Use Prisma's transaction for better performance and consistency
    const [
      totalUsers,
      totalProducts,
      pendingProducts,
      approvedProducts,
      rejectedProducts,
      totalReviews,
      pendingReviews,
      productStats,
      recentActivity
    ] = await Promise.all([
      // Basic counts
      prisma.user.count(),
      prisma.product.count(),
      prisma.product.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "APPROVED" } }),
      prisma.product.count({ where: { status: "REJECTED" } }),
      prisma.review.count(),
      prisma.review.count({ where: { isApproved: false } }),

      // Aggregate queries for performance
      prisma.product.aggregate({
        _sum: { price: true },
        _count: { isSold: true },
        where: { isSold: true }
      }),

      // Recent activity with limited fields
      prisma.activity.findMany({
        select: {
          id: true,
          action: true,
          description: true,
          createdAt: true,
          User: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    ]);

    // Calculate values from aggregated data
    const totalRevenue = productStats._sum.price || 0;
    const soldProducts = productStats._count.isSold;

    // Get monthly growth data in parallel
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
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.product.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
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

    const response = NextResponse.json({
      stats,
      recentActivity,
    });

    // Add caching headers for better performance
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
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
