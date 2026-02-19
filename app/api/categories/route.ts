import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    // Get categories with product counts (only approved products)
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        Product: {
          some: {
            status: "APPROVED"
          }
        }
      },
      include: {
        _count: {
          select: {
            Product: {
              where: {
                status: "APPROVED"
              }
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 3, // Limit to 3 categories since navbar shows Home + 3 categories = 4 total
    });

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      isActive: cat.isActive,
      count: cat._count.Product,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
