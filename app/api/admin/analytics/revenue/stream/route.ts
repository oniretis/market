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
        let isActive = true;

        // Send initial data
        const sendInitialData = async () => {
          if (!isActive) return;
          try {
            const data = await getRevenueData();
            if (isActive) {
              controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            }
          } catch (error) {
            console.error('Error sending initial revenue data:', error);
            if (isActive) {
              controller.enqueue(`data: ${JSON.stringify({ error: 'Failed to fetch data' })}\n\n`);
            }
          }
        };

        sendInitialData();

        // Set up periodic updates every 5 minutes for analytics (less frequent)
        const interval = setInterval(async () => {
          if (!isActive) {
            clearInterval(interval);
            return;
          }

          try {
            const data = await getRevenueData();
            if (isActive) {
              controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            }
          } catch (error) {
            console.error('Error sending revenue update:', error);
            if (isActive) {
              controller.enqueue(`data: ${JSON.stringify({ error: 'Failed to fetch data' })}\n\n`);
            }
          }
        }, 300000); // 5 minutes

        // Clean up on client disconnect
        controller.close = () => {
          isActive = false;
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
    console.error("Revenue SSE error:", error);

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

async function getRevenueData() {
  // During build time, return mock data
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  if (isBuildTime) {
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      topSellingProducts: [],
      revenueByCategory: [],
      monthlyTrends: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Get revenue analytics with optimized queries
  const [
    totalRevenueResult,
    monthlyRevenueResult,
    topProducts,
    categoryRevenue
  ] = await Promise.all([
    // Total revenue from all approved products
    prisma.product.aggregate({
      where: { status: "APPROVED" },
      _sum: { price: true }
    }),

    // Monthly revenue for current month
    prisma.product.aggregate({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { price: true }
    }),

    // Top selling products
    prisma.product.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        name: true,
        price: true,
        createdAt: true,
        User: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        Category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { price: "desc" },
      take: 10,
    }),

    // Revenue by category - include products and calculate manually
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            Product: true,
          },
        },
      },
    })
  ]);

  const totalRevenue = totalRevenueResult._sum.price || 0;
  const monthlyRevenue = monthlyRevenueResult._sum.price || 0;

  return {
    totalRevenue,
    monthlyRevenue,
    topSellingProducts: topProducts,
    revenueByCategory: categoryRevenue,
    timestamp: new Date().toISOString(),
  };
}
