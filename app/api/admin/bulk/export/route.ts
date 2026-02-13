import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/admin";
import prisma from "@/app/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert to CSV
    const headers = [
      'ID',
      'Name',
      'Price',
      'Category',
      'Description',
      'Seller Name',
      'Seller Email',
      'Created At',
      'Status'
    ];

    const csvRows = products.map(product => [
      product.id,
      `"${product.name.replace(/"/g, '""')}"`, // Escape quotes
      product.price,
      product.category,
      `"${product.smallDescription.replace(/"/g, '""')}"`,
      `${product.User.firstName} ${product.User.lastName}`,
      product.User.email,
      product.createdAt.toISOString(),
      product.isSold ? 'Sold' : 'Available'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    );
  }
}
