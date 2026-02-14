import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    // Get categories and count products in each
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    const formattedCategories = categories.map(cat => ({
      name: cat.category,
      count: cat._count.category,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    // Handle build environment gracefully
    if (error instanceof Error && error.message.includes("Build environment")) {
      return NextResponse.json({ categories: [] });
    }

    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
