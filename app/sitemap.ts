import { MetadataRoute } from 'next';
import prisma from './lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heywhymarketplace.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sell`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  try {
    // Get all approved products
    const products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    // Get all active categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        name: true,
      },
    });

    // Product pages
    const productPages = products.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Category pages
    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/products/${category.name.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if database fails
    return staticPages;
  }
}
