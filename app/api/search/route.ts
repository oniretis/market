import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        products: [],
        suggestions: [],
        categories: []
      });
    }

    const searchQuery = query.trim();

    // Get popular categories for suggestions
    const popularCategories = await prisma.category.findMany({
      where: {
        Product: {
          some: {
            status: 'APPROVED'
          }
        }
      },
      include: {
        _count: {
          select: {
            Product: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        }
      },
      orderBy: {
        Product: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Generate search suggestions based on product names and tags
    const suggestionProducts = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            Tag: {
              some: {
                Tag: {
                  name: {
                    contains: searchQuery,
                    mode: 'insensitive'
                  }
                }
              }
            }
          }
        ]
      },
      select: {
        name: true,
        Tag: {
          include: {
            Tag: true
          }
        }
      },
      take: 10
    });

    // Generate suggestions from product names and tags
    const suggestions = new Set<string>();
    suggestionProducts.forEach(product => {
      if (product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        suggestions.add(product.name);
      }
      product.Tag.forEach(tagRelation => {
        if (tagRelation.Tag.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          suggestions.add(tagRelation.Tag.name);
        }
      });
    });

    // Search approved products by name, description, and tags
    const products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            smallDescription: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            description: {
              path: [],
              string_contains: searchQuery
            }
          },
          {
            location: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            Tag: {
              some: {
                Tag: {
                  name: {
                    contains: searchQuery,
                    mode: 'insensitive'
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        User: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        Category: {
          select: {
            name: true,
            color: true
          }
        },
        Tag: {
          include: {
            Tag: true
          }
        },
        Review: {
          where: {
            isApproved: true
          },
          select: {
            rating: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: 20 // Limit results for performance
    });

    // Calculate average rating for each product
    const productsWithRatings = products.map((product: any) => ({
      ...product,
      averageRating: product.Review.length > 0
        ? product.Review.reduce((sum: number, review: any) => sum + review.rating, 0) / product.Review.length
        : 0,
      reviewCount: product.Review.length
    }));

    // Format categories for response
    const formattedCategories = popularCategories.map(cat => ({
      name: cat.name,
      count: cat._count.Product
    }));

    return NextResponse.json({
      products: productsWithRatings,
      suggestions: Array.from(suggestions).slice(0, 5),
      categories: formattedCategories,
      query: searchQuery
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
