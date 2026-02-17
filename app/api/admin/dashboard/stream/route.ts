import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET() {
  // Skip authentication during build/static generation
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  // During build time, return a simple response instead of streaming
  if (isBuildTime) {
    return new Response('data: {"build": true}\n\n', {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  try {
    await requireAdmin();

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Send initial data
        const sendInitialData = async () => {
          try {
            const data = await getDashboardData();
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          } catch (error) {
            console.error('Error sending initial dashboard data:', error);
            controller.enqueue(`data: ${JSON.stringify({ error: 'Failed to fetch data' })}\n\n`);
          }
        };

        sendInitialData();

        // Set up periodic updates every 30 seconds
        const interval = setInterval(async () => {
          try {
            const data = await getDashboardData();
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          } catch (error) {
            console.error('Error sending dashboard update:', error);
            controller.enqueue(`data: ${JSON.stringify({ error: 'Failed to fetch data' })}\n\n`);
          }
        }, 30000);

        // Clean up on client disconnect
        controller.close = () => {
          clearInterval(interval);
        };
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error("Dashboard SSE error:", error);

    if (!isBuildTime && error instanceof Error) {
      if (error.message.includes("Authentication required") || error.message.includes("Admin access required")) {
        return NextResponse.json(
          { error: "Authentication required. Please log in as an admin." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to establish real-time connection" },
      { status: 500 }
    );
  }
}

async function getDashboardData() {
  // During build time, return mock data to avoid database connection issues
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  if (isBuildTime) {
    return {
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
      timestamp: new Date().toISOString(),
    };
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

  return {
    stats,
    recentActivity,
    timestamp: new Date().toISOString(),
  };
}
