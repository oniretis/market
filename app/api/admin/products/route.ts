import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  // Skip authentication during build/static generation but still fetch real data
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" ||
    (process.env.NODE_ENV === "development" && process.env.npm_lifecycle_event === "build");

  try {
    console.log("Admin products API called");
    if (!isBuildTime) {
      await requireAdmin();
      console.log("Admin authentication successful");
    } else {
      console.log("Build time detected, returning empty products");
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        Category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${products.length} products`);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products API error:", error);

    // Handle specific authentication errors (only for runtime, not build time)
    if (!isBuildTime && error instanceof Error) {
      if (error.message.includes("Authentication required") || error.message.includes("Admin access required")) {
        console.log("Authentication failed:", error.message);
        return NextResponse.json(
          { error: "Authentication required. Please log in as an admin." },
          { status: 401 }
        );
      }
    }

    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
