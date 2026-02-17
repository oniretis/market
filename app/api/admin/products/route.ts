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

    // Handle specific authentication errors
    if (error instanceof Error) {
      if (error.message.includes("Build environment")) {
        console.log("Build environment detected, returning empty products");
        return NextResponse.json({ products: [] });
      }

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
