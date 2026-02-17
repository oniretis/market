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
            const data = await getActivityData();
            if (isActive) {
              controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            }
          } catch (error) {
            console.error('Error sending initial activity data:', error);
            if (isActive) {
              controller.enqueue(`data: ${JSON.stringify({ error: 'Failed to fetch data' })}\n\n`);
            }
          }
        };

        sendInitialData();

        // Set up periodic updates every 30 seconds for activity (more frequent)
        const interval = setInterval(async () => {
          if (!isActive) {
            clearInterval(interval);
            return;
          }

          try {
            const data = await getActivityData();
            if (isActive) {
              controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
            }
          } catch (error) {
            console.error('Error sending activity update:', error);
            if (isActive) {
              controller.enqueue(`data: ${JSON.stringify({ error: 'Failed to fetch data' })}\n\n`);
            }
          }
        }, 30000);

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
    console.error("Activity SSE error:", error);

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

async function getActivityData() {
  // During build time, return mock data
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  if (isBuildTime) {
    return {
      activities: [],
      timestamp: new Date().toISOString(),
    };
  }

  // Fetch activities with optimized queries
  const activities = await prisma.activity.findMany({
    select: {
      id: true,
      action: true,
      description: true,
      metadata: true,
      ipAddress: true,
      createdAt: true,
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100, // More activities for monitoring
  });

  return {
    activities,
    timestamp: new Date().toISOString(),
  };
}
