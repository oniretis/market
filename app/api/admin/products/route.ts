import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    console.log("Admin products API called");
    await requireAdmin();
    console.log("Admin authentication successful");

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
    // Handle build environment gracefully
    if (error instanceof Error && error.message.includes("Build environment")) {
      return NextResponse.json({ products: [] });
    }

    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
